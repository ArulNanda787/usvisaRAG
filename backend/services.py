import asyncio
from functools import partial
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
from groq import Groq
from config import settings
from functools import lru_cache

@lru_cache()
def get_embed_model() -> SentenceTransformer:
    return SentenceTransformer(EMBED_MODEL)
# ── Constants ─────────────────────────────────────────────────────────────────
PINECONE_INDEX  = "visa-rag"
EMBED_MODEL     = "all-MiniLM-L6-v2"
LLM_MODEL       = "llama-3.3-70b-versatile"
SCORE_THRESHOLD = 0.35
TOP_K           = 8
FEE_KEYWORDS    = ["fee", "cost", "how much", "price", "mrv", "payment"]

SYSTEM_PROMPT = """You are Thomas, a precise and friendly US visa assistant specialising in
non-immigrant visas for applicants based in India.
Answer using ONLY the context passages provided.
Rules:
- Be concise and factual. Use bullet points where helpful.
- If the context does not contain enough information, say so honestly — do not guess.
- Always mention the relevant visa category when applicable (e.g. B-1/B-2, F-1, H-1B).
- End your answer with a Sources section listing the unique source URLs used."""


# ── Client loaders (called once at startup) ───────────────────────────────────
def load_pinecone_index():
    return Pinecone(api_key=settings.pinecone_api_key).Index(PINECONE_INDEX)

def load_groq_client() -> Groq:
    return Groq(api_key=settings.groq_api_key)


# ── Embedding (CPU-bound → run in thread so it doesn't block the event loop) ──
async def embed_async(text: str, model: SentenceTransformer) -> list[float]:
    loop = asyncio.get_event_loop()
    fn   = partial(model.encode, text, normalize_embeddings=True)
    vec  = await loop.run_in_executor(None, fn)
    return vec.tolist()


# ── Retrieve ──────────────────────────────────────────────────────────────────
async def retrieve(query: str, index) -> list[dict]:
    embed_model = get_embed_model()
    query_vector = await embed_async(query, embed_model)

    # Primary query
    res     = index.query(vector=query_vector, top_k=TOP_K, include_metadata=True)
    matches = res.get("matches", [])

    # Fee boost — second query merged in
    if any(k in query.lower() for k in FEE_KEYWORDS):
        fee_vector = await embed_async("visa fee amount USD", embed_model)
        fee_res    = index.query(vector=fee_vector, top_k=3, include_metadata=True)
        matches   += fee_res.get("matches", [])

    # Filter by score
    results = [
        {
            "content":    m["metadata"].get("content", ""),
            "heading":    m["metadata"].get("heading", ""),
            "category":   m["metadata"].get("category", ""),
            "source_url": m["metadata"].get("source_url", ""),
            "similarity": m["score"],
        }
        for m in matches if m["score"] >= SCORE_THRESHOLD
    ]

    # Deduplicate
    seen, deduped = set(), []
    for r in results:
        key = r["content"][:100]
        if key not in seen:
            seen.add(key)
            deduped.append(r)

    # Fallback — return raw top matches if nothing passed threshold
    if len(deduped) < 2:
        deduped = [
            {
                "content":    m["metadata"].get("content", ""),
                "heading":    m["metadata"].get("heading", ""),
                "category":   m["metadata"].get("category", ""),
                "source_url": m["metadata"].get("source_url", ""),
                "similarity": m["score"],
            }
            for m in matches
        ]

    return deduped


# ── Ask ───────────────────────────────────────────────────────────────────────
async def ask(query: str, index, groq_client: Groq) -> dict:
    chunks = await retrieve(query, index)

    if not chunks:
        return {
            "answer": (
                "I couldn't find relevant information for that question. "
                "Please try rephrasing, or ask about a specific visa type, fee, or document."
            ),
            "sources":    [],
            "categories": [],
        }

    context_blocks, sources, categories = [], [], set()
    for c in chunks:
        context_blocks.append(
            f"Category: {c['category']} | Heading: {c['heading']}\n{c['content']}"
        )
        if c.get("source_url") and c["source_url"] not in sources:
            sources.append(c["source_url"])
        if c.get("category"):
            categories.add(c["category"])

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": (
                f"Context:\n{chr(10).join(context_blocks)}\n\n"
                f"Sources available:\n" + "\n".join(f"- {u}" for u in sources) +
                f"\n\nQuestion: {query}"
            ),
        },
    ]

    # Groq is an HTTP call — run in executor so it doesn't block either
    loop     = asyncio.get_event_loop()
    response = await loop.run_in_executor(
        None,
        partial(
            groq_client.chat.completions.create,
            model=LLM_MODEL,
            messages=messages,
            temperature=0.2,
            max_tokens=1024,
        ),
    )

    return {
        "answer":     response.choices[0].message.content.strip(),
        "sources":    sources,
        "categories": list(categories),
    }