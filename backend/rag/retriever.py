from sentence_transformers import SentenceTransformer
import chromadb
from pathlib import Path

from services.weather_service import get_weather

# Configuration
DB_PATH = Path("chroma_db")
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"

# Load embedding model and ChromaDB client
embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)
client = chromadb.PersistentClient(path=str(DB_PATH))
collection = client.get_or_create_collection(name="cropguard_knowledge")

def retrieve_knowledge(query: str, top_k: int = 3):
    """
    Retrieves the most relevant text chunks from ChromaDB based on the query.
    """
    # Generate embedding for the query
    query_embedding = embedding_model.encode([query], convert_to_numpy=True).tolist()

    # Query ChromaDB
    results = collection.query(
        query_embeddings=query_embedding,
        n_results=top_k
    )

    # Format the retrieved chunks
    retrieved_chunks = []
    if results["documents"]:
        for i in range(len(results["documents"][0])):
            content = results["documents"][0][i]
            source = results["metadatas"][0][i].get("source", "Unknown")
            retrieved_chunks.append(f"[Source: {source}] {content}")

    # print(retrieved_chunks)
    return retrieved_chunks

def generate_rag_prompt(disease_name: str, chunks: list, latitude=None, longitude=None):
    """
    Constructs the system prompt for the LLM using retrieved chunks.
    """
    context = "\n\n".join([f"[Retrieved Chunk {i+1}] {chunk}" for i, chunk in enumerate(chunks)])

    weather = {}

    try:
        if latitude and longitude:
            print(f"Fetching weather for latitude: {latitude}, longitude: {longitude}")
            weather = get_weather(latitude, longitude)
    except Exception as e:
        print(f"Weather API failed: {e}")

    prompt = f"""
    You are CropGuard, an agricultural advisory assistant.

    The image classification model detected:
    {disease_name}

    Use the agricultural knowledge provided below to generate the recommendation.

    --- KNOWLEDGE BASE ---
    {context}
    --- END KNOWLEDGE BASE ---
    
    CURRENT WEATHER:
    Temperature: {weather["current"]["temperature_2m"]} °C
    Humidity: {weather["current"]["relative_humidity_2m"]} %
    Precipitation: {weather["current"]["precipitation"]} mm
    Wind speed: {weather["current"]["wind_speed_10m"]} km/h

    Provide a concise and practical recommendation containing:

    1. Disease overview
    2. Immediate actions
    3. Management and treatment
    4. Prevention
    5. Important precautions

    Rules:
    - Use the provided knowledge as the primary source.
    - Do not invent pesticides, dosages, chemicals, or treatments.
    - If the knowledge does not contain enough information, clearly state that.
    - Do not claim that the image diagnosis is laboratory-confirmed.
    - Keep the response under 150 words.
    
    Return ONLY valid JSON.

    Use exactly this structure:
    
    {{
      "overview": "string",
      "immediate_actions": ["string", "string"],
      "treatment": ["string", "string"],
      "prevention": ["string", "string"],
      "precautions": ["string", "string"]
    }}
    
    Do not include Markdown.
    Do not wrap the JSON in ```json.
    Do not add any text before or after the JSON.
    """

    return prompt
