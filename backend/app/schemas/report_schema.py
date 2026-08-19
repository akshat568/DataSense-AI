from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class CoverPage(BaseModel):
    title: str
    subtitle: str
    dataset_readiness: str
    date: str
    workflow_timeline: List[str]

class RiskAssessment(BaseModel):
    critical_issues: int
    high_issues: int
    medium_issues: int
    overall_risk: str

class RecommendationItem(BaseModel):
    column: str
    issue: str
    action: str
    severity: str
    confidence: Optional[float] = None
    reason: Optional[str] = None

class AIRecommendationsSummary(BaseModel):
    risk_assessment: RiskAssessment
    immediate_actions: List[RecommendationItem]
    future_improvements: List[RecommendationItem]

class ModelCard(BaseModel):
    name: str
    description: str
    primary_metric: str
    primary_metric_value: float
    cv_mean: float
    cv_std: float
    training_time: float
    hyperparameters: str

class ModelComparison(BaseModel):
    best_model: ModelCard
    runner_up: Optional[ModelCard] = None
    all_metrics: List[Dict[str, Any]]

class KeyBusinessDriver(BaseModel):
    feature: str
    importance: float
    direction: str

class ReportData(BaseModel):
    session_id: str
    cover_page: CoverPage
    executive_summary: str
    dataset_profiling: Dict[str, Any]
    recommendations: AIRecommendationsSummary
    models: ModelComparison
    key_business_drivers: List[KeyBusinessDriver]
    ai_conclusion: str
    appendix: Dict[str, Any]
    
class ReportPreviewResponse(BaseModel):
    status: str
    data: ReportData
