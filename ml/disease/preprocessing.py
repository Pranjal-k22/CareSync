import pandas as pd
from typing import Dict, Tuple, Any

from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

from .config import NUMERICAL_COLS, CATEGORICAL_COLS, NUMERICAL_RANGES

def build_disease_preprocessor() -> ColumnTransformer:
    """Build scikit-learn ColumnTransformer preprocessing pipeline."""
    num_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    cat_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    preprocessor = ColumnTransformer(transformers=[
        ("num", num_pipeline, NUMERICAL_COLS),
        ("cat", cat_pipeline, CATEGORICAL_COLS)
    ])

    return preprocessor

def validate_disease_data(data: Dict[str, Any]) -> Tuple[bool, str, Dict[str, Any]]:
    """Validate incoming patient dictionary against clinical ranges."""
    if not isinstance(data, dict):
        return False, "Input data must be a dictionary.", {}

    validated = {}
    for feat, (min_v, max_v) in NUMERICAL_RANGES.items():
        if feat in data:
            try:
                val = float(data[feat])
            except (ValueError, TypeError):
                return False, f"Feature '{feat}' must be numeric.", {}

            if not (min_v <= val <= max_v):
                return False, f"Feature '{feat}' value {val} outside physiological bounds [{min_v}, {max_v}].", {}
            validated[feat] = val
        else:
            # Assign default median if omitted
            defaults = {
                "temperature_c": 37.0, "heart_rate": 75, "spo2_pct": 98.0,
                "cough_severity": 0, "headache_severity": 0, "fatigue_score": 0,
                "chills": 0, "body_ache": 0, "sore_throat": 0, "age": 35
            }
            validated[feat] = defaults.get(feat, 0)

    gender_raw = str(data.get("gender", "Female")).strip().capitalize()
    if gender_raw not in ["Male", "Female"]:
        gender_raw = "Female"
    validated["gender"] = gender_raw

    return True, "Valid", validated
