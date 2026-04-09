import faiss
import pickle
from sentence_transformers import SentenceTransformer

# Paths
INDEX_PATH = "rag/faiss_index/index.faiss"
TEXT_PATH = "rag/faiss_index/texts.pkl"

# Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Load FAISS index
index = faiss.read_index(INDEX_PATH)

# Load stored text chunks
with open(TEXT_PATH, "rb") as f:
    texts = pickle.load(f)


def search_vector_db(query, top_k=3):
    """
    Convert user query to embedding
    Search FAISS index
    Return most relevant chunks
    """

    query_embedding = model.encode([query])

    distances, indices = index.search(query_embedding, top_k)

    results = []

    for idx in indices[0]:
        if idx < len(texts):
            results.append(texts[idx])

    return results