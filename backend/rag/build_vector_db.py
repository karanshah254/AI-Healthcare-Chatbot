import os
import faiss
import pickle
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer

DOCUMENT_PATH = "rag/documents"
DB_PATH = "rag/faiss_index"

model = SentenceTransformer("all-MiniLM-L6-v2")

documents = []

print("Loading documents...")

for file in os.listdir(DOCUMENT_PATH):
    if file.endswith(".pdf"):
        loader = PyPDFLoader(os.path.join(DOCUMENT_PATH, file))
        pages = loader.load()
        documents.extend(pages)

print("Splitting documents...")

splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=100
)

chunks = splitter.split_documents(documents)

texts = [chunk.page_content for chunk in chunks]

print("Creating embeddings...")

embeddings = model.encode(texts)

dimension = embeddings.shape[1]

index = faiss.IndexFlatL2(dimension)

index.add(embeddings)

print("Saving FAISS index...")

os.makedirs(DB_PATH, exist_ok=True)

faiss.write_index(index, f"{DB_PATH}/index.faiss")

with open(f"{DB_PATH}/texts.pkl", "wb") as f:
    pickle.dump(texts, f)

print("Vector database created successfully!")