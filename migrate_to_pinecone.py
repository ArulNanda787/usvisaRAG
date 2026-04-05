from pinecone import Pinecone, ServerlessSpec
import os
import uuid
from pathlib import Path
import json
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
load_dotenv()
pc = Pinecone(api_key=os.environ["PINECONE_API_KEY"])
index_name = "visa-rag"

if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        dimension=384,  # MiniLM = 384
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region="us-east-1"
        )
    )

index = pc.Index(index_name)

vectors = []
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
    normalize_embeddings=True   
)

for c, emb in zip(chunks, embeddings):
    vectors.append({
        "id": str(hash(c["text"])),
        "values": emb.tolist(),
        "metadata": {
            "content": c["text"],
            "heading": c.get("heading", ""),
            "category": c.get("category", ""),
            "source_url": c.get("source_url", ""),
        }
    })

# batch upload
BATCH_SIZE = 100

for i in range(0, len(vectors), BATCH_SIZE):
    batch = vectors[i:i+BATCH_SIZE]
    index.upsert(vectors=batch)
    print(f"Upserted {i + len(batch)} / {len(vectors)}")