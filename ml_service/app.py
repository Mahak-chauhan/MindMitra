import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from ml_service.routes import predict
from ml_service.services.prediction_service import ml_service_instance

app = FastAPI(title="MindMitra ML Inference Service (Phase 4)")

@app.on_event("startup")
def startup_event():
    ml_service_instance.load_models()

@app.get("/")
def read_root():
    return {"status": "ok", "message": "MindMitra FastAPI ML Service is running"}

@app.get("/health")
def health_check():
    if ml_service_instance.loaded:
        return {"status": "healthy", "models_loaded": True}
    else:
        return {"status": "unhealthy", "models_loaded": False}

app.include_router(predict.router)
