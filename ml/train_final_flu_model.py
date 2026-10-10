import datetime
import json
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder, label_binarize
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score, precision_recall_fscore_support, roc_auc_score, average_precision_score, confusion_matrix
)

ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = ROOT / "ml/data/cleaned_disease_dataset.csv"
ARTIFACTS_DIR = ROOT / "ml/artifacts"
BACKEND_DIR = ROOT / "backend/models"

ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
BACKEND_DIR.mkdir(parents=True, exist_ok=True)

def main():
    print("==================================================")
    print("PHASE 12 — FINAL FLU / INFLUENZA MODEL TRAINING")
    print("==================================================")

    df = pd.read_csv(DATA_PATH)
    target_col = "disease_label"
    exclude_cols = ["patient_id", "disease_condition", "disease_label"]
    feature_cols = [c for c in df.columns if c not in exclude_cols]

    num_cols = ["temperature_c", "heart_rate", "spo2_pct", "cough_severity", "headache_severity", "fatigue_score", "chills", "body_ache", "sore_throat", "age"]
    cat_cols = ["gender"]

    X = df[feature_cols]
    y = df[target_col]

    # Split 70% Train, 15% Val, 15% Test
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.30, random_state=42, stratify=y
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp
    )

    # Combine Train + Validation for final fit (12,750 samples)
    X_train_val = pd.concat([X_train, X_val])
    y_train_val = pd.concat([y_train, y_val])

    print(f"Combined Train + Val shape: {X_train_val.shape} (12,750 samples)")
    print(f"Untouched Final Test shape: {X_test.shape} (2,250 samples)")

    # Preprocessor
    preprocessor = ColumnTransformer(transformers=[
        ("num", Pipeline(steps=[("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())]), num_cols),
        ("cat", Pipeline(steps=[("imputer", SimpleImputer(strategy="most_frequent")), ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))]), cat_cols)
    ])

    # Final Tuned Gradient Boosting Pipeline
    final_pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", GradientBoostingClassifier(
            learning_rate=0.05,
            max_depth=5,
            n_estimators=100,
            random_state=42
        ))
    ])

    print("\nFitting final pipeline on combined Train + Validation dataset...")
    final_pipeline.fit(X_train_val, y_train_val)

    print("Evaluating EXACTLY ONCE on untouched final test set...")
    y_test_pred = final_pipeline.predict(X_test)
    y_test_probs = final_pipeline.predict_proba(X_test)

    acc = accuracy_score(y_test, y_test_pred)
    prec, rec, f1, _ = precision_recall_fscore_support(y_test, y_test_pred, average="weighted")
    roc_auc = roc_auc_score(y_test, y_test_probs, multi_class="ovr", average="weighted")

    y_test_bin = label_binarize(y_test, classes=[0, 1, 2])
    pr_auc = average_precision_score(y_test_bin, y_test_probs, average="weighted")
    cm = confusion_matrix(y_test, y_test_pred).tolist()

    # Save Model Pipeline Artifacts
    model_artifact_path = ARTIFACTS_DIR / "flu_model_v1.joblib"
    backend_model_path = BACKEND_DIR / "flu_model_v1.joblib"
    metrics_path = ARTIFACTS_DIR / "flu_model_v1_metrics.json"

    joblib.dump(final_pipeline, model_artifact_path)
    joblib.dump(final_pipeline, backend_model_path)

    timestamp_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

    metrics_payload = {
        "model_name": "HealConnect Flu & Disease Diagnosis Model",
        "version": "v1.0",
        "algorithm": "GradientBoostingClassifier (Tuned)",
        "hyperparameters": {
            "learning_rate": 0.05,
            "max_depth": 5,
            "n_estimators": 100
        },
        "features": feature_cols,
        "numerical_features": num_cols,
        "categorical_features": cat_cols,
        "dataset_information": {
            "dataset_name": "Disease Diagnosis Dataset",
            "total_samples": len(df),
            "train_val_samples": len(X_train_val),
            "test_samples": len(X_test),
            "classes": {
                "0": "Normal Baseline",
                "1": "Flu / Influenza",
                "2": "Fever-Related Condition"
            }
        },
        "test_size": len(X_test),
        "accuracy": round(float(acc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1": round(float(f1), 4),
        "roc_auc": round(float(roc_auc), 4),
        "average_precision": round(float(pr_auc), 4),
        "confusion_matrix": cm,
        "training_timestamp": timestamp_iso
    }

    with open(metrics_path, "w") as f:
        json.dump(metrics_payload, f, indent=2)

    print("\n=== FINAL TEST EVALUATION RESULTS ===")
    print(f"Model Name:         {metrics_payload['model_name']}")
    print(f"Version:            {metrics_payload['version']}")
    print(f"Accuracy:           {acc * 100:.2f}%")
    print(f"Precision:          {prec * 100:.2f}%")
    print(f"Recall:             {rec * 100:.2f}%")
    print(f"F1-Score:           {f1 * 100:.2f}%")
    print(f"ROC-AUC:            {roc_auc * 100:.2f}%")
    print(f"Average Precision:  {pr_auc * 100:.2f}%")
    print(f"\nFinal Model saved to:   {model_artifact_path}")
    print(f"Metrics saved to:       {metrics_path}")

if __name__ == "__main__":
    main()
