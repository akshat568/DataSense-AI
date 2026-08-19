from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import Optional
from app.services.recommendation_service import generate_recommendations
from app.schemas.recommendation_schema import DatasetRecommendationResponse
from app.utils.json_utils import sanitize_for_json
from app.services.session_service import get_session, update_session

router = APIRouter()

@router.post("/recommendation", response_model=DatasetRecommendationResponse)
async def create_dataset_recommendations(
    session_id: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """
    Accepts a session_id or CSV dataset and returns intelligent preprocessing recommendations.
    """
    try:
        if session_id:
            session = get_session(session_id)
            if not session:
                raise HTTPException(status_code=404, detail="Session not found.")
            content = session.dataframe.to_csv(index=False).encode('utf-8')
            filename = session.filename
        elif file:
            if not file.filename.endswith(".csv"):
                raise HTTPException(status_code=400, detail="Invalid file format. Only CSV files are allowed.")
            content = await file.read()
            filename = file.filename
        else:
            raise HTTPException(status_code=400, detail="Must provide either session_id or file.")

        recommendation_data = generate_recommendations(content, filename)
        
        # Parse recommendation_data for metadata to persist
        if session_id:
            # We can extract the detected task and target from the overall_warnings or suggested_ml_task heuristically
            # Because recommendation_service.py currently returns them as part of the dict response
            suggested_ml_task = recommendation_data.get('suggested_ml_task')
            
            # Find target column from warnings "Auto-detected target column: '...'"
            detected_target = None
            for warning in recommendation_data.get('overall_warnings', []):
                if "Auto-detected target column" in warning:
                    try:
                        detected_target = warning.split("'")[1]
                    except IndexError:
                        pass
            
            # Find identifier columns from col_recs
            id_cols = [
                rec['column_name'] for rec in recommendation_data.get('column_recommendations', [])
                if rec['issue'] == "Identifier Column"
            ]
            
            update_session(session_id, {
                'detected_target': detected_target,
                'identifier_columns': id_cols,
                'ml_task': suggested_ml_task
            })

        return sanitize_for_json(recommendation_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
