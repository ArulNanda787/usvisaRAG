from __future__ import annotations
import asyncio
from functools import partial, lru_cache
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone
from groq import Groq
from config import settings


# ── Constants ─────────────────────────────────────────────────────────────────
PINECONE_INDEX    = "visa-rag"
EMBED_MODEL       = "all-MiniLM-L6-v2"
LLM_MODEL         = "llama-3.3-70b-versatile"
SCORE_THRESHOLD   = 0.35
TOP_K             = 8
FEE_KEYWORDS      = ["fee", "cost", "how much", "price", "mrv", "payment"]
MAX_HISTORY_TURNS = 10
MAX_SUMMARY_CHARS = 800

# ── Prompts ───────────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are Thomas, a precise and friendly US visa assistant specialising in
non-immigrant visas for applicants based in India.
Answer using ONLY the context passages provided.
Rules:
- Be concise and factual. Use bullet points where helpful.
- If the context does not contain enough information, say so honestly — dont guess.
- Always mention the relevant visa category when applicable (eg. B-1/B-2, F-1).
- NEVER ask the user for information they have already provided in the conversation.
- If the user's situation is clear from the conversation summary, give a direct answer — do not ask clarifying questions you already have the answer to.
- STRICTLY stay on US visa topics. If the question is not about US visas, immigration, or travel to the US, do not answer it — instead say you can only help with US visa related questions.
- Do not make up information. If the context doesn't cover it, say so.
- Match answer length to question complexity. Simple questions get 1-3 sentences. Only use bullet points or longer answers when genuinely needed."""


CLASSIFIER_PROMPT = """You are a strict query classifier for a US visa assistant.
Respond with ONLY "True" or "False".
Reply "True" ONLY if the message is directly related to: US visas, US immigration, visa applications, visa fees, visa documents, DS-160, SEVIS, consulate appointments, visa interviews, visa denials, OPT, CPT, study in the US, work in the US, or travel to the US.
Reply "False" for anything else — greetings, casual chat, opinions, news, math, coding, or any non-visa topic."""

CONVERSATIONAL_PROMPT = """You are Thomas, a US visa assistant strictly for India-based applicants.
You ONLY discuss US visa related topics. If the user says anything unrelated to US visas, immigration, or travel to the US, politely but firmly redirect them.
Do not answer questions about other countries, general travel, coding, news, opinions, or anything outside US visa topics.
IMPORTANT: Never ask for information already established in the conversation summary. If the user's visa type or situation is already known, reference it directly.Keep responses short and conversational unless the question requires detail. 1-3 sentences is ideal for simple questions."""

SUMMARIZER_PROMPT = """You maintain a running summary of a visa assistance conversation.
Given the existing summary and the latest exchange, return an updated summary in 2-3 sentences max.
Focus only on visa-relevant facts: visa type, documents mentioned, timelines, user's situation.
IMPORTANT: Never drop confirmed facts such as the user's visa type, course of study, or destination — these must always be retained in the summary.
Return ONLY the updated summary, no preamble."""


# ── Client / model loaders ────────────────────────────────────────────────────
@lru_cache()
def get_embed_model() -> SentenceTransformer:
    return SentenceTransformer(EMBED_MODEL)

def load_pinecone_index():
    return Pinecone(api_key=settings.pinecone_api_key).Index(PINECONE_INDEX)

def load_groq_client() -> Groq:
    return Groq(api_key=settings.groq_api_key)


# ── Embedding ─────────────────────────────────────────────────────────────────
async def embed_async(text: str, model: SentenceTransformer) -> list[float]:
    loop = asyncio.get_event_loop()
    vec  = await loop.run_in_executor(None, partial(model.encode, text, normalize_embeddings=True))
    return vec.tolist()



# ── Retrieve ──────────────────────────────────────────────────────────────────
async def retrieve(query: str, index) -> list[dict]:
    embed_model  = get_embed_model()
    query_vector = await embed_async(query, embed_model)

    res     = index.query(vector=query_vector, top_k=TOP_K, include_metadata=True)
    matches = res.get("matches", [])

    if any(k in query.lower() for k in FEE_KEYWORDS):
        fee_vector = await embed_async("visa fee amount USD", embed_model)
        fee_res    = index.query(vector=fee_vector, top_k=3, include_metadata=True)
        matches   += fee_res.get("matches", [])

    def to_chunk(m):
        return {
            "content":    m["metadata"].get("content", ""),
            "heading":    m["metadata"].get("heading", ""),
            "category":   m["metadata"].get("category", ""),
            "source_url": m["metadata"].get("source_url", ""),
            "similarity": m["score"],
        }

    results = [to_chunk(m) for m in matches if m["score"] >= SCORE_THRESHOLD]

    seen, deduped = set(), []
    for r in results:
        key = r["content"][:100]
        if key not in seen:
            seen.add(key)
            deduped.append(r)

    if len(deduped) < 2:
        deduped = [to_chunk(m) for m in matches]

    return deduped


