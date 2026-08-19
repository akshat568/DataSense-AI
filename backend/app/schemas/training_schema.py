from pydantic import BaseModel
from typing import Dict, Any, List, Optional

class ModelMetrics(BaseModel):
    # Classification
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None
    roc_auc: Optional[float] = None
    
    # Regression
    mae: Optional[float] = None
    rmse: Optional[float] = None
    r2_score: Optional[float] = None

class CrossValidationResult(BaseModel):
    mean_score: float
    std_score: float

class ModelResult(BaseModel):
    name: str
    metrics: ModelMetrics
    cross_validation: CrossValidationResult
    training_time: float

class BestModelInfo(BaseModel):
    name: str
    reason: str
    primary_metric: str
    training_time: float

class TrainingResponse(BaseModel):
    status: str
    summary: str
    task: str
    dataset_size: int
    feature_count: int
    preprocessing_summary: List[str]
    best_model: BestModelInfo
    runner_up: Optional[BestModelInfo] = None
    training_time: float
    models: List[ModelResult]
