
import asyncio
from utils.local_embedder import get_embedding
from utils.faiss_index import search_faiss


async def run_search():
    query = "I have chest pain and trouble breathing"
    
    print("Embedding text...")
    vector = get_embedding(query)
    
    print("Searching FAISS index...")
    results = search_faiss(vector, k=5)

    print("\n🔍 Top Results:")
    for i, result in enumerate(results, 1):
        print(f"\nResult #{i}")
        for key, value in result.items():
            print(f"{key}: {value}")


if __name__ == "__main__":
    asyncio.run(run_search())
