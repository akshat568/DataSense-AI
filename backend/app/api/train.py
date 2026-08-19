from fastapi import APIRouter, HTTPException, Body
from app.services.training_service import execute_training_pipeline
from app.schemas.training_schema import TrainingResponse
from app.utils.json_utils import sanitize_for_json

router = APIRouter()

@router.post("/train", response_model=TrainingResponse)
async def train_baseline_models(session_id: str = Body(..., embed=True)):
    """
    Triggers automated preprocessing, model training, and evaluation for the dataset 
    stored in the provided session_id. Caches the fitted pipelines in memory.
    """
    try:
        result = execute_training_pipeline(session_id)
        return sanitize_for_json(result)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
