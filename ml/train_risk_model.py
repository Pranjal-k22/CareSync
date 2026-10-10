"""Train and evaluate HealConnect's clinical-deterioration risk model.

The split is performed by patient ID, so a patient's measurements cannot appear
in both training and test sets.  This gives a more realistic evaluation than a
random row-by-row split of time-series records.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import GroupShuffleSplit
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


PROJECT_ROOT = Path(__file__).resolve().parents[1]
INPUT = PROJECT_ROOT / "ml/data/cleaned_hospital_deterioration.csv"
ARTIFACT_DIR = PROJECT_ROOT / "ml/artifacts"
MODEL_PATH = ARTIFACT_DIR / "risk_model_v1.joblib"
METRICS_PATH = ARTIFACT_DIR / "risk_model_v1_metrics.json"

TARGET = "deterioration_next_12h"
IDENTIFIERS = ["patient_id", "hour_from_admission"]
NUMERIC_FEATURES = [
    "heart_rate",
    "respiratory_rate",
    "spo2_pct",
    "temperature_c",
    "systolic_bp",
    "diastolic_bp",
    "oxygen_flow",
    "mobility_score",
    "nurse_alert",
    "age",
    "comorbidity_index",
]
CATEGORICAL_FEATURES = ["oxygen_device", "gender", "admission_type"]
FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES


def main() -> None:
    if not INPUT.exists():
        raise FileNotFoundError(f"Run prepare_hospital_deterioration.py first: {INPUT}")

    data = pd.read_csv(INPUT)
    X = data[FEATURES]
    y = data[TARGET]
    groups = data["patient_id"]

    splitter = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=42)
    train_index, test_index = next(splitter.split(X, y, groups=groups))
    X_train, X_test = X.iloc[train_index], X.iloc[test_index]
    y_train, y_test = y.iloc[train_index], y.iloc[test_index]

    preprocessor = ColumnTransformer(
        transformers=[
            ("numeric", Pipeline([("imputer", SimpleImputer(strategy="median"))]), NUMERIC_FEATURES),
            (
                "categorical",
                Pipeline(
                    [
                        ("imputer", SimpleImputer(strategy="most_frequent")),
                        ("one_hot", OneHotEncoder(handle_unknown="ignore")),
                    ]
                ),
                CATEGORICAL_FEATURES,
            ),
        ]
    )
    classifier = RandomForestClassifier(
        n_estimators=120,
        max_depth=18,
        min_samples_leaf=2,
        class_weight="balanced_subsample",
        n_jobs=-1,
        random_state=42,
    )
    model = Pipeline([("preprocessor", preprocessor), ("classifier", classifier)])
    model.fit(X_train, y_train)

    probabilities = model.predict_proba(X_test)[:, 1]
    predictions = (probabilities >= 0.5).astype(int)
    matrix = confusion_matrix(y_test, predictions, labels=[0, 1])

    transformed_features = model.named_steps["preprocessor"].get_feature_names_out()
    importances = model.named_steps["classifier"].feature_importances_
    top_features = sorted(
        ({"feature": str(name), "importance": round(float(value), 6)} for name, value in zip(transformed_features, importances)),
        key=lambda item: item["importance"],
        reverse=True,
    )[:10]

    metrics = {
        "model_version": "v1.0",
        "algorithm": "RandomForestClassifier",
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "dataset": str(INPUT.relative_to(PROJECT_ROOT)),
        "features": FEATURES,
        "target": TARGET,
        "train_rows": int(len(X_train)),
        "test_rows": int(len(X_test)),
        "test_patient_count": int(data.iloc[test_index]["patient_id"].nunique()),
        "class_balance_train": {str(key): int(value) for key, value in y_train.value_counts().sort_index().items()},
        "metrics": {
            "accuracy": round(float(accuracy_score(y_test, predictions)), 4),
            "precision": round(float(precision_score(y_test, predictions, zero_division=0)), 4),
            "recall": round(float(recall_score(y_test, predictions, zero_division=0)), 4),
            "f1_score": round(float(f1_score(y_test, predictions, zero_division=0)), 4),
            "roc_auc": round(float(roc_auc_score(y_test, probabilities)), 4),
            "average_precision": round(float(average_precision_score(y_test, probabilities)), 4),
        },
        "confusion_matrix": {"true_negative": int(matrix[0, 0]), "false_positive": int(matrix[0, 1]), "false_negative": int(matrix[1, 0]), "true_positive": int(matrix[1, 1])},
        "top_feature_importances": top_features,
    }

    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    METRICS_PATH.write_text(json.dumps(metrics, indent=2) + "\n", encoding="utf-8")

    print(f"Saved model: {MODEL_PATH.relative_to(PROJECT_ROOT)}")
    print(f"Saved metrics: {METRICS_PATH.relative_to(PROJECT_ROOT)}")
    print(json.dumps(metrics["metrics"], indent=2))


if __name__ == "__main__":
    main()
