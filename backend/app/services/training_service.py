import time
import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Optional

from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.model_selection import train_test_split, cross_val_score

# Classification Models
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingClassifier, GradientBoostingRegressor

# Evaluation Metrics
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from app.services.session_service import get_session, update_session
from app.services.recommendation_service import generate_recommendations

CLASSIFICATION_MODELS = {
    "Logistic Regression": LogisticRegression(random_state=42, max_iter=1000),
    "Random Forest Classifier": RandomForestClassifier(random_state=42),
    "Gradient Boosting Classifier": GradientBoostingClassifier(random_state=42)
}

REGRESSION_MODELS = {
    "Linear Regression": LinearRegression(),
    "Random Forest Regressor": RandomForestRegressor(random_state=42),
    "Gradient Boosting Regressor": GradientBoostingRegressor(random_state=42)
}

def build_preprocessing_pipeline(df: pd.DataFrame, target_col: str, id_cols: List[str]) -> Tuple[ColumnTransformer, List[str]]:
    numeric_features = []
    categorical_features = []
    
    for col in df.columns:
        if col == target_col or col in id_cols:
            continue
        if pd.api.types.is_numeric_dtype(df[col]):
            numeric_features.append(col)
        else:
            categorical_features.append(col)
            
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ],
        remainder='drop'
    )
    
    summary = [
        f"Dropped {len(id_cols)} identifier columns",
        f"Median Imputation & Standard Scaling for {len(numeric_features)} numeric features",
        f"Most Frequent Imputation & One-Hot Encoding for {len(categorical_features)} categorical features"
    ]
    
    return preprocessor, summary

def train_and_evaluate_models(X: pd.DataFrame, y: pd.Series, task: str) -> Tuple[List[Dict], float]:
    start_time = time.time()
    
    models_dict = REGRESSION_MODELS if "Regression" in task else CLASSIFICATION_MODELS
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    results = []
    is_binary = len(np.unique(y)) == 2 if "Classification" in task else False

    for name, model in models_dict.items():
        model_start = time.time()
        
        # Cross Validation (5-Fold)
        scoring = 'r2' if "Regression" in task else ('roc_auc' if is_binary else 'accuracy')
        # Simple cross validation on training set
        try:
            cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring=scoring, n_jobs=-1)
            cv_mean = float(np.mean(cv_scores))
            cv_std = float(np.std(cv_scores))
        except Exception:
            # Fallback if CV fails (e.g., due to extreme class imbalance in fold)
            cv_mean = 0.0
            cv_std = 0.0

        # Fit model on full training set
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        
        # Calculate Metrics
        metrics = {}
        if "Regression" in task:
            metrics['mae'] = float(mean_absolute_error(y_test, y_pred))
            metrics['rmse'] = float(np.sqrt(mean_squared_error(y_test, y_pred)))
            metrics['r2_score'] = float(r2_score(y_test, y_pred))
        else:
            metrics['accuracy'] = float(accuracy_score(y_test, y_pred))
            metrics['precision'] = float(precision_score(y_test, y_pred, average='weighted', zero_division=0))
            metrics['recall'] = float(recall_score(y_test, y_pred, average='weighted', zero_division=0))
            metrics['f1_score'] = float(f1_score(y_test, y_pred, average='weighted', zero_division=0))
            if is_binary:
                try:
                    y_prob = model.predict_proba(X_test)[:, 1]
                    metrics['roc_auc'] = float(roc_auc_score(y_test, y_prob))
                except Exception:
                    metrics['roc_auc'] = None

        model_time = time.time() - model_start
        
        results.append({
            "name": name,
            "metrics": metrics,
            "cross_validation": {
                "mean_score": cv_mean,
                "std_score": cv_std
            },
            "training_time": float(model_time),
            "_model_instance": model
        })

    total_time = time.time() - start_time
    return results, total_time

