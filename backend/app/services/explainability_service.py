import shap
import pandas as pd
import numpy as np
from typing import Dict, Any, List

from app.services.session_service import get_session, update_session
from app.services.explanation_generator import RuleBasedExplanationGenerator
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingClassifier, GradientBoostingRegressor

def get_explainer_and_background(model, X_processed: pd.DataFrame):
    """
    Dynamically select the best SHAP explainer and downsample background dataset if necessary.
    """
    n_samples = len(X_processed)
    
    if isinstance(model, (RandomForestClassifier, RandomForestRegressor, GradientBoostingClassifier, GradientBoostingRegressor)):
        explainer = shap.TreeExplainer(model)
        # TreeExplainer doesn't strictly need a background dataset for marginal impact, 
        # but we sample it for Kernel fallback if needed.
        bg_data = shap.sample(X_processed, min(100, n_samples))
        return explainer, bg_data
    elif isinstance(model, (LogisticRegression, LinearRegression)):
        bg_data = shap.sample(X_processed, min(100, n_samples))
        explainer = shap.LinearExplainer(model, bg_data)
        return explainer, bg_data
    else:
        bg_data = shap.sample(X_processed, min(50, n_samples)) # Strict sampling for Kernel
        explainer = shap.KernelExplainer(model.predict, bg_data)
        return explainer, bg_data

def compute_global_explanations(session_id: str) -> Dict[str, Any]:
    session = get_session(session_id)
    if not session or not session.best_model:
        raise ValueError("No trained model found for this session.")
        
    if session.global_shap_values is not None:
        return {
            "feature_importance": session.global_shap_values,
            "expected_value": session.expected_value,
            "task": session.ml_task
        }

    df = session.dataframe
    target_col = session.detected_target
    id_cols = session.identifier_columns
    
    X = df.drop(columns=[target_col] + [c for c in id_cols if c in df.columns])
    
    preprocessor = session.preprocessing_pipeline
    feature_names = session.feature_names
    
    # Transform raw data
    X_transformed = preprocessor.transform(X)
    X_processed_df = pd.DataFrame(X_transformed, columns=feature_names)
    
    # Initialize explainer
    model = session.best_model
    explainer, bg_data = get_explainer_and_background(model, X_processed_df)
    
    # Calculate global SHAP values. Sample up to 1000 rows for global explanation speed
    sample_size = min(1000, len(X_processed_df))
    X_sample = shap.sample(X_processed_df, sample_size)
    
    shap_values_raw = explainer.shap_values(X_sample)
    
    # Handle multiclass/binary/regression output shapes safely
    if isinstance(shap_values_raw, list):
        shap_values_mat = np.stack(shap_values_raw, axis=-1)
    else:
        if hasattr(shap_values_raw, 'values'):
            shap_values_mat = shap_values_raw.values
        else:
            shap_values_mat = shap_values_raw

    # Feature Importance (Mean Absolute SHAP)
    # If multiclass (samples, features, classes), average across sample and class dimensions
    if len(shap_values_mat.shape) == 3:
        mean_abs_shap = np.abs(shap_values_mat).mean(axis=(0, 2))
    else:
        mean_abs_shap = np.abs(shap_values_mat).mean(axis=0)
    
    feature_importance = []
    for idx, name in enumerate(feature_names):
        feature_importance.append({
            "feature": name,
            "importance": float(mean_abs_shap[idx])
        })
        
    feature_importance.sort(key=lambda x: x['importance'], reverse=True)
    
    # Expected value (Base value)
    expected_val_raw = explainer.expected_value
    if isinstance(expected_val_raw, (list, np.ndarray)):
        if len(expected_val_raw) > 2:
            # Multiclass default to index 0 for global summary base value
            expected_value = float(expected_val_raw[0])
        elif len(expected_val_raw) == 2:
            # Binary positive class expected value
            expected_value = float(expected_val_raw[1])
        else:
            expected_value = float(expected_val_raw[0])
    elif hasattr(expected_val_raw, '__iter__'):
        expected_value = float(next(iter(expected_val_raw)))
    else:
        expected_value = float(expected_val_raw)
        
    # Cache everything
    update_session(session_id, {
        "explainer": explainer,
        "global_shap_values": feature_importance,
        "expected_value": expected_value,
        "background_data": bg_data
    })
    
    return {
        "feature_importance": feature_importance,
        "expected_value": expected_value,
        "task": session.ml_task
    }

