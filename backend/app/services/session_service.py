from typing import Dict, Any, Optional, List
import uuid
from pydantic import BaseModel, Field
import pandas as pd
import os
import pickle

class TrainingSession(BaseModel):
    session_id: str
    filename: str
    dataframe: Any  # Storing the raw pd.DataFrame in memory
    detected_target: Optional[str] = None
    identifier_columns: List[str] = Field(default_factory=list)
    ml_task: Optional[str] = None
    
    # Store fitted pipelines and models for Phase 6 Explainability
    preprocessing_pipeline: Optional[Any] = None
    best_model: Optional[Any] = None
    all_models: Optional[Dict[str, Any]] = None
    feature_names: Optional[List[str]] = None
    metrics: Optional[Dict[str, Any]] = None
    training_time: Optional[float] = None
    
    # Per-model cross-validation and timing data (populated by training_service)
    cv_results: Optional[Dict[str, Any]] = None
    model_training_times: Optional[Dict[str, float]] = None
    
    # Store Explainability cache
    explainer: Optional[Any] = None
    global_shap_values: Optional[Any] = None
    expected_value: Optional[float] = None
    background_data: Optional[Any] = None
    
    class Config:
        arbitrary_types_allowed = True

# In-memory global store
_SESSION_STORE: Dict[str, TrainingSession] = {}

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CACHE_DIR = os.path.join(BASE_DIR, "sessions_cache")

def _get_cache_path(session_id: str) -> str:
    os.makedirs(CACHE_DIR, exist_ok=True)
    return os.path.join(CACHE_DIR, f"session_{session_id}.pkl")

def _save_to_disk(session: TrainingSession):
    try:
        path = _get_cache_path(session.session_id)
        with open(path, "wb") as f:
            pickle.dump(session, f)
    except Exception as e:
        print(f"Warning: Failed to save session to disk: {e}")

def create_session(df: pd.DataFrame, filename: str) -> str:
    session_id = str(uuid.uuid4())
    session = TrainingSession(
        session_id=session_id,
        filename=filename,
        dataframe=df
    )
    _SESSION_STORE[session_id] = session
    _save_to_disk(session)
    return session_id

def get_session(session_id: str) -> Optional[TrainingSession]:
    # Check in-memory store first
    if session_id in _SESSION_STORE:
        return _SESSION_STORE[session_id]
        
    # Fallback: check disk cache
    path = _get_cache_path(session_id)
    if os.path.exists(path):
        try:
            with open(path, "rb") as f:
                session = pickle.load(f)
                _SESSION_STORE[session_id] = session
                return session
        except Exception as e:
            print(f"Warning: Failed to load session from disk: {e}")
            
    return None

def update_session(session_id: str, updates: Dict[str, Any]) -> Optional[TrainingSession]:
    session = get_session(session_id)
    if not session:
        return None
        
    for k, v in updates.items():
        if hasattr(session, k):
            setattr(session, k, v)
            
    _save_to_disk(session)
    return session
