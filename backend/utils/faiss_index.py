import faiss
import pandas as pd
import numpy as np
import os

VSTORE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../vectorstore"))

INDEX_PATH = os.path.join(VSTORE_DIR, "symptom_index.faiss")
META_PATH = os.path.join(VSTORE_DIR, "symptom_metadata.csv")

faiss_index = faiss.read_index(INDEX_PATH)

metadata_df = pd.read_csv(META_PATH)

def search_faiss(query_vector: list[float], k: int = 2):
    """Search the FAISS index and return metadata rows as dicts."""
    query_vector = np.array([query_vector]).astype("float32")
    _, indices = faiss_index.search(query_vector, k)
    return metadata_df.iloc[indices[0]].to_dict(orient="records")