# ── Classifier ────────────────────────────────────────────────────────────────
async def _is_visa_query(query: str, groq_client: Groq) -> bool:
    loop     = asyncio.get_event_loop()
    response = await loop.run_in_executor(
        None,
        partial(
            groq_client.chat.completions.create,
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": CLASSIFIER_PROMPT},
                {"role": "user",   "content": query},
            ],
            temperature=0,
            max_tokens=5,
        ),
    )
    return response.choices[0].message.content.strip() == "True"


# ── Summarizer ────────────────────────────────────────────────────────────────
async def summarize_exchange(
    existing_summary: str,
    user_message: str,
    assistant_reply: str,
    groq_client: Groq,
) -> str:
    compression_note = (
        " The existing summary is getting long — compress it aggressively, drop older less-relevant details."
        if len(existing_summary) > MAX_SUMMARY_CHARS else ""
    )
    loop     = asyncio.get_event_loop()
    response = await loop.run_in_executor(
        None,
        partial(
            groq_client.chat.completions.create,
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": SUMMARIZER_PROMPT + compression_note},
                {"role": "user",   "content": (
                    f"Existing summary: {existing_summary or 'None yet.'}\n\n"
                    f"User: {user_message}\n"
                    f"Assistant: {assistant_reply}"
                )},
            ],
            temperature=0,
            max_tokens=150,
        ),
    )
    return response.choices[0].message.content.strip()


# ── Ask ───────────────────────────────────────────────────────────────────────
async def ask(
    query: str,
    index,
    groq_client: Groq,
    summary: str = "",
    history: list[dict] | None = None,
    category: str = "",
    category_label: str = "",
    category_subtitle: str = "",
) -> dict:
    # FIFO trim — keep last N turns (each turn = 1 user + 1 assistant message)
    trimmed_history = (history or [])[-(MAX_HISTORY_TURNS * 2):]
    system = SYSTEM_PROMPT
    if category_label:
           system += f"\n\nThe user is asking about {category_label} visas ({category_subtitle}). ONLY answer in the context of {category_label} visas. Do not default to B-1/B-2 examples unless explicitly asked."
    if summary:
        system += f"\n\nConversation so far: {summary}"
    # ── Conversational path ──
    if not await _is_visa_query(query, groq_client):
        loop     = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            partial(
                groq_client.chat.completions.create,
                model=LLM_MODEL,
                messages=[
                    {"role": "system", "content": CONVERSATIONAL_PROMPT + ("\n\nConversation so far: " + summary if summary else "")},
                    *trimmed_history,
                    {"role": "user", "content": query},
                ],
                temperature=0.5,
                max_tokens=200,
            ),
        )
        answer      = response.choices[0].message.content.strip()
        new_summary = await summarize_exchange(summary, query, answer, groq_client)
        return {"answer": answer, "sources": [], "categories": [], "summary": new_summary}

    # Enrich the query with conversation context for better retrieval
    retrieval_query = query
    if category_label and len(query.split()) < 6:
        # Short follow-up questions like "How do I apply?" get no context from embeddings alone
        retrieval_query = f"{query} {category_label} visa"
    elif summary and len(query.split()) < 6:
        retrieval_query = f"{query} {summary[:100]}"

    chunks = await retrieve(retrieval_query, index)
    # ── RAG path ──

    if not chunks:
        return {
            "answer": (
                "I couldn't find relevant information for that question. "
                "Please try rephrasing, or ask about a specific visa type, fee, or document."
            ),
            "sources":    [],
            "categories": [],
            "summary":    summary,  # unchanged
        }

    context_blocks, sources, categories = [], [], set()
    for c in chunks:
        context_blocks.append(f"Category: {c['category']} | Heading: {c['heading']}\n{c['content']}")
        if c.get("source_url") and c["source_url"] not in sources:
            sources.append(c["source_url"])
        if c.get("category"):
            categories.add(c["category"])

    loop     = asyncio.get_event_loop()
    response = await loop.run_in_executor(
        None,
        partial(
            groq_client.chat.completions.create,
            model=LLM_MODEL,
            messages=[
                {"role": "system", "content": system},
                *trimmed_history,
                {
                    "role": "user",
                    "content": (
                        f"Context:\n{chr(10).join(context_blocks)}\n\n"
                        f"Sources available:\n" + "\n".join(f"- {u}" for u in sources) +
                        f"\n\nQuestion: {query}"
                    ),
                },
            ],
            temperature=0.2,
            max_tokens=1024,
        ),
    )

    answer      = response.choices[0].message.content.strip()
    new_summary = await summarize_exchange(summary, query, answer, groq_client)

    return {
        "answer":     answer,
        "sources":    sources,
        "categories": list(categories),
        "summary":    new_summary,
    }