from fastapi import APIRouter, HTTPException
from ml_service.schemas.predict_schema import PredictionRequest, PredictionResponse
from ml_service.services.prediction_service import ml_service_instance

router = APIRouter()

@router.post("/predict", response_model=PredictionResponse)
def predict_endpoint(req: PredictionRequest):
    try:
        raw_dict = req.model_dump()
        explanation = ml_service_instance.predict(raw_dict)
        
        return PredictionResponse(
            target=explanation["target"],
            prediction=explanation["prediction"],
            base_value=explanation["base_value"],
            model_version="xgboost_v1.0",
            ranked_contributions=explanation["ranked_contributions"],
            message="Prediction and SHAP explanation generated successfully."
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except RuntimeError as re:
        raise HTTPException(status_code=503, detail=str(re))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
