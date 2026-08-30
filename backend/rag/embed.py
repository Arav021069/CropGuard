from sentence_transformers import SentenceTransformer
import chromadb
from ingest import read_documents, split_into_chunks
from pathlib import Path

# Embedding model
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# ChromaDB - Using a path relative to the project root
DB_PATH = Path("chroma_db")
client = chromadb.PersistentClient(path=str(DB_PATH))
collection = client.get_or_create_collection(
    name="cropguard_knowledge"
)

def embed_and_store():
    print("Starting ingestion and embedding process...")
    
    # 1. Get documents from ingest.py
    documents = read_documents()
    if not documents:
        print("No documents found in knowledge_base directory.")
        return

    all_chunks = []
    
    # 2. Split all documents into chunks
    for doc in documents:
        chunks = split_into_chunks(doc["content"])
        for chunk in chunks:
            all_chunks.append({
                "content": chunk,
                "source": doc["filename"]
            })

    print(f"Total chunks to embed: {len(all_chunks)}")

    # 3. Generate embeddings
    texts = [chunk["content"] for chunk in all_chunks]
    embeddings = embedding_model.encode(
        texts, 
        convert_to_numpy=True
    )

    # 4. Store in ChromaDB
    # We use IDs, documents, embeddings, and metadata
    collection.add(
        ids=[f"chunk_{i}" for i in range(len(all_chunks))],
        documents=texts,
        embeddings=embeddings.tolist(),
        metadatas=[{"source": chunk["source"]} for chunk in all_chunks]
    )

    print(f"Successfully stored {len(all_chunks)} embeddings in ChromaDB.")
    print(f"Database persisted at: {DB_PATH.absolute()}")

if __name__ == "__main__":
    embed_and_store()
