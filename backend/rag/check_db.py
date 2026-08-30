import chromadb

client = chromadb.PersistentClient(path="chroma_db")

collection = client.get_collection("cropguard_knowledge")

print("Collection:", collection.name)
print("Total documents:", collection.count())

data = collection.get(
    limit=10,
    include=["documents", "metadatas", "embeddings"]
)

for i, (doc, metadata) in enumerate(
    zip(data["documents"], data["metadatas"])
):
    print("\n" + "=" * 60)
    print(f"Chunk {i + 1}")
    print("Metadata:", metadata)
    print("Content:")
    print(doc)

    if data["embeddings"] is not None:
        print("Embedding dimensions:", len(data["embeddings"][i]))