"""
HealConnect Disease Prediction & Flu Risk Module
Production Machine Learning Engine
"""

from .config import (
    DISEASE_DATA_PATH,
    FLU_MODEL_ARTIFACT_PATH,
    FLU_METRICS_ARTIFACT_PATH,
    FEATURE_COLS,
    NUMERICAL_COLS,
    CATEGORICAL_COLS
)
from .preprocessing import build_disease_preprocessor, validate_disease_data
from .train_flu_model import train_disease_pipeline
from .evaluate_flu_model import evaluate_disease_pipeline
from .predict_flu import predict_flu_risk
from .explain_flu import explain_patient_prediction

__all__ = [
    "DISEASE_DATA_PATH",
    "FLU_MODEL_ARTIFACT_PATH",
    "FLU_METRICS_ARTIFACT_PATH",
    "FEATURE_COLS",
    "NUMERICAL_COLS",
    "CATEGORICAL_COLS",
    "build_disease_preprocessor",
    "validate_disease_data",
    "train_disease_pipeline",
    "evaluate_disease_pipeline",
    "predict_flu_risk",
    "explain_patient_prediction"
]
