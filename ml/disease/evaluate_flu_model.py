import datetime
import json
import joblib
import pandas as pd
import numpy as np

from sklearn.preprocessing import label_binarize
from sklearn.metrics import (
    accuracy_score, precision_recall_fscore_support, roc_auc_score, average_precision_score, confusion_matrix
)

from .config import (
    DISEASE_DATA_PATH, FLU_MODEL_ARTIFACT_PATH, FLU_METRICS_ARTIFACT_PATH,
    EXCLUDE_COLS, TARGET_COL, CLASS_MAPPING
)

def evaluate_disease_pipeline(pipeline=None, X_test=None, y_test=None):
    """Evaluate pipeline on test set and write metrics JSON."""
    if pipeline is None:
        pipeline = joblib.load(FLU_MODEL_ARTIFACT_PATH)

    if X_test is None or y_test is None:
        df = pd.read_csv(DISEASE_DATA_PATH)
        feature_cols = [c for c in df.columns if c not in EXCLUDE_COLS]
        X = df[feature_cols]
        y = df[TARGET_COL]
        from sklearn.model_selection import train_test_split
        _, X_temp, _, y_temp = train_test_split(X, y, test_size=0.30, random_state=42, stratify=y)
        _, X_test, _, y_test = train_test_split(X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp)

    y_pred = pipeline.predict(X_test)
    y_probs = pipeline.predict_proba(X_test)

    acc = accuracy_score(y_test, y_pred)
    prec, rec, f1, _ = precision_recall_fscore_support(y_test, y_pred, average="weighted")
    roc_auc = roc_auc_score(y_test, y_probs, multi_class="ovr", average="weighted")

    y_test_bin = label_binarize(y_test, classes=[0, 1, 2])
    pr_auc = average_precision_score(y_test_bin, y_probs, average="weighted")
    cm = confusion_matrix(y_test, y_pred).tolist()

    metrics = {
        "model_name": "HealConnect Flu & Disease Diagnosis Model",
        "version": "v1.0",
        "algorithm": "GradientBoostingClassifier (Tuned)",
        "test_size": len(X_test),
        "accuracy": round(float(acc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1": round(float(f1), 4),
        "roc_auc": round(float(roc_auc), 4),
        "average_precision": round(float(pr_auc), 4),
        "confusion_matrix": cm,
        "training_timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

    with open(FLU_METRICS_ARTIFACT_PATH, "w") as f:
        json.dump(metrics, f, indent=2)

    return metrics

if __name__ == "__main__":
    m = evaluate_disease_pipeline()
    print("=== EVALUATION METRICS ===")
    print(json.dumps(m, indent=2))
