import io
import pandas as pd
import numpy as np

def _safe_float(val):
    if pd.isna(val) or np.isinf(val):
        return None
    return float(val)

def _safe_int(val):
    if pd.isna(val):
        return None
    return int(val)

def generate_profile(file_content: bytes, filename: str) -> dict:
    df = pd.read_csv(io.BytesIO(file_content))
    
    rows, cols = df.shape
    memory_usage = int(df.memory_usage(deep=True).sum())
    duplicate_rows = int(df.duplicated().sum())
    dup_percent = _safe_float((duplicate_rows / rows) * 100) if rows > 0 else 0.0
    
    total_cells = rows * cols
    missing_cells = int(df.isna().sum().sum())
    missing_percent = _safe_float((missing_cells / total_cells) * 100) if total_cells > 0 else 0.0

    # Type inference
    num_cols = 0
    cat_cols = 0
    bool_cols = 0
    dt_cols = 0
    txt_cols = 0

    col_metadata_list = []

    for col in df.columns:
        col_series = df[col]
        dtype = str(col_series.dtype)
        inferred_type = "unknown"
        
        # Attempt to categorize the column type logically
        if pd.api.types.is_bool_dtype(col_series):
            inferred_type = "boolean"
            bool_cols += 1
        elif pd.api.types.is_numeric_dtype(col_series):
            inferred_type = "numeric"
            num_cols += 1
        elif pd.api.types.is_datetime64_any_dtype(col_series):
            inferred_type = "datetime"
            dt_cols += 1
        else:
            # Check if it looks like datetime
            try:
                # Limit parsing check to a small sample for performance
                pd.to_datetime(col_series.dropna().head(10))
                col_series = pd.to_datetime(col_series)
                inferred_type = "datetime"
                dt_cols += 1
            except Exception:
                # If unique values are relatively small compared to rows, call it categorical
                n_unique = col_series.nunique(dropna=True)
                if n_unique > 0 and (n_unique / rows) < 0.5:
                    inferred_type = "categorical"
                    cat_cols += 1
                else:
                    inferred_type = "text"
                    txt_cols += 1

        # Base Column Metrics
        null_count = int(col_series.isna().sum())
        col_missing_pct = _safe_float((null_count / rows) * 100) if rows > 0 else 0.0
        n_unique = int(col_series.nunique(dropna=True))
        col_dup_pct = _safe_float(((rows - n_unique) / rows) * 100) if rows > 0 else 0.0
        col_mem = int(col_series.memory_usage(deep=True))
        
        # Get 5 non-null samples safely
        samples = col_series.dropna().head(5).tolist()
        samples = [str(s) if not isinstance(s, (int, float, bool)) else s for s in samples]

        # Specific Stats
        num_stats = None
        cat_stats = None
        dt_stats = None

        if inferred_type == "numeric":
            clean_series = col_series.dropna()
            if len(clean_series) > 0:
                modes = clean_series.mode()
                num_stats = {
                    "mean": _safe_float(clean_series.mean()),
                    "median": _safe_float(clean_series.median()),
                    "mode": _safe_float(modes.iloc[0]) if not modes.empty else None,
                    "min": _safe_float(clean_series.min()),
                    "max": _safe_float(clean_series.max()),
                    "variance": _safe_float(clean_series.var()),
                    "std_dev": _safe_float(clean_series.std()),
                    "skewness": _safe_float(clean_series.skew()),
                    "kurtosis": _safe_float(clean_series.kurt()),
                }
        
        elif inferred_type == "categorical" or inferred_type == "boolean":
            clean_series = col_series.dropna()
            if len(clean_series) > 0:
                vc = clean_series.value_counts()
                top_vals = [str(x) for x in vc.head(5).index.tolist()]
                freq_dist = {str(k): int(v) for k, v in vc.head(10).items()}
                cat_stats = {
                    "number_of_categories": int(n_unique),
                    "top_values": top_vals,
                    "frequency_distribution": freq_dist,
                    "cardinality_percentage": _safe_float((n_unique / rows) * 100) if rows > 0 else 0.0
                }
        
        elif inferred_type == "datetime":
            clean_series = col_series.dropna()
            if len(clean_series) > 0:
                dt_stats = {
                    "min_date": str(clean_series.min()),
                    "max_date": str(clean_series.max()),
                    "date_range_days": _safe_float((clean_series.max() - clean_series.min()).days)
                }

        col_metadata_list.append({
            "name": str(col),
            "detected_type": inferred_type,
            "null_count": null_count,
            "missing_percentage": col_missing_pct,
            "unique_values": n_unique,
            "duplicate_percentage": col_dup_pct,
            "memory_usage_bytes": col_mem,
            "sample_values": samples,
            "numeric_stats": num_stats,
            "categorical_stats": cat_stats,
            "datetime_stats": dt_stats
        })

    return {
        "filename": filename,
        "health": {
            "rows": rows,
            "columns": cols,
            "memory_usage_bytes": memory_usage,
            "duplicate_rows": duplicate_rows,
            "duplicate_percentage": dup_percent,
            "total_missing_cells": missing_cells,
            "missing_percentage": missing_percent,
            "numeric_columns": num_cols,
            "categorical_columns": cat_cols,
            "boolean_columns": bool_cols,
            "datetime_columns": dt_cols,
            "text_columns": txt_cols
        },
        "columns": col_metadata_list
    }
