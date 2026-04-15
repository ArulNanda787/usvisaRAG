"""
Thomas — US Visa RAG Assistant (Supabase · Premium Edition)
Run: streamlit run app.py
"""

import os
import streamlit as st
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from supabase import create_client
from groq import Groq
from pinecone import Pinecone

# ── Load env ─────────────────────────────────────────────────────────────────
load_dotenv()

# ── Page config ───────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Thomas — US Visa Assistant",
    page_icon="🗽",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ── Constants ─────────────────────────────────────────────────────────────────
MODEL = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = """You are Thomas, a precise and friendly US visa assistant specialising in
non-immigrant visas for applicants based in India.
Answer using ONLY the context passages provided.
Rules:
- Be concise and factual. Use bullet points where helpful.
- If the context does not contain enough information, say so honestly — do not guess.
- Always mention the relevant visa category when applicable (e.g. B-1/B-2, F-1, H-1B).
- End your answer with a Sources section listing the unique source URLs used."""

SUGGESTED = [
    ("🧳", "B-2 Tourist Visa",      "What documents do I need for a B-2 tourist visa?"),
    ("💰", "MRV Fee",               "How much is the MRV fee for a B1/B2 visa?"),
    ("📋", "DS-160 Form",           "How do I correctly fill out the DS-160 form?"),
    ("⏳", "Wait Times",            "What are the wait times for appointments?"),
    ("❌", "214(b) Denial",         "What happens if my visa is denied under 214(b)?"),
    ("🏢", "VAC Appointment",       "What documents should I bring to my VAC appointment?"),
]

CATEGORY_COLORS = {
    "visa_fees":       "#e8b84b",
    "b1_b2":          "#5b8dee",
    "f1":             "#38c9a0",
    "h1b":            "#e07b5b",
    "ds160":          "#a78bfa",
    "documents":      "#60a5fa",
    "wait_times":     "#f472b6",
}

# ── Clients (cached) ──────────────────────────────────────────────────────────
@st.cache_resource(show_spinner=False)
def load_clients():
    pc  = Pinecone(api_key=os.environ["PINECONE_API_KEY"])
    index = pc.Index("visa-rag")  
    gc  = Groq(api_key=os.environ["GROQ_API_KEY"])
    return index, gc

@st.cache_resource(show_spinner=False)
def get_embedder():
    return SentenceTransformer("all-MiniLM-L6-v2")


# ── RAG ───────────────────────────────────────────────────────────────────────
def retrieve(query: str, index, top_k: int = 8):
    # 1. Embed query (IMPORTANT: same normalization)
    embed_model = get_embedder()
    query_embedding = embed_model.encode(
        query,
        normalize_embeddings=True
    ).tolist()

    # 2. Query Pinecone
    res = index.query(
        vector=query_embedding,
        top_k=top_k,
        include_metadata=True
    )

    matches = res.get("matches", [])
    # 🔥 Fee-specific boost
    fee_keywords = ["fee", "cost", "how much", "price", "mrv", "payment"]

    if any(k in query.lower() for k in fee_keywords):
        fee_res = index.query(
            vector=embed_model.encode(
                "visa fee amount USD",
                normalize_embeddings=True
            ).tolist(),
            top_k=3,
            include_metadata=True
        )
        matches += fee_res.get("matches", [])
    print("\n--- RAW PINECONE ---")
    for m in matches:
        print(f"{round(m['score'],3)} | {m['metadata'].get('heading')}")

    # 3. Light filtering (scores closer to 1 = better)
    results = []
    for m in matches:
        score = m["score"]

        if score < 0.35:   # 🔥 tweakable
            continue

        meta = m["metadata"]

        results.append({
            "content": meta.get("content", ""),
            "heading": meta.get("heading", ""),
            "category": meta.get("category", ""),
            "source_url": meta.get("source_url", ""),
            "similarity": score,
        })

    # 4. Deduplicate
    seen = set()
    deduped = []
    for r in results:
        key = r["content"][:100]
        if key in seen:
            continue
        seen.add(key)
        deduped.append(r)

    results = deduped

    # 5. Fallback (VERY important)
    if len(results) < 2:
        results = [
            {
                "content": m["metadata"].get("content", ""),
                "heading": m["metadata"].get("heading", ""),
                "category": m["metadata"].get("category", ""),
                "source_url": m["metadata"].get("source_url", ""),
                "similarity": m["score"],
            }
            for m in matches
        ]

    print("\n--- FINAL RETRIEVED ---")
    for r in results:
        print(f"{round(r['similarity'],3)} | {r['heading']}")

    return results