def compute_local_explanation(session_id: str, row_index: int) -> Dict[str, Any]:
    session = get_session(session_id)
    if not session or not session.best_model:
        raise ValueError("No trained model found for this session.")
        
    if not session.explainer:
        # Generate globally first to initialize cache
        compute_global_explanations(session_id)
        session = get_session(session_id)
        
    explainer = session.explainer
    preprocessor = session.preprocessing_pipeline
    feature_names = session.feature_names
    df = session.dataframe
    target_col = session.detected_target
    id_cols = session.identifier_columns
    
    if row_index >= len(df) or row_index < 0:
        raise ValueError(f"Invalid row_index: {row_index}")
        
    row_raw = df.iloc[[row_index]]
    X_raw = row_raw.drop(columns=[target_col] + [c for c in id_cols if c in row_raw.columns])
    
    X_transformed = preprocessor.transform(X_raw)
    X_processed_df = pd.DataFrame(X_transformed, columns=feature_names)
    
    # Model predictions
    model = session.best_model
    prediction_raw = model.predict(X_processed_df)[0]
    
    # Identify the class index to explain
    class_index = 0
    if hasattr(model, "classes_") and model.classes_ is not None:
        try:
            class_index = list(model.classes_).index(prediction_raw)
        except ValueError:
            class_index = 0

    prediction_prob = None
    is_regression = "Regression" in session.ml_task
    if not is_regression and hasattr(model, "predict_proba"):
        probs = model.predict_proba(X_processed_df)[0]
        prediction_prob = float(max(probs))
        
    # Compute local SHAP
    shap_values_raw = explainer.shap_values(X_processed_df)
    
    # Unpack SHAP values safely
    if isinstance(shap_values_raw, list):
        shap_values_mat = np.stack(shap_values_raw, axis=-1)
    else:
        if hasattr(shap_values_raw, 'values'):
            shap_values_mat = shap_values_raw.values
        else:
            shap_values_mat = shap_values_raw
            
    # Extract contributions for the predicted class if 3D
    if len(shap_values_mat.shape) == 3:
        shap_contributions = shap_values_mat[0, :, class_index]
    else:
        shap_contributions = shap_values_mat[0]
    
    # Format for UI
    shap_list = []
    for idx, name in enumerate(feature_names):
        shap_list.append({
            "feature": name,
            "value": float(X_processed_df.iloc[0, idx]),
            "contribution": float(shap_contributions[idx])
        })
        
    # Class-specific expected value selection
    expected_val_raw = explainer.expected_value
    if isinstance(expected_val_raw, (list, np.ndarray)):
        if len(expected_val_raw) > 2:
            expected_value = float(expected_val_raw[class_index])
        elif len(expected_val_raw) == 2:
            expected_value = float(expected_val_raw[1])
        else:
            expected_value = float(expected_val_raw[0])
    else:
        expected_value = float(expected_val_raw)

    # Generate natural language AI explanation
    ai_gen = RuleBasedExplanationGenerator()
    ai_explanation = ai_gen.generate(
        shap_values=shap_list,
        expected_value=expected_value,
        prediction=prediction_raw,
        is_regression=is_regression,
        prediction_prob=prediction_prob
    )
    
    return {
        "prediction": prediction_raw,
        "prediction_probability": prediction_prob,
        "expected_value": expected_value,
        "shap_values": shap_list,
        "ai_explanation": ai_explanation
    }
