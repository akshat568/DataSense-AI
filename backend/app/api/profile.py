from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import Optional
from app.services.profiling_service import generate_profile
from app.schemas.profile_schema import DatasetProfileResponse
from app.utils.json_utils import sanitize_for_json
from app.services.session_service import get_session

router = APIRouter()

@router.post("/profile", response_model=DatasetProfileResponse)
async def create_dataset_profile(
    session_id: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """
    Accepts a session_id or CSV dataset and returns an extensive statistical profile.
    """
    try:
        if session_id:
            session = get_session(session_id)
            if not session:
                raise HTTPException(status_code=404, detail="Session not found.")
            # Converting dataframe to CSV bytes to reuse existing profiling logic
            content = session.dataframe.to_csv(index=False).encode('utf-8')
            filename = session.filename
        elif file:
            if not file.filename.endswith(".csv"):
                raise HTTPException(status_code=400, detail="Invalid file format. Only CSV files are allowed.")
            content = await file.read()
            filename = file.filename
        else:
            raise HTTPException(status_code=400, detail="Must provide either session_id or file.")

        profile_data = generate_profile(content, filename)
        return sanitize_for_json(profile_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
