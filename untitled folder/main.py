from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from config import settings
from services import load_pinecone_index, load_groq_client, ask

limiter = Limiter(key_func=get_remote_address)
# ── Schemas ───────────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    query: str
    summary: str = ""
    history: list[dict] = []
    category: str = ""
    category_label: str = ""
    category_subtitle: str = ""

class ChatResponse(BaseModel):
    answer: str
    sources: list[str]
    categories: list[str]
    summary: str


# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("⚡ Loading clients...")
    app.state.index       = load_pinecone_index()
    app.state.groq_client = load_groq_client()
    print("✅ Thomas is ready.")
    yield
    print("🛑 Shutting down.")


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="Thomas — US Visa RAG API", version="1.0.0", lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
      allow_origins=["http://localhost:3000", "http://127.0.0.1:3000","https://thomas-front.onrender.com","http://140.238.249.253:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"status": "ok", "assistant": "Thomas"}


@app.post("/api/chat", response_model=ChatResponse)
@limiter.limit("8/hour") 
async def chat(request: Request, req: ChatRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    try:
        result = await ask(
            req.query,
            app.state.index,
            app.state.groq_client,
            summary=req.summary,
            history=req.history,
            category=req.category,
            category_label=req.category_label,
            category_subtitle=req.category_subtitle,
        )
        return ChatResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))