def ask(question: str, index, groq_client) -> dict:
    chunks = retrieve(question, index)

    if not chunks:
        return {
            "answer": "I couldn't find relevant information for that question in my knowledge base. "
                      "Please try rephrasing, or ask about a specific visa type, fee, or document.",
            "sources": [],
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


    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.append({
        "role": "user",
        "content": (
            f"Context:\n{chr(10).join(context_blocks)}\n\n"
            f"Sources available:\n" + "\n".join(f"- {u}" for u in sources) +
            f"\n\nQuestion: {question}"
        ),
    })

    response = groq_client.chat.completions.create(
        model=MODEL,
        messages=messages,
        temperature=0.2,
        max_tokens=1024,
    )
    return {
        "answer": response.choices[0].message.content.strip(),
        "sources": sources,
        "categories": list(categories),
    }


# ══════════════════════════════════════════════════════════════════════════════
# CSS
# ══════════════════════════════════════════════════════════════════════════════
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Sora:wght@300;400;500;600&display=swap');

/* ── Root tokens ── */
:root {
    --bg:        #0d1117;
    --surface:   #161b22;
    --surface2:  #1c2230;
    --border:    rgba(255,255,255,0.07);
    --navy:      #0a1628;
    --blue:      #1a56db;
    --mid:       #3b82f6;
    --accent:    #e8b84b;
    --gold:      #f5c842;
    --text:      #e6edf3;
    --muted:     #8b949e;
    --radius:    16px;
    --shadow:    0 8px 32px rgba(0,0,0,0.4);
}

html, body, [class*="css"] {
    font-family: 'Sora', sans-serif;
    background-color: var(--bg) !important;
    color: var(--text) !important;
}

/* ── Streamlit chrome removal ── */
#MainMenu, footer, header { visibility: hidden !important; }
[data-testid="collapsedControl"] { display: none !important; }
section[data-testid="stSidebar"]  { display: none !important; }
.block-container {
    padding: 0 !important;
    max-width: 900px !important;
    margin: auto !important;
}

/* ── Top masthead ── */
.masthead {
    position: relative;
    overflow: hidden;
    background: linear-gradient(160deg, #0a1628 0%, #0d1f40 45%, #0a1628 100%);
    border-bottom: 1px solid var(--border);
    padding: 2.6rem 2.8rem 2rem;
    margin-bottom: 0;
}
.masthead-noise {
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    opacity: 0.6;
}
.masthead-glow {
    position: absolute;
    top: -80px; right: -60px;
    width: 320px; height: 320px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(232,184,75,0.12) 0%, transparent 70%);
    pointer-events: none;
}
.masthead-glow2 {
    position: absolute;
    bottom: -100px; left: 40px;
    width: 260px; height: 260px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%);
    pointer-events: none;
}
.masthead-inner {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
}
.masthead-left {}
.masthead-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(232,184,75,0.12);
    border: 1px solid rgba(232,184,75,0.35);
    color: var(--gold);
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 20px;
    margin-bottom: 0.8rem;
}
.masthead h1 {
    font-family: 'Playfair Display', serif;
    font-size: 2.4rem;
    font-weight: 700;
    color: #fff;
    margin: 0 0 0.35rem;
    line-height: 1.15;
    letter-spacing: -0.5px;
}
.masthead h1 em {
    font-style: italic;
    color: var(--gold);
}
.masthead-sub {
    color: rgba(255,255,255,0.5);
    font-size: 0.9rem;
    font-weight: 300;
    margin: 0;
}
.masthead-stat {
    text-align: right;
    white-space: nowrap;
}
.masthead-stat .num {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    color: var(--gold);
    line-height: 1;
}
.masthead-stat .lbl {
    font-size: 0.7rem;
    color: var(--muted);
    letter-spacing: 0.8px;
    text-transform: uppercase;
    margin-top: 3px;
}

/* ── Chat area wrapper ── */
.chat-area {
    padding: 1.5rem 2.8rem 0;
    min-height: auto;
}

