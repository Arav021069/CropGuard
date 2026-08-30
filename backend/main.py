from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io
from pathlib import Path
from llm_service import get_llm_recommendation_rag
from rag.retriever import retrieve_knowledge, generate_rag_prompt

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ML CONFIGURATION ---
MODEL_PATH = Path("models/cropguard_model.pth")
CLASS_NAMES = [
    "Pepper__bell___Bacterial_spot",
    "Pepper__bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Tomato_Bacterial_spot",
    "Tomato_Early_blight",
    "Tomato_Late_blight",
    "Tomato_Leaf_Mold",
    "Tomato_Septoria_leaf_spot",
    "Tomato_Spider_mites_Two_spotted_spider_mite",
    "Tomato__Target_Spot",
    "Tomato__Tomato_YellowLeaf__Curl_Virus",
    "Tomato__Tomato_mosaic_virus",
    "Tomato_healthy"
]

# Load model globally
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = models.resnet18()
num_ftrs = model.fc.in_features
model.fc = nn.Linear(num_ftrs, len(CLASS_NAMES))
model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
model.to(device)
model.eval()

# Image preprocessing pipeline
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])

@app.get("/")
def root():
    return {"message": "CropGuard API is running"}

@app.post("/analyze")
async def analyze(image: UploadFile = File(...)):
    try:
        # Read image
        img_bytes = await image.read()
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        
        # Preprocess and Predict
        img_tensor = preprocess(img).unsqueeze(0).to(device)
        
        with torch.no_grad():
            outputs = model(img_tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
            confidence, class_idx = torch.max(probabilities, 0)
            
        disease_name = CLASS_NAMES[class_idx.item()]
        conf_score = confidence.item()

        # RAG Pipeline: Retrieve knowledge and generate prompt
        chunks = retrieve_knowledge(disease_name)
        prompt = generate_rag_prompt(disease_name, chunks)
        
        # Get LLM response using the RAG prompt
        recommendation_data = get_llm_recommendation_rag(prompt)

        return {
            "disease": disease_name,
            "confidence": round(conf_score, 2),
            "severity": "calculated based on confidence", 
            "recommendation": recommendation_data
        }
    except Exception as e:
        return {"error": str(e)}
