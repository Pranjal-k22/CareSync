import time
import json
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

from sklearn.model_selection import train_test_split, GridSearchCV, StratifiedKFold
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder, label_binarize

from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score, precision_recall_fscore_support, roc_auc_score, average_precision_score, confusion_matrix
)

ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = ROOT / "ml/data/cleaned_disease_dataset.csv"
ARTIFACTS_DIR = ROOT / "ml/artifacts"
BACKEND_DIR = ROOT / "backend/models"

sns.set_theme(style="whitegrid", palette="muted")
plt.rcParams['font.sans-serif'] = 'Helvetica'

def main():
    print("==================================================")
    print("PHASE 10 & 11 — MODEL COMPARISON & HYPERPARAMETER TUNING")
    print("==================================================")

    df = pd.read_csv(DATA_PATH)
    target_col = "disease_label"
    exclude_cols = ["patient_id", "disease_condition", "disease_label"]
    feature_cols = [c for c in df.columns if c not in exclude_cols]

    num_cols = ["temperature_c", "heart_rate", "spo2_pct", "cough_severity", "headache_severity", "fatigue_score", "chills", "body_ache", "sore_throat", "age"]
    cat_cols = ["gender"]

    X = df[feature_cols]
    y = df[target_col]

    # Split: 70% Train, 15% Val, 15% Test
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.30, random_state=42, stratify=y
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp
    )

    # Preprocessor
    preprocessor = ColumnTransformer(transformers=[
        ("num", Pipeline(steps=[("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())]), num_cols),
        ("cat", Pipeline(steps=[("imputer", SimpleImputer(strategy="most_frequent")), ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))]), cat_cols)
    ])

    # Candidate 1: Random Forest
    rf_pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", RandomForestClassifier(random_state=42, class_weight="balanced", n_jobs=-1))
    ])

    param_grid_rf = {
        "classifier__n_estimators": [100, 150],
        "classifier__max_depth": [10, 14],
        "classifier__min_samples_split": [2, 5]
    }

    print("\nExecuting 5-Fold Stratified CV Tuning on Train Set (Random Forest)...")
    cv_rf = GridSearchCV(rf_pipeline, param_grid_rf, cv=5, scoring="f1_weighted", n_jobs=-1)
    cv_rf.fit(X_train, y_train)

    print(f"Best RF Parameters: {cv_rf.best_params_}")
    print(f"Best RF CV Weighted F1: {cv_rf.best_score_ * 100:.2f}%")

    # Candidate 2: Gradient Boosting
    gb_pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", GradientBoostingClassifier(random_state=42))
    ])

    param_grid_gb = {
        "classifier__n_estimators": [100, 150],
        "classifier__max_depth": [3, 5],
        "classifier__learning_rate": [0.05, 0.1]
    }

    print("\nExecuting 5-Fold Stratified CV Tuning on Train Set (Gradient Boosting)...")
    cv_gb = GridSearchCV(gb_pipeline, param_grid_gb, cv=5, scoring="f1_weighted", n_jobs=-1)
    cv_gb.fit(X_train, y_train)

    print(f"Best GB Parameters: {cv_gb.best_params_}")
    print(f"Best GB CV Weighted F1: {cv_gb.best_score_ * 100:.2f}%")

    # Select Best Overall Tuned Model
    if cv_gb.best_score_ >= cv_rf.best_score_:
        best_pipeline = cv_gb.best_estimator_
        best_name = "Gradient Boosting (Tuned)"
        best_cv_score = cv_gb.best_score_
        best_params = cv_gb.best_params_
    else:
        best_pipeline = cv_rf.best_estimator_
        best_name = "Random Forest (Tuned)"
        best_cv_score = cv_rf.best_score_
        best_params = cv_rf.best_params_

    print(f"\n🏆 Best Overall Tuned Pipeline: {best_name}")

    # Evaluate on Untouched Final Test Set
    y_test_pred = best_pipeline.predict(X_test)
    y_test_probs = best_pipeline.predict_proba(X_test)

    acc = accuracy_score(y_test, y_test_pred)
    prec, rec, f1, _ = precision_recall_fscore_support(y_test, y_test_pred, average="weighted")
    roc_auc = roc_auc_score(y_test, y_test_probs, multi_class="ovr", average="weighted")

    # Binarize labels for PR-AUC / Average Precision
    y_test_bin = label_binarize(y_test, classes=[0, 1, 2])
    pr_auc = average_precision_score(y_test_bin, y_test_probs, average="weighted")

    cm = confusion_matrix(y_test, y_test_pred).tolist()

    # Save Best Tuned Model
    model_artifact_path = ARTIFACTS_DIR / "disease_model_v1.joblib"
    backend_model_path = BACKEND_DIR / "disease_model.joblib"
    joblib.dump(best_pipeline, model_artifact_path)
    joblib.dump(best_pipeline, backend_model_path)

    report_payload = {
        "tuning_version": "v1.0-5FOLD-CV",
        "selected_best_model": best_name,
        "best_cv_f1_score": round(float(best_cv_score), 4),
        "best_hyperparameters": best_params,
        "final_untouched_test_metrics": {
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4),
            "roc_auc": round(float(roc_auc), 4),
            "pr_auc_average_precision": round(float(pr_auc), 4)
        },
        "confusion_matrix": cm
    }

    report_out = ARTIFACTS_DIR / "hyperparameter_tuning_report.json"
    with open(report_out, "w") as f:
        json.dump(report_payload, f, indent=2)

    print("\n=== FINAL UNTOUCHED TEST SET EVALUATION ===")
    print(f"Accuracy:                 {acc * 100:.2f}%")
    print(f"Precision (Weighted):     {prec * 100:.2f}%")
    print(f"Recall (Sensitivity):     {rec * 100:.2f}%")
    print(f"F1-Score (Weighted):      {f1 * 100:.2f}%")
    print(f"Multi-Class ROC-AUC:      {roc_auc * 100:.2f}%")
    print(f"Multi-Class PR-AUC:       {pr_auc * 100:.2f}%")
    print(f"\nTuned Model saved to:     {model_artifact_path}")
    print(f"Tuning Report saved to:   {report_out}")

if __name__ == "__main__":
    main()
