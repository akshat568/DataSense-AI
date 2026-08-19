from fastapi import APIRouter, HTTPException, Query, Response
from app.services.report_service import compile_report_data, generate_html_report, generate_pdf_report
from app.schemas.report_schema import ReportPreviewResponse
from app.utils.json_utils import sanitize_for_json

router = APIRouter()

@router.get("/report/preview", response_model=ReportPreviewResponse)
async def preview_report(session_id: str = Query(...)):
    """
    Returns the compiled report JSON data for the frontend to render a WYSIWYG preview.
    """
    try:
        report_data = compile_report_data(session_id)
        return sanitize_for_json({
            "status": "success",
            "data": report_data
        })
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/report/export")
async def export_report(session_id: str = Query(...), format: str = Query("pdf")):
    """
    Exports the report as a downloadable HTML or PDF file.
    """
    if format not in ["html", "pdf"]:
        raise HTTPException(status_code=400, detail="Invalid format. Must be 'html' or 'pdf'.")
        
    try:
        report_data = compile_report_data(session_id)
        html_content = generate_html_report(report_data)
        
        if format == "html":
            return Response(
                content=html_content, 
                media_type="text/html", 
                headers={"Content-Disposition": f"attachment; filename=DataSense_Report_{session_id[:8]}.html"}
            )
        else:
            pdf_bytes = generate_pdf_report(report_data)
            return Response(
                content=pdf_bytes, 
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename=DataSense_Report_{session_id[:8]}.pdf"}
            )
            
    except RuntimeError as re:
        raise HTTPException(status_code=503, detail=str(re))
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
