import datetime
import json
import joblib
import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.ensemble import GradientBoostingClassifier

from .config import (
    DISEASE_DATA_PATH, FLU_MODEL_ARTIFACT_PATH, FLU_METRICS_ARTIFACT_PATH,
    BACKEND_FLU_MODEL_PATH, TARGET_COL, EXCLUDE_COLS, RANDOM_STATE
)
from .preprocessing import build_disease_preprocessor

def train_disease_pipeline():
    """Train, tune, and serialize the final HealConnect disease model."""
    df = pd.read_csv(DISEASE_DATA_PATH)
    feature_cols = [c for c in df.columns if c not in EXCLUDE_COLS]

    X = df[feature_cols]
    y = df[TARGET_COL]

    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.30, random_state=RANDOM_STATE, stratify=y
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, random_state=RANDOM_STATE, stratify=y_temp
    )

    X_train_val = pd.concat([X_train, X_val])
    y_train_val = pd.concat([y_train, y_val])

    preprocessor = build_disease_preprocessor()

    final_pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", GradientBoostingClassifier(
            learning_rate=0.05,
            max_depth=5,
            n_estimators=100,
            random_state=RANDOM_STATE
        ))
    ])

    final_pipeline.fit(X_train_val, y_train_val)

    FLU_MODEL_ARTIFACT_PATH.parent.mkdir(parents=True, exist_ok=True)
    BACKEND_FLU_MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)

    joblib.dump(final_pipeline, FLU_MODEL_ARTIFACT_PATH)
    joblib.dump(final_pipeline, BACKEND_FLU_MODEL_PATH)

    print(f"✅ Trained final disease pipeline saved to: {FLU_MODEL_ARTIFACT_PATH}")
    return final_pipeline, X_test, y_test

if __name__ == "__main__":
    train_disease_pipeline()
