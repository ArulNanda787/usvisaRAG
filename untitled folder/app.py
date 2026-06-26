"""
Thomas — US Visa RAG Assistant
Run: streamlit run app.py
"""

import os
import streamlit as st
from pathlib import Path

# ── Page config ───────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Thomas — US Visa Assistant",
    page_icon="🗽",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ── Hardcoded defaults ────────────────────────────────────────────────────────
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
MODEL        = "llama-3.3-70b-versatile"
TOP_K        = 8
CHROMA_DIR   = "chroma_db"
COLLECTION   = "visa_rag"
EMBED_MODEL  = "all-MiniLM-L6-v2"

# ── Custom CSS ────────────────────────────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

:root {
    --navy:   #0a1628;
    --blue:   #1a3a6b;
    --mid:    #2d5fa6;
    --accent: #c8922a;
    --gold:   #e8b84b;
    --cream:  #faf8f3;
    --muted:  #8a9ab5;
    --border: rgba(26,58,107,0.15);
}

html, body, [class*="css"] {
    font-family: 'DM Sans', sans-serif;
    background-color: var(--cream) !important;
    color: var(--navy);
}

/* Hide Streamlit chrome and sidebar entirely */
#MainMenu, footer, header { visibility: hidden; }
[data-testid="collapsedControl"] { display: none !important; }
section[data-testid="stSidebar"] { display: none !important; }
.block-container {
    padding-top: 0rem !important;
    max-width: 860px;
    margin: auto;
}

/* Top banner */
.visa-header {
    background: linear-gradient(135deg, var(--navy) 0%, var(--blue) 60%, var(--mid) 100%);
    border-radius: 0 0 24px 24px;
    padding: 2.2rem 2.5rem 2rem;
    margin: -1rem -1rem 1.5rem;
    box-shadow: 0 4px 32px rgba(10,22,40,0.18);
    position: relative;
    overflow: hidden;
}
.visa-header::before {
    content: "";
    position: absolute;
    top: -40px; right: -40px;
    width: 220px; height: 220px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(200,146,42,0.22), transparent 70%);
}
.visa-header h1 {
    font-family: 'DM Serif Display', serif;
    font-size: 2.1rem;
    color: #fff;
    margin: 0 0 0.25rem;
    letter-spacing: -0.5px;
}
.visa-header p {
    color: rgba(255,255,255,0.7);
    font-size: 0.97rem;
    margin: 0;
    font-weight: 300;
}
.header-badge {
    display: inline-block;
    background: rgba(200,146,42,0.25);
    border: 1px solid var(--accent);
    color: var(--gold);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 20px;
    margin-bottom: 0.7rem;
}

/* Empty state — lives inside the header gradient area */
.empty-state {
    text-align: center;
    padding: 2.5rem 1rem 1rem;
}
.empty-state .icon { font-size: 2.8rem; margin-bottom: 0.6rem; }
.empty-state h3 {
    font-family: 'DM Serif Display', serif;
    font-size: 1.9rem;
    color: #ffffff;
    margin-bottom: 0.35rem;
}
.empty-state p {
    color: rgba(255,255,255,0.6);
    font-size: 0.93rem;
    margin: 0;
}

/* Suggested questions label */
.sq-label {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.9px;
    text-transform: uppercase;
    color: var(--muted);
    margin: 1.2rem 0 0.5rem;
}

/* Chat bubbles */
.user-bubble {
    background: linear-gradient(135deg, var(--blue), var(--mid));
    color: #fff;
    border-radius: 18px 18px 4px 18px;
    padding: 0.85rem 1.1rem;
    margin: 0.5rem 0 0.5rem 10%;
    font-size: 0.95rem;
    line-height: 1.5;
    box-shadow: 0 2px 12px rgba(26,58,107,0.2);
}
.assistant-bubble {
    background: #fff;
    color: var(--navy);
    border-radius: 18px 18px 18px 4px;
    padding: 1rem 1.2rem;
    margin: 0.5rem 10% 0.5rem 0;
    font-size: 0.95rem;
    line-height: 1.6;
    border: 1px solid var(--border);
    box-shadow: 0 2px 16px rgba(10,22,40,0.07);
}
.assistant-bubble ul { margin: 0.5rem 0 0.5rem 1.2rem; padding: 0; }
.assistant-bubble li { margin-bottom: 0.3rem; }