/* ── Empty / welcome state ── */
.welcome-wrap {
    text-align: center;
    padding: 3rem 2rem 1.5rem;
}
.welcome-icon {
    font-size: 3.5rem;
    line-height: 1;
    margin-bottom: 1rem;
    filter: drop-shadow(0 0 20px rgba(232,184,75,0.4));
}
.welcome-wrap h2 {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    color: #fff;
    margin: 0 0 0.4rem;
}
.welcome-wrap p {
    color: var(--muted);
    font-size: 0.9rem;
    font-weight: 300;
    margin: 0;
}

/* ── Suggested questions ── */
.sq-label {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 1.1px;
    text-transform: uppercase;
    color: var(--muted);
    margin: 1.8rem 2.8rem 0.7rem;
}
.stButton > button {
    font-family: 'Sora', sans-serif !important;
    background: var(--surface2) !important;
    color: var(--text) !important;
    border: 1px solid var(--border) !important;
    border-radius: 12px !important;
    font-size: 0.8rem !important;
    font-weight: 400 !important;
    padding: 0.6rem 0.9rem !important;
    text-align: left !important;
    transition: all 0.2s ease !important;
    line-height: 1.4 !important;
    white-space: normal !important;
}
.stButton > button:hover {
    background: rgba(59,130,246,0.12) !important;
    border-color: rgba(59,130,246,0.35) !important;
    color: #fff !important;
    transform: translateY(-1px) !important;
}
.stButton > button[kind="primary"] {
    background: linear-gradient(135deg, #1a3a6b, #1a56db) !important;
    border-color: transparent !important;
    color: #fff !important;
    font-weight: 600 !important;
}
.stButton > button[kind="primary"]:hover {
    box-shadow: 0 4px 20px rgba(26,86,219,0.4) !important;
}

/* ── Bubbles ── */
.bubble-row-user {
    display: flex;
    justify-content: flex-end;
    margin: 0.75rem 0;
}
.bubble-row-assistant {
    display: flex;
    justify-content: flex-start;
    margin: 0.75rem 0;
}
.bubble-user {
    background: linear-gradient(135deg, #1a3a6b 0%, #1a56db 100%);
    color: #fff;
    border-radius: 20px 20px 4px 20px;
    padding: 0.85rem 1.2rem;
    max-width: 75%;
    font-size: 0.92rem;
    line-height: 1.55;
    box-shadow: 0 4px 20px rgba(26,86,219,0.25);
}
.bubble-assistant {
    background: var(--surface);
    color: var(--text);
    border-radius: 20px 20px 20px 4px;
    padding: 1.1rem 1.3rem;
    max-width: 82%;
    font-size: 0.92rem;
    line-height: 1.65;
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
}
.bubble-assistant ul {
    margin: 0.5rem 0 0.5rem 1.1rem;
    padding: 0;
}
.bubble-assistant li { margin-bottom: 0.35rem; }
.bubble-assistant strong { color: #fff; }
.bubble-assistant a { color: var(--mid); }

/* ── Category tags ── */
.tag-row { margin-bottom: 0.6rem; display: flex; flex-wrap: wrap; gap: 5px; }
.cat-tag {
    font-size: 0.66rem;
    font-weight: 600;
    letter-spacing: 0.9px;
    text-transform: uppercase;
    padding: 2px 9px;
    border-radius: 20px;
    border: 1px solid;
    display: inline-block;
}

/* ── Sources ── */
.sources-bar {
    margin-top: 1rem;
    padding-top: 0.8rem;
    border-top: 1px solid var(--border);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
}
.src-lbl {
    font-size: 0.67rem;
    font-weight: 600;
    letter-spacing: 0.9px;
    text-transform: uppercase;
    color: var(--muted);
    margin-right: 2px;
    flex-basis: 100%;
    margin-bottom: 3px;
}
.src-pill {
    display: inline-block;
    background: rgba(59,130,246,0.1);
    border: 1px solid rgba(59,130,246,0.25);
    color: var(--mid);
    font-size: 0.7rem;
    padding: 3px 10px;
    border-radius: 20px;
    text-decoration: none;
    transition: all 0.15s;
}
.src-pill:hover {
    background: rgba(59,130,246,0.2);
    color: #93c5fd;
}

/* ── Thinking animation ── */
.thinking-wrap {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.8rem 0;
    color: var(--muted);
    font-size: 0.85rem;
}
.dots { display: inline-flex; gap: 5px; }
.dots span {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--mid);
    animation: bounce 1.3s ease-in-out infinite;
}
.dots span:nth-child(2) { animation-delay: 0.18s; }
.dots span:nth-child(3) { animation-delay: 0.36s; }
@keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
    40%            { transform: translateY(-6px); opacity: 1; }
}

/* ── Input area ── */
.input-area {
    position: sticky;
    bottom: 0;
    background: linear-gradient(to top, var(--bg) 80%, transparent);
    padding: 1rem 2.8rem 1.5rem;
    margin-top: 1rem;
}
.stTextInput > div > div > input {
    background: var(--surface2) !important;
    border: 1px solid var(--border) !important;
    border-radius: 14px !important;
    color: var(--text) !important;
    font-family: 'Sora', sans-serif !important;
    font-size: 0.92rem !important;
    padding: 0.8rem 1.1rem !important;
    transition: border-color 0.2s, box-shadow 0.2s !important;
}
.stTextInput > div > div > input::placeholder { color: var(--muted) !important; }
.stTextInput > div > div > input:focus {
    border-color: rgba(59,130,246,0.5) !important;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1) !important;
    outline: none !important;
}

