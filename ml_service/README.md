# MindMitra ML Inference Service

This FastAPI service serves as the core prediction and explainability (SHAP) engine for the MindMitra application.

## Architecture & Communication
React (Frontend) -> Node.js (Express Backend) -> FastAPI (ML Service)

The frontend **never** communicates with this FastAPI service directly. The Node.js server acts as an API gateway.

## Environment & Run Instructions
This service requires the dedicated ml_env Python 3.11 environment.

`ash
# From the project root
.\ml_env\Scripts\activate
cd ml_service
uvicorn app:app --host 127.0.0.1 --port 8000 --reload
`

## Endpoints
- GET /health: Checks if the models and preprocessors are loaded successfully.
- POST /predict: Generates predictions and detailed SHAP contributions.

### POST /predict
**Request Schema**:
Requires a JSON body containing raw input features (e.g., ge, sleep_duration, stress_level). See schemas/predict_schema.py for exact data types. Pydantic performs automatic validation.

**Response Schema**:
`json
{
  "target": "felt_rested",
  "prediction": 55.17,
  "base_value": 43.55,
  "model_version": "xgboost_v1.0",
  "ranked_contributions": [
    {
      "feature": "sleep_duration",
      "transformed_value": 7.5,
      "contribution": 5.08,
      "direction": "positive"
    }
  ],
  "message": "Prediction and SHAP explanation generated successfully."
}
`