/* Source pills */
.sources-bar {
    margin-top: 0.9rem;
    padding-top: 0.7rem;
    border-top: 1px solid var(--border);
}
.sources-bar .src-label {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 0.4rem;
}
.source-pill {
    display: inline-block;
    background: rgba(45,95,166,0.08);
    border: 1px solid rgba(45,95,166,0.2);
    color: var(--mid);
    font-size: 0.72rem;
    padding: 3px 9px;
    border-radius: 20px;
    margin: 2px 3px 2px 0;
    text-decoration: none;
}

/* Category tag */
.cat-tag {
    display: inline-block;
    background: rgba(200,146,42,0.12);
    color: var(--accent);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 12px;
    margin-right: 5px;
    border: 1px solid rgba(200,146,42,0.3);
}

/* Input */
.stTextInput > div > div > input {
    border-radius: 12px !important;
    border: 2px solid var(--border) !important;
    background: #fff !important;
    color: var(--navy) !important;
    font-family: 'DM Sans', sans-serif !important;
    font-size: 0.95rem !important;
    padding: 0.75rem 1rem !important;
    transition: border-color 0.2s;
}
.stTextInput > div > div > input:focus {
    border-color: var(--mid) !important;
    box-shadow: 0 0 0 3px rgba(45,95,166,0.1) !important;
}

/* Buttons */
.stButton > button {
    border-radius: 10px !important;
    font-family: 'DM Sans', sans-serif !important;
    font-weight: 500 !important;
    border: none !important;
    transition: all 0.2s !important;
}
.stButton > button[kind="primary"] {
    background: linear-gradient(135deg, var(--blue), var(--mid)) !important;
    color: #fff !important;
}
.stButton > button:hover {
    transform: translateY(-1px) !important;
    box-shadow: 0 4px 16px rgba(26,58,107,0.3) !important;
}

/* Thinking dots */
.thinking-bar {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    color: var(--muted);
    font-size: 0.88rem;
    padding: 0.6rem 0;
}
.dot-pulse { display: inline-flex; gap: 4px; }
.dot-pulse span {
    width: 6px; height: 6px;
    background: var(--mid);
    border-radius: 50%;
    animation: pulse 1.2s infinite;
}
.dot-pulse span:nth-child(2) { animation-delay: 0.2s; }
.dot-pulse span:nth-child(3) { animation-delay: 0.4s; }
@keyframes pulse {
    0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
    40%            { transform: scale(1);   opacity: 1;   }
}

