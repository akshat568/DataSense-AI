import io
import pandas as pd
import numpy as np
import math

def _safe_float(val):
    if pd.isna(val) or np.isinf(val):
        return 0.0
    return float(val)

def generate_recommendations(file_content: bytes, filename: str) -> dict:
    df = pd.read_csv(io.BytesIO(file_content))
    rows, cols = df.shape

    overall_warnings = []
    col_recs = []
    
    if rows == 0:
        return {
            "filename": filename,
            "overall_warnings": ["Dataset is empty."],
            "suggested_ml_task": "None",
            "suggested_models": [],
            "column_recommendations": []
        }

    # 1. Dataset-level checks
    dup_rows = df.duplicated().sum()
    if dup_rows > 0:
        overall_warnings.append(f"Remove {dup_rows} duplicate rows to prevent data leakage.")

    # Determine Target Column heuristically
    target_col = None
    target_candidates = ['target', 'label', 'class', 'y', 'outcome', 'is_']
    
    for col in reversed(df.columns):
        lower_col = str(col).lower()
        if any(tc in lower_col for tc in target_candidates) or col == df.columns[-1]:
            target_col = col
            break

    # Determine ML Task
    suggested_ml_task = "Unsupervised Learning (Clustering / Anomaly Detection)"
    suggested_models = ["K-Means", "Isolation Forest", "DBSCAN"]
    
    if target_col:
        target_series = df[target_col]
        if pd.api.types.is_numeric_dtype(target_series) and target_series.nunique() > 10:
            suggested_ml_task = "Regression"
            suggested_models = ["Random Forest Regressor", "XGBoost Regressor", "Linear Regression"]
        else:
            suggested_ml_task = "Classification"
            suggested_models = ["Random Forest Classifier", "XGBoost Classifier", "Logistic Regression"]
            
        overall_warnings.append(f"Auto-detected target column: '{target_col}'. Suggested Task: {suggested_ml_task}.")

    # Exclude identifier columns and target from correlation analysis
    numeric_df = df.select_dtypes(include=[np.number])
    id_cols = [col for col in numeric_df.columns if numeric_df[col].nunique(dropna=True) == rows and not pd.api.types.is_float_dtype(numeric_df[col])]
    cols_to_exclude = set(id_cols)
    if target_col:
        cols_to_exclude.add(target_col)
        
    numeric_df_for_corr = numeric_df.drop(columns=[c for c in cols_to_exclude if c in numeric_df.columns])
    
    corr_matrix = None
    if not numeric_df_for_corr.empty and numeric_df_for_corr.shape[1] > 1:
        corr_matrix = numeric_df_for_corr.corr(method='pearson')

    # Grouped Correlation (Collinearity) Recommendation
    if corr_matrix is not None:
        visited = set()
        correlated_groups = []
        for col in corr_matrix.columns:
            if str(col) in visited:
                continue
            correlations = corr_matrix[col]
            highly_correlated = correlations[(abs(correlations) > 0.85) & (correlations.index != col)]
            
            if not highly_correlated.empty:
                group = [str(col)] + highly_correlated.index.tolist()
                max_corr = abs(highly_correlated).max()
                
                # Only add if we haven't already captured this subset
                if not any(set(group).issubset(set(existing_group['group'])) for existing_group in correlated_groups):
                    correlated_groups.append({"group": group, "max_corr": max_corr})
                    visited.update(group)
                    
        if correlated_groups:
            group_strs = [f"({', '.join(g['group'])})" for g in correlated_groups]
            avg_max_corr = sum(g['max_corr'] for g in correlated_groups) / len(correlated_groups)
            # Dynamic confidence based on correlation strength (0.85 -> 0.85, 1.00 -> 1.00)
            confidence = min(0.99, _safe_float(avg_max_corr))
            
            col_recs.append({
                "column_name": "Multiple Features",
                "issue": "High Collinearity Detected",
                "severity": "high",
                "recommendation": "Model-Aware Feature Selection",
                "reason": f"Correlated groups: {'; '.join(group_strs)}. For Linear models, drop collinear features to prevent multicollinearity. For Tree-based models (XGBoost/RF), dropping is optional but can improve training speed and interpretability.",
                "confidence_score": confidence
            })

    # 2. Column-level Rules
    for col in df.columns:
        # Do not recommend preprocessing for the detected target column
        if str(col) == str(target_col):
            continue
            
        series = df[col]
        dtype = series.dtype
        null_count = series.isna().sum()
        null_pct = null_count / rows
        n_unique = series.nunique(dropna=True)
        is_numeric = pd.api.types.is_numeric_dtype(series)

        # Skip completely empty columns
        if null_pct == 1.0:
            col_recs.append({
                "column_name": str(col),
                "issue": "100% Missing Values",
                "severity": "critical",
                "recommendation": "Drop Column",
                "reason": "Column contains no data.",
                "confidence_score": 1.0
            })
            continue

        # Missing Values Rule
        if 0 < null_pct < 0.4:
            strategy = "Median Imputation" if is_numeric else "Mode Imputation"
            confidence = max(0.5, 0.95 - (null_pct * 1.5))
            col_recs.append({
                "column_name": str(col),
                "issue": f"{null_pct*100:.1f}% Missing Values",
                "severity": "medium",
                "recommendation": strategy,
                "reason": "Missing values are low enough to safely impute without destroying variance.",
                "confidence_score": confidence
            })
        elif 0.4 <= null_pct <= 0.7:
            confidence = min(0.95, 0.7 + (null_pct - 0.4))
            col_recs.append({
                "column_name": str(col),
                "issue": f"{null_pct*100:.1f}% Missing Values",
                "severity": "high",
                "recommendation": "Warn / Consider Imputation or Dropping",
                "reason": "High missing value percentage. Proceed with caution as imputation may introduce severe bias.",
                "confidence_score": confidence
            })
        elif null_pct > 0.7:
            confidence = min(1.0, 0.85 + (null_pct - 0.7) * 0.5)
            col_recs.append({
                "column_name": str(col),
                "issue": f"{null_pct*100:.1f}% Missing Values",
                "severity": "critical",
                "recommendation": "Drop Column",
                "reason": "Too many missing values. Feature lacks sufficient data for predictive modeling.",
                "confidence_score": confidence
            })

        # Constant Column Rule
        if n_unique == 1:
            col_recs.append({
                "column_name": str(col),
                "issue": "Constant Feature",
                "severity": "critical",
                "recommendation": "Drop Column",
                "reason": "Variance is zero. It provides no predictive power for ML models.",
                "confidence_score": 1.0
            })
            continue

        # Identifier Column Rule
        if n_unique == rows and not pd.api.types.is_float_dtype(series):
            col_recs.append({
                "column_name": str(col),
                "issue": "Identifier Column",
                "severity": "critical",
                "recommendation": "Drop Column",
                "reason": "Cardinality matches row count (100% unique). Likely an ID or hash which causes overfitting.",
                "confidence_score": 0.99
            })

        # Categorical Encoding
        if not is_numeric and n_unique > 1 and n_unique < rows:
            if n_unique <= 10:
                confidence = max(0.7, 1.0 - (n_unique * 0.02))
                col_recs.append({
                    "column_name": str(col),
                    "issue": "Categorical Feature (Low Cardinality)",
                    "severity": "info",
                    "recommendation": "One-Hot Encode",
                    "reason": "Small number of categories is optimal for One-Hot Encoding without blowing up dimensionality.",
                    "confidence_score": confidence
                })
            else:
                confidence = min(0.95, 0.75 + (n_unique / rows) * 0.2)
                col_recs.append({
                    "column_name": str(col),
                    "issue": "Categorical Feature (High Cardinality)",
                    "severity": "medium",
                    "recommendation": "Target Encode / Label Encode",
                    "reason": "High cardinality will create too many columns if One-Hot Encoded, causing sparsity.",
                    "confidence_score": confidence
                })

        # Numeric Scaling & Normalization
        if is_numeric and n_unique > 2:
            clean_series = series.dropna()
            
            # Outliers / Skewness
            skewness = _safe_float(clean_series.skew())
            if abs(skewness) > 1.5:
                confidence = min(0.99, 0.70 + (abs(skewness) - 1.5) * 0.05)
                col_recs.append({
                    "column_name": str(col),
                    "issue": "High Skewness",
                    "severity": "medium",
                    "recommendation": "Log Transform / Box-Cox Transform",
                    "reason": f"Distribution is heavily skewed (skew = {skewness:.2f}). Normalization improves linear model performance.",
                    "confidence_score": confidence
                })

            # Scaling
            std_dev = _safe_float(clean_series.std())
            mean = _safe_float(clean_series.mean())
            if std_dev > 100 or abs(mean) > 100:
                max_val = max(std_dev, abs(mean))
                # Log10 approach to scale confidence up as magnitude increases
                log_val = math.log10(max_val) if max_val > 0 else 0
                confidence = min(0.99, 0.75 + (log_val * 0.05))
                col_recs.append({
                    "column_name": str(col),
                    "issue": "Large Magnitude",
                    "severity": "low",
                    "recommendation": "Standard Scale",
                    "reason": "Feature has a large range which will dominate distance-based ML algorithms (like KNN or SVM).",
                    "confidence_score": confidence
                })

    # Sort recommendations by severity (critical > high > medium > low > info)
    severity_order = {
        "critical": 0,
        "high": 1,
        "medium": 2,
        "low": 3,
        "info": 4
    }
    
    col_recs.sort(key=lambda x: (severity_order.get(x['severity'], 5), -x['confidence_score']))

    return {
        "filename": filename,
        "overall_warnings": overall_warnings,
        "suggested_ml_task": suggested_ml_task,
        "suggested_models": suggested_models,
        "column_recommendations": col_recs
    }
