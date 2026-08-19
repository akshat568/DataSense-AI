from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class FeatureImportance(BaseModel):
    feature: str
    importance: float

class GlobalExplainabilityResponse(BaseModel):
    status: str
    task: str
    expected_value: float
    feature_importance: List[FeatureImportance]
    summary_plot_data: Optional[List[Dict[str, Any]]] = None

class ShapValue(BaseModel):
    feature: str
    value: Any
    contribution: float

class AIExplanation(BaseModel):
    prediction: str
    drivers: str
    confidence: str

class LocalExplainabilityResponse(BaseModel):
    status: str
    prediction: Any
    prediction_probability: Optional[float] = None
    expected_value: float
    shap_values: List[ShapValue]
    ai_explanation: AIExplanation
