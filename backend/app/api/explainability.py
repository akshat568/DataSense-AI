from fastapi import APIRouter, HTTPException, Body
from app.services.explainability_service import compute_global_explanations, compute_local_explanation
from app.schemas.explainability_schema import GlobalExplainabilityResponse, LocalExplainabilityResponse
from app.utils.json_utils import sanitize_for_json

router = APIRouter()

@router.post("/explainability/global", response_model=GlobalExplainabilityResponse)
async def get_global_explanations(session_id: str = Body(..., embed=True)):
    """
    Returns global feature importance by computing and caching SHAP values.
    """
    try:
        data = compute_global_explanations(session_id)
        response_payload = {
            "status": "success",
            "task": data['task'],
            "expected_value": data['expected_value'],
            "feature_importance": data['feature_importance']
        }
        return sanitize_for_json(response_payload)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/explainability/local", response_model=LocalExplainabilityResponse)
async def get_local_explanation(session_id: str = Body(...), row_index: int = Body(...)):
    """
    Returns local SHAP values and an AI-generated explanation for a specific dataset row.
    """
    try:
        data = compute_local_explanation(session_id, row_index)
        response_payload = {
            "status": "success",
            **data
        }
        return sanitize_for_json(response_payload)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
