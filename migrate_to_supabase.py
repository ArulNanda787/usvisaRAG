from dotenv import load_dotenv
load_dotenv()
import uuid
import os, json
from pathlib import Path
from sentence_transformers import SentenceTransformer
from supabase import create_client

supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])
model = SentenceTransformer("all-MiniLM-L6-v2")

CHUNK_FILES = ["chunks_stategov.jsonl", "chunks_ustraveldocs.jsonl"]

chunks = []
for path in CHUNK_FILES:
    p = Path(path)
    if not p.exists():
        print(f"⚠️  {path} not found")
        continue
    with p.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                chunks.append(json.loads(line))

print(f"Loaded {len(chunks)} chunks, embedding...")

texts = [c["text"] for c in chunks]
embeddings = model.encode(
    texts,
    show_progress_bar=True,
    batch_size=64,
    normalize_embeddings=True   # 🔥 THIS IS THE FIX
)

BATCH = 100
for i in range(0, len(chunks), BATCH):
    batch_chunks = chunks[i:i+BATCH]
    batch_embs = embeddings[i:i+BATCH]
    rows = [
        {
            "id": str(uuid.uuid4()),
            "content": c["text"],
            "embedding": emb.tolist(),
            "heading": c.get("heading", "")[:256],
            "content_type": c.get("content_type", ""),
            "source_url": c.get("source_url", ""),
            "category": c.get("category", ""),
            "domain": c.get("domain", ""),
        }
        for idx, (c, emb) in enumerate(zip(batch_chunks, batch_embs), start=i)
    ]
    supabase.table("visa_chunks").upsert(rows).execute()
    print(f"  Upserted {i+len(batch_chunks)}/{len(chunks)}")

print("✅ Migration done!")
