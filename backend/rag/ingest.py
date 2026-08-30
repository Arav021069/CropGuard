from pathlib import Path

KNOWLEDGE_BASE_DIR = Path("knowledge_base")


def read_documents():
    documents = []

    for file_path in KNOWLEDGE_BASE_DIR.glob("*.md"):
        text = file_path.read_text(encoding="utf-8")

        documents.append({
            "filename": file_path.name,
            "content": text
        })

    return documents


def split_into_chunks(text, chunk_size=500, overlap=100):
    chunks = []

    start = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]

        chunks.append(chunk)

        start += chunk_size - overlap

    return chunks


if __name__ == "__main__":
    documents = read_documents()

    print(f"Found {len(documents)} documents.\n")

    total_chunks = 0

    for document in documents:
        chunks = split_into_chunks(document["content"])

        print("=" * 50)
        print(document["filename"])
        print(f"Chunks: {len(chunks)}")
        print("=" * 50)

        for i, chunk in enumerate(chunks):
            print(f"\n--- Chunk {i + 1} ---")
            print(chunk)

        total_chunks += len(chunks)

    print(f"\nTotal chunks: {total_chunks}")