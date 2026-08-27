# CropGuard Backend
AI-powered crop disease detection system using PyTorch and FastAPI.

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- PyTorch (CUDA recommended)

### Installation
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Linux/WSL
   # or
   .venv\Scripts\activate     # Windows
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Running the Server
```bash
uvicorn main:app --reload
```

## 🛠️ Project Structure
- `main.py`: FastAPI application and inference logic.
- `ml/`: Training scripts and model architecture.
- `models/`: Trained model weights (`.pth` files).
- `requirements.txt`: Project dependencies.

## 🧠 ML Pipeline
- **Base Model**: ResNet18
- **Dataset**: PlantVillage
- **Preprocessing**: ImageNet normalization, 224x224 resize.