/* Error */
.error-bubble {
    background: #fff5f5;
    border: 1px solid #fca5a5;
    border-radius: 12px;
    padding: 0.9rem 1.1rem;
    color: #991b1b;
    font-size: 0.9rem;
    margin: 0.5rem 0;
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
</style>
""", unsafe_allow_html=True)


# ── Load RAG (cached) ─────────────────────────────────────────────────────────
@st.cache_resource(show_spinner="Loading Thomas's knowledge base…")
def load_rag():
    import chromadb
    from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
    from groq import Groq

    if not Path(CHROMA_DIR).exists():
        return None, None, "chroma_missing"

    embed_fn   = SentenceTransformerEmbeddingFunction(model_name=EMBED_MODEL)
    client     = chromadb.PersistentClient(path=CHROMA_DIR)
    collection = client.get_or_create_collection(
        name=COLLECTION,
        embedding_function=embed_fn,
        metadata={"hnsw:space": "cosine"},
    )
    api_key     = os.environ.get("GROQ_API_KEY", GROQ_API_KEY)
    groq_client = Groq(api_key=api_key) if api_key else None
    return collection, groq_client, "ok"


# ── RAG pipeline ──────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are Thomas, a helpful US visa assistant specialising in non-immigrant visas
for applicants based in India. Answer the user's question using ONLY the context passages provided.
Rules:
- Be concise and factual. Use bullet points where helpful.
- If the context does not contain enough information, say so honestly — do not guess.
- Always mention the relevant visa category when applicable (e.g. B-1/B-2, F-1, H-1B).
- End your answer with a Sources section listing the unique source URLs used."""


def ask(question: str, collection, groq_client) -> dict:
    fee_keywords = ["fee", "cost", "how much", "price", "mrv", "payment", "amount"]
    is_fee_query = any(kw in question.lower() for kw in fee_keywords)

    results = collection.query(
        query_texts=[question],
        n_results=TOP_K,
        include=["documents", "metadatas", "distances"],
    )

    bonus = []
    if is_fee_query:
        fee_res = collection.query(
            query_texts=["visa application fee amount USD dollars"],
            n_results=4,
            include=["documents", "metadatas", "distances"],
            where={"category": "visa_fees"},
        )
        bonus = list(zip(
            fee_res["documents"][0],
            fee_res["metadatas"][0],
            fee_res["distances"][0],
        ))

    all_raw = list(zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
    )) + bonus

    context_blocks, sources, categories = [], [], set()
    seen = set()
    for doc, meta, dist in all_raw:
        if dist > 0.65:
            continue
        fp = doc[:100]
        if fp in seen:
            continue
        seen.add(fp)
        context_blocks.append(
            f"Category: {meta['category']} | Heading: {meta['heading']}\n{doc}"
        )
        url = meta.get("source_url", "")
        if url and url not in sources:
            sources.append(url)
        cat = meta.get("category", "")
        if cat:
            categories.add(cat)

    if not context_blocks:
        return {
            "answer": "I couldn't find relevant information for that question in my knowledge base.",
            "sources": [],
            "categories": [],
        }

    if groq_client is None:
        return {
            "answer": "⚠️ Groq API key not set. Please set the GROQ_API_KEY environment variable before starting the app.",
            "sources": sources,
            "categories": list(categories),
        }

    sources_text = "\n".join(f"- {u}" for u in sources)
    user_prompt  = (
        f"Context:\n{chr(10).join(context_blocks)}\n\n"
        f"Real source URLs (use ONLY these):\n{sources_text}\n\n"
        f"Question: {question}"
    )

    response = groq_client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_prompt},
        ],
        temperature=0.2,
        max_tokens=1024,
    )
    return {
        "answer": response.choices[0].message.content.strip(),
        "sources": sources,
        "categories": list(categories),
    }


# ── Session state ─────────────────────────────────────────────────────────────
if "messages" not in st.session_state:
    st.session_state.messages = []
if "pending_question" not in st.session_state:
    st.session_state.pending_question = ""


# ── Header ────────────────────────────────────────────────────────────────────
st.markdown("""
<div class="visa-header">
    <div class="header-badge">🇺🇸 RAG Assistant</div>
    <h1>Thomas — the US Visa Assistant</h1>
    <p>Ask anything about non-immigrant visas, DS-160, fees, wait times, and more.</p>
</div>
""", unsafe_allow_html=True)


# ── Empty state + suggested questions ────────────────────────────────────────
SUGGESTED = [
    "What documents do I need for a B-2 tourist visa?",
    "How much is the MRV fee for B1/B2?",
    "What happens if my visa is denied under 214(b)?",
    "How do I fill the DS-160 form?",
    "How long are appointment wait times in India?",
    "What should I bring to my VAC appointment?",
]

