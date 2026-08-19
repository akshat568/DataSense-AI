from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.upload import router as upload_router
from app.api.profile import router as profile_router
from app.api.recommendation import router as recommendation_router
from app.api.train import router as train_router
from app.api.explainability import router as explainability_router
from app.api.report import router as report_router

app = FastAPI(
    title="DataSense AI API",
    version="1.0.0",
    description="Backend API for DataSense AI"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload_router, prefix="/api", tags=["Upload"])
app.include_router(profile_router, prefix="/api", tags=["Profile"])
app.include_router(recommendation_router, prefix="/api", tags=["Recommendation"])
app.include_router(train_router, prefix="/api", tags=["Train"])
app.include_router(explainability_router, prefix="/api", tags=["Explainability"])
app.include_router(report_router, prefix="/api", tags=["Report"])

@app.get("/")
def root():
    return {
        "message": "Welcome to DataSense AI API"
    }