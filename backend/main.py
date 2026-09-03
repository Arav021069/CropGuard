from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io
from pathlib import Path
import logging
import json

from services.llm_service import get_llm_recommendation_rag, get_llm_recommendation
from rag.retriever import retrieve_knowledge, generate_rag_prompt


# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cropguard")

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
CLASSES_PATH = Path("models/classes.json")
# CLASS_NAMES = [
#     "Pepper__bell___Bacterial_spot",
#     "Pepper__bell___healthy",
#     "Potato___Early_blight",
#     "Potato___Late_blight",
#     "Potato___healthy",
#     "Tomato_Bacterial_spot",
#     "Tomato_Early_blight",
#     "Tomato_Late_blight",
#     "Tomato_Leaf_Mold",
#     "Tomato_Septoria_leaf_spot",
#     "Tomato_Spider_mites_Two_spotted_spider_mite",
#     "Tomato__Target_Spot",
#     "Tomato__Tomato_YellowLeaf__Curl_Virus",
#     "Tomato__Tomato_mosaic_virus",
#     "Tomato_healthy",
#     "Other"
# ]
# Load class names dynamically from the generated json file
if CLASSES_PATH.exists():
    with open(CLASSES_PATH, "r") as f:
        CLASS_NAMES = json.load(f)
else:
    raise RuntimeError("models/classes.json not found! Please run the class export script first.")


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
        # 1. Image Processing
        img_bytes = await image.read()
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        
        # 2. Prediction
        img_tensor = preprocess(img).unsqueeze(0).to(device)
        with torch.no_grad():
            outputs = model(img_tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
            confidence, class_idx = torch.max(probabilities, 0)
            
        conf_score = confidence.item()
        
        # 3. Validation Check
        CONFIDENCE_THRESHOLD = 0.65
        if conf_score < CONFIDENCE_THRESHOLD:
            return {
                "disease": "Unknown / Not a Plant",
                "confidence": round(conf_score, 2),
                "error": "Low confidence",
                "message": "The uploaded image does not clearly resemble a plant leaf."
            }

        disease_name = CLASS_NAMES[class_idx.item()]

        if disease_name == "Other":
            return {
                "disease": "No Plant Detected",
                "confidence": round(conf_score, 2),
                "severity": "N/A",
                "recommendation": {
                    "diagnosis": "Invalid Image",
                    "message": "The uploaded image does not contain a recognized crop leaf. Please upload a clear photo of an affected plant leaf.",
                    "status": "No action required"
                }
            }

        # 4. Resilient RAG/LLM Pipeline
        # recommendation_data = None
        try:
            # Attempt full RAG pipeline
            chunks = retrieve_knowledge(f"{disease_name}")
            prompt = generate_rag_prompt(f"{disease_name}", chunks)
            recommendation_data = get_llm_recommendation_rag(prompt)
        except Exception as rag_err:
            logger.error(f"RAG Pipeline failed: {rag_err}. Attempting basic LLM fallback.")
            try:
                # Fallback to basic recommendation without RAG
                recommendation_data = get_llm_recommendation(f"{disease_name}")
            except Exception as llm_err:
                logger.error(f"Basic LLM fallback also failed: {llm_err}")
                recommendation_data = {
                    "overview": "Recommendations are currently unavailable.",
                    "immediate_actions": ["Consult a local agricultural expert for diagnosis."],
                    "treatment": ["N/A"],
                    "prevention": ["N/A"],
                    "precautions": ["N/A"]
                }

        return {
            "disease": disease_name,
            "confidence": round(conf_score, 2),
            "severity": "calculated based on confidence", 
            "recommendation": recommendation_data
        }
        
    except Exception as e:
        logger.exception("Critical error in /analyze endpoint")
        raise HTTPException(
            status_code=500,
            detail=f"A critical server error occurred: {str(e)}"
        )