if not st.session_state.messages:
    st.markdown("""
    <div class="empty-state">
        <div class="icon">🗽</div>
        <h3>Ask Thomas…</h3>
        <p>Your US visa questions, answered instantly.</p>
    </div>
    """, unsafe_allow_html=True)
    st.markdown('<p class="sq-label">Suggested questions</p>', unsafe_allow_html=True)
    cols = st.columns(3)
    for i, q in enumerate(SUGGESTED):
        with cols[i % 3]:
            if st.button(q, key=f"sq_{i}", use_container_width=True):
                st.session_state.pending_question = q
                st.rerun()


# ── Render helpers ────────────────────────────────────────────────────────────
def render_assistant_bubble(content, sources, categories):
    tags_html = "".join(
        f'<span class="cat-tag">{c.replace("_", " ")}</span>'
        for c in categories
    )
    pills_html = "".join(
        f'<a class="source-pill" href="{url}" target="_blank">'
        f'{url.split("/")[2] if url.startswith("http") else url}</a>'
        for url in sources
    )
    sources_section = f"""
    <div class="sources-bar">
        <div class="src-label">Sources</div>
        {pills_html}
    </div>
    """ if pills_html else ""

    st.markdown(f"""
    <div class="assistant-bubble">
        {tags_html}
        <div style="margin-top:{'0.5rem' if tags_html else '0'}">
            {content.replace(chr(10), '<br>')}
        </div>
        {sources_section}
    </div>
    """, unsafe_allow_html=True)


# ── Chat history ──────────────────────────────────────────────────────────────
for msg in st.session_state.messages:
    if msg["role"] == "user":
        st.markdown(f'<div class="user-bubble">{msg["content"]}</div>', unsafe_allow_html=True)
    else:
        render_assistant_bubble(
            msg["content"], msg.get("sources", []), msg.get("categories", [])
        )


# ── Input bar ─────────────────────────────────────────────────────────────────
col_input, col_btn = st.columns([5, 1])
with col_input:
    question = st.text_input(
        "question",
        value=st.session_state.pending_question,
        placeholder="Ask Thomas about visas, fees, documents, wait times…",
        label_visibility="collapsed",
        key="question_input",
    )
with col_btn:
    send = st.button("Ask →", type="primary", use_container_width=True)

if st.session_state.pending_question:
    st.session_state.pending_question = ""


# ── Handle submission ─────────────────────────────────────────────────────────
if (send or question) and question.strip():
    try:
        collection, groq_client, status = load_rag()
    except Exception as e:
        st.markdown(
            f'<div class="error-bubble">❌ Failed to load knowledge base: <code>{e}</code><br><br>'
            f'<strong>Fix:</strong> Activate your venv and run:<br>'
            f'<code>pip install chromadb sentence-transformers groq</code></div>',
            unsafe_allow_html=True,
        )
        st.stop()

    if status == "chroma_missing":
        st.markdown(
            '<div class="error-bubble">⚠️ <strong>chroma_db not found.</strong> '
            'Make sure the <code>chroma_db/</code> folder is in the same directory as <code>app.py</code>.</div>',
            unsafe_allow_html=True,
        )
        st.stop()

    st.session_state.messages.append({"role": "user", "content": question.strip()})
    st.markdown(f'<div class="user-bubble">{question.strip()}</div>', unsafe_allow_html=True)

    thinking = st.empty()
    thinking.markdown("""
    <div class="thinking-bar">
        <div class="dot-pulse"><span></span><span></span><span></span></div>
        Thomas is thinking…
    </div>
    """, unsafe_allow_html=True)

    try:
        result = ask(question.strip(), collection, groq_client)
    except Exception as e:
        thinking.empty()
        st.markdown(f'<div class="error-bubble">❌ {e}</div>', unsafe_allow_html=True)
        st.stop()

    thinking.empty()

    st.session_state.messages.append({
        "role": "assistant",
        "content": result["answer"],
        "sources": result["sources"],
        "categories": result["categories"],
    })
    render_assistant_bubble(result["answer"], result["sources"], result["categories"])