/* ── Error ── */
.err-box {
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.3);
    border-radius: 12px;
    padding: 1rem 1.2rem;
    color: #fca5a5;
    font-size: 0.88rem;
    margin: 0.5rem 0;
}

/* ── Divider ── */
.chat-divider {
    border: none;
    border-top: 1px solid var(--border);
    margin: 0.3rem 0;
}

/* Scrollbar */
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
</style>
""", unsafe_allow_html=True)


# ══════════════════════════════════════════════════════════════════════════════
# Session state
# ══════════════════════════════════════════════════════════════════════════════
if "messages"         not in st.session_state: st.session_state.messages         = []
if "pending_question" not in st.session_state: st.session_state.pending_question = ""
if "msg_count"        not in st.session_state: st.session_state.msg_count        = 0


# ══════════════════════════════════════════════════════════════════════════════
# Masthead
# ══════════════════════════════════════════════════════════════════════════════
user_msgs = sum(1 for m in st.session_state.messages if m["role"] == "user")
st.markdown(f"""
<div class="masthead">
    <div class="masthead-noise"></div>
    <div class="masthead-glow"></div>
    <div class="masthead-glow2"></div>
    <div class="masthead-inner">
        <div class="masthead-left">
            <div class="masthead-badge">🇺🇸 RAG · Powered by Pinecone + Groq</div>
            <h1><em>Thomas</em> — US Visa Assistant</h1>
            <p class="masthead-sub">Non-immigrant visas for India-based applicants · DS-160 · Fees · Wait times</p>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)




# ══════════════════════════════════════════════════════════════════════════════
# Load clients
# ══════════════════════════════════════════════════════════════════════════════
try:
    index, groq_client = load_clients()
except Exception as e:
    st.markdown(f'<div class="err-box">❌ <strong>Failed to initialise clients:</strong> {e}<br><br>'
                f'Make sure <code>SUPABASE_URL</code>, <code>SUPABASE_KEY</code>, and <code>GROQ_API_KEY</code> '
                f'are set in your <code>.env</code> file.</div>', unsafe_allow_html=True)
    st.stop()


# ══════════════════════════════════════════════════════════════════════════════
# Render helpers
# ══════════════════════════════════════════════════════════════════════════════
def category_tag_html(cat: str) -> str:
    color = CATEGORY_COLORS.get(cat, "#8b949e")
    label = cat.replace("_", " ").title()
    return (
        f'<span class="cat-tag" style="color:{color};border-color:{color}40;'
        f'background:{color}18;">{label}</span>'
    )


def source_pill_html(url: str) -> str:
    domain = url.split("/")[2] if url.startswith("http") else url
    return f'<a class="src-pill" href="{url}" target="_blank">{domain}</a>'


def render_user_bubble(text: str):
    st.markdown(
        f'<div class="bubble-row-user"><div class="bubble-user">{text}</div></div>',
        unsafe_allow_html=True,
    )


