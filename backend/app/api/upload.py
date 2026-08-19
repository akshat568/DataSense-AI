from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.dataset_service import process_csv_dataset

from app.utils.json_utils import sanitize_for_json

router = APIRouter()

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """
    Handles CSV dataset uploads, processes them in memory, and returns 
    a standardized JSON response with the extracted metadata.
    """
    if not file.filename.endswith(".csv"):
        return sanitize_for_json({
            "success": False,
            "message": "Invalid file format. Only CSV files are allowed.",
            "data": None
        })

    try:
        # Read file entirely into memory
        content = await file.read()
        
        # We enforce size check on frontend (100MB), 
        # but a basic check on backend is also good practice.
        # 100 MB = 100 * 1024 * 1024 bytes
        if len(content) > 100 * 1024 * 1024:
            return sanitize_for_json({
                "success": False,
                "message": "File exceeds the maximum size limit of 100MB.",
                "data": None
            })

        # Process the dataset using the service layer
        import pandas as pd
        import io
        df = pd.read_csv(io.BytesIO(content))
        from app.services.session_service import create_session
        session_id = create_session(df, file.filename)
        
        dataset_info = process_csv_dataset(content, file.filename)
        dataset_info['session_id'] = session_id
        
        return sanitize_for_json({
            "success": True,
            "message": "Dataset uploaded and processed successfully.",
            "data": dataset_info
        })
        
    except Exception as e:
        # Catch pandas parsing errors or other unexpected errors
        return sanitize_for_json({
            "success": False,
            "message": f"Error processing file: {str(e)}",
            "data": None
        })