def determine_best_models(results: List[Dict], task: str) -> Tuple[Dict, Optional[Dict]]:
    if not results:
        return None, None
        
    primary_metric = "r2_score" if "Regression" in task else "f1_score"
    
    # Sort by primary metric descending, breaking ties with cross-validation mean score
    sorted_results = sorted(
        results,
        key=lambda x: (
            x['metrics'].get(primary_metric, 0),
            x.get('cross_validation', {}).get('mean_score', 0)
        ),
        reverse=True
    )
    
    best = sorted_results[0]
    runner_up = sorted_results[1] if len(sorted_results) > 1 else None
    
    def generate_reason(model_res, rank):
        score = model_res['metrics'].get(primary_metric, 0)
        m_name = model_res['name']
        if rank == 1:
            return f"{m_name} achieved the highest {primary_metric.replace('_', ' ').upper()} ({score:.4f}), balancing bias and variance effectively on this dataset."
        return f"{m_name} performed strongly with a {primary_metric.replace('_', ' ').upper()} of {score:.4f}, serving as an excellent fallback."

    best_formatted = {
        "name": best['name'],
        "reason": generate_reason(best, 1),
        "primary_metric": f"{primary_metric.replace('_', ' ').upper()}: {best['metrics'].get(primary_metric, 0):.4f}",
        "training_time": best['training_time']
    }
    
    runner_up_formatted = None
    if runner_up:
        runner_up_formatted = {
            "name": runner_up['name'],
            "reason": generate_reason(runner_up, 2),
            "primary_metric": f"{primary_metric.replace('_', ' ').upper()}: {runner_up['metrics'].get(primary_metric, 0):.4f}",
            "training_time": runner_up['training_time']
        }
        
    return best_formatted, runner_up_formatted

def execute_training_pipeline(session_id: str) -> dict:
    session = get_session(session_id)
    if not session:
        raise ValueError("Session not found")
        
    df = session.dataframe
    
    # Self-Sufficient: Ensure metadata exists
    if not session.detected_target or not session.ml_task:
        content = df.to_csv(index=False).encode('utf-8')
        rec_data = generate_recommendations(content, session.filename)
        
        target = None
        for warn in rec_data.get('overall_warnings', []):
            if "Auto-detected target column" in warn:
                target = warn.split("'")[1]
                break
                
        id_cols = [r['column_name'] for r in rec_data.get('column_recommendations', []) if r['issue'] == "Identifier Column"]
        ml_task = rec_data.get('suggested_ml_task', 'Classification')
        
        update_session(session_id, {
            'detected_target': target,
            'identifier_columns': id_cols,
            'ml_task': ml_task
        })
        session = get_session(session_id) # Refresh
        
    target_col = session.detected_target
    if not target_col or target_col not in df.columns:
        raise ValueError(f"Target column '{target_col}' is invalid or missing.")
        
    # Build and fit preprocessing pipeline
    preprocessor, prep_summary = build_preprocessing_pipeline(df, target_col, session.identifier_columns)
    
    X = df.drop(columns=[target_col] + [c for c in session.identifier_columns if c in df.columns])
    y = df[target_col]
    
    # Fit preprocessor to get transformed feature names
    X_transformed = preprocessor.fit_transform(X)
    
    # Try to extract feature names if possible
    try:
        feature_names = preprocessor.get_feature_names_out().tolist()
    except Exception:
        feature_names = [f"feature_{i}" for i in range(X_transformed.shape[1])]
        
    # Convert transformed X back to DataFrame for train_test_split downstream
    X_processed_df = pd.DataFrame(X_transformed, columns=feature_names)
    
    # Train and Evaluate
    model_results, total_time = train_and_evaluate_models(X_processed_df, y, session.ml_task)
    best_info, runner_info = determine_best_models(model_results, session.ml_task)
    
    # Update Session with trained artifacts for Phase 6 Explainability
    best_model_obj = next((res['_model_instance'] for res in model_results if res['name'] == best_info['name']), None)
    all_models_dict = {res['name']: res['_model_instance'] for res in model_results}
    
    # Clean up instances from results dict for JSON serialization
    for res in model_results:
        res.pop('_model_instance', None)

    update_session(session_id, {
        'preprocessing_pipeline': preprocessor,
        'best_model': best_model_obj,
        'all_models': all_models_dict,
        'feature_names': feature_names,
        'metrics': {res['name']: res['metrics'] for res in model_results},
        'training_time': total_time,
        'cv_results': {res['name']: res['cross_validation'] for res in model_results},
        'model_training_times': {res['name']: res['training_time'] for res in model_results},
    })
    
    return {
        "status": "success",
        "summary": "Baseline models trained and evaluated successfully.",
        "task": session.ml_task,
        "dataset_size": len(df),
        "feature_count": len(feature_names),
        "preprocessing_summary": prep_summary,
        "best_model": best_info,
        "runner_up": runner_info,
        "training_time": total_time,
        "models": model_results
    }
