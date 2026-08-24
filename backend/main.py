from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

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


@app.get("/")
def root():
    return {"message": "CropGuard API is running"}


@app.post("/analyze")
async def analyze(image: UploadFile = File(...)):
    return {
        "disease": "Tomato Early Blight",
        "confidence": 0.91,
        "severity": "moderate",
        "recommendation": "Remove severely affected leaves and monitor nearby plants."
    }