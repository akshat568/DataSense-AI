import numpy as np
import pandas as pd
import math

def sanitize_for_json(data):
    """
    Recursively sanitizes data structures to be JSON compliant.
    Converts NaN, Infinity, and pd.NA values to None.
    Casts numpy data types to native Python types.
    """
    if isinstance(data, dict):
        return {str(k): sanitize_for_json(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_for_json(item) for item in data]
    elif isinstance(data, tuple):
        return tuple(sanitize_for_json(item) for item in data)
    elif isinstance(data, float):
        if math.isnan(data) or math.isinf(data):
            return None
        return data
    elif isinstance(data, (np.floating, np.float64, np.float32)):
        if np.isnan(data) or np.isinf(data):
            return None
        return float(data)
    elif isinstance(data, (np.integer, np.int64, np.int32)):
        return int(data)
    elif isinstance(data, np.bool_):
        return bool(data)
    elif isinstance(data, np.ndarray):
        return sanitize_for_json(data.tolist())
    elif data is pd.NA:
        return None
    else:
        # Check scalar pd.isna safely to avoid truth value ambiguity on iterables
        if np.isscalar(data) and pd.isna(data):
            return None
        return data
