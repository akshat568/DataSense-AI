from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class DatasetHealthMetrics(BaseModel):
    rows: int
    columns: int
    memory_usage_bytes: int
    duplicate_rows: int
    duplicate_percentage: float
    total_missing_cells: int
    missing_percentage: float
    numeric_columns: int
    categorical_columns: int
    boolean_columns: int
    datetime_columns: int
    text_columns: int

class NumericStats(BaseModel):
    mean: Optional[float]
    median: Optional[float]
    mode: Optional[float]
    min: Optional[float]
    max: Optional[float]
    variance: Optional[float]
    std_dev: Optional[float]
    skewness: Optional[float]
    kurtosis: Optional[float]

class CategoricalStats(BaseModel):
    number_of_categories: Optional[int]
    top_values: Optional[List[str]]
    frequency_distribution: Optional[Dict[str, int]]
    cardinality_percentage: Optional[float]

class DatetimeStats(BaseModel):
    min_date: Optional[str]
    max_date: Optional[str]
    date_range_days: Optional[float]

class ColumnMetadata(BaseModel):
    name: str
    detected_type: str
    null_count: int
    missing_percentage: float
    unique_values: int
    duplicate_percentage: float
    memory_usage_bytes: int
    sample_values: List[Any]
    
    # Type-specific stats (only one of these will be populated)
    numeric_stats: Optional[NumericStats] = None
    categorical_stats: Optional[CategoricalStats] = None
    datetime_stats: Optional[DatetimeStats] = None

class DatasetProfileResponse(BaseModel):
    filename: str
    health: DatasetHealthMetrics
    columns: List[ColumnMetadata]