def render_assistant_bubble(content: str, sources: list, categories: list):
    tags_html = (
        '<div class="tag-row">' +
        "".join(category_tag_html(c) for c in categories) +
        "</div>"
    ) if categories else ""

    sources_html = ""
    if sources:
        pills = "".join(source_pill_html(u) for u in sources)
        sources_html = f'<div class="sources-bar"><div class="src-lbl">Sources</div>{pills}</div>'

    body = content.replace("\n", "<br>")
    st.markdown(f"""
    <div class="bubble-row-assistant">
        <div class="bubble-assistant">
            {tags_html}
            <div>{body}</div>
            {sources_html}
        </div>
    </div>
    """, unsafe_allow_html=True)


# ══════════════════════════════════════════════════════════════════════════════
# Welcome / empty state + suggested questions
# ══════════════════════════════════════════════════════════════════════════════
if not st.session_state.messages:
    st.markdown("""
    <div class="chat-area">
        <div class="welcome-wrap">
            <div class="welcome-icon">🗽</div>
            <h2>Ask Thomas anything</h2>
            <p>Your US non-immigrant visa questions answered from official sources.</p>
        </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown('<p class="sq-label" style="padding: 0 2.8rem;">Suggested questions</p>', unsafe_allow_html=True)

    cols = st.columns(3)
    for i, (icon, short, full_q) in enumerate(SUGGESTED):
        with cols[i % 3]:
            label = f"{icon}  {short}"
            if st.button(label, key=f"sq_{i}", use_container_width=True):
                st.session_state.pending_question = full_q
                st.rerun()

    st.markdown("<div style='height:1rem'></div>", unsafe_allow_html=True)
else:
    # ── Chat history ───────────────────────────────────────────────────────
    st.markdown('<div class="chat-area">', unsafe_allow_html=True)
    for msg in st.session_state.messages:
        if msg["role"] == "user":
            render_user_bubble(msg["content"])
        else:
            render_assistant_bubble(
                msg["content"],
                msg.get("sources", []),
                msg.get("categories", []),
            )
    st.markdown("</div>", unsafe_allow_html=True)

    # Small clear button
    st.markdown("<div style='text-align:right;padding:0 2.8rem 0.2rem'>", unsafe_allow_html=True)
    if st.button("🗑 Clear chat", key="clear"):
        st.session_state.messages = []
        st.session_state.msg_count = 0
        st.rerun()
    st.markdown("</div>", unsafe_allow_html=True)


# ══════════════════════════════════════════════════════════════════════════════
# Input bar
# ══════════════════════════════════════════════════════════════════════════════
st.markdown('<div class="input-area">', unsafe_allow_html=True)
col_in, col_btn = st.columns([5, 1])

# Use msg_count in the key so each send creates a fresh widget → clears the box
input_key = f"question_input_{st.session_state.msg_count}"

with col_in:
    question = st.text_input(
        "question",
        value=st.session_state.pending_question,
        placeholder="Ask about visas, fees, documents, wait times…",
        label_visibility="collapsed",
        key=input_key,
    )
with col_btn:
    send = st.button("Send →", type="primary", use_container_width=True)
st.markdown("</div>", unsafe_allow_html=True)



# ══════════════════════════════════════════════════════════════════════════════
# Handle send (FIXED)
# ══════════════════════════════════════════════════════════════════════════════
user_input = None

# Case 1: Suggested question clicked
if st.session_state.pending_question:
    user_input = st.session_state.pending_question
    st.session_state.pending_question = ""

# Case 2: Manual input
elif send and question.strip():
    user_input = question.strip()

# Process input if exists
if user_input:
    q = user_input

    st.session_state.messages.append({"role": "user", "content": q})
    render_user_bubble(q)

    thinking_placeholder = st.empty()
    thinking_placeholder.markdown("""
    <div class="thinking-wrap">
        <div class="dots"><span></span><span></span><span></span></div>
        Thomas is searching the knowledge base…
    </div>
    """, unsafe_allow_html=True)

    try:
        result = ask(q, index, groq_client)
    except Exception as e:
        thinking_placeholder.empty()
        st.markdown(f'<div class="err-box">❌ {e}</div>', unsafe_allow_html=True)
        st.stop()

    thinking_placeholder.empty()

    st.session_state.messages.append({
        "role": "assistant",
        "content": result["answer"],
        "sources": result["sources"],
        "categories": result["categories"],
    })

    render_assistant_bubble(
        result["answer"],
        result["sources"],
        result["categories"]
    )

    # reset input box
    st.session_state.msg_count += 1

    st.rerun()