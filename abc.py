from dotenv import load_dotenv
load_dotenv()
import os
from sentence_transformers import SentenceTransformer
from supabase import create_client

supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])
model = SentenceTransformer("all-MiniLM-L6-v2")

test_query = "What documents do I need for a B2 tourist visa?"
embedding = model.encode(test_query).tolist()

# Test 1: Try with a very low threshold to rule out threshold issues
result = supabase.rpc("match_chunks", {
    "query_embedding": embedding,
    "match_threshold": 0.1,
    "match_count": 5,
}).execute()

print(f"Hits at threshold 0.1: {len(result.data)}")
for r in result.data:
    print(f"  similarity={r.get('similarity', '?'):.3f} | [{r['category']}] {r['heading'][:60]}")