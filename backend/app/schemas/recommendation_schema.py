from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class ColumnRecommendation(BaseModel):
    column_name: str
    issue: str
    severity: Severity
    recommendation: str
    reason: str
    confidence_score: float

class DatasetRecommendationResponse(BaseModel):
    filename: str
    overall_warnings: List[str]
    suggested_ml_task: str
    suggested_models: List[str]
    column_recommendations: List[ColumnRecommendation]
