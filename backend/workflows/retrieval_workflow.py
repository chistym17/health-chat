from langchain_core.runnables import RunnableLambda
from utils.local_embedder import get_embedding
from utils.faiss_index import search_faiss

retrieval_workflow = (
    RunnableLambda(lambda x: get_embedding(x))
    | RunnableLambda(lambda vec: search_faiss(vec))
)

