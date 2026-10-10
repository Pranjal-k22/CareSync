import json
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix, roc_auc_score

ROOT = Path(__file__).resolve().parent.parent

def build_and_train_disease_pipeline():
    print("==================================================")
    print("PHASE 6 — PREPROCESSING & MODEL PIPELINE (DISEASE)")
    print("==================================================")
    
    data_path = ROOT / "ml/data/cleaned_disease_dataset.csv"
    artifacts_dir = ROOT / "ml/artifacts"
    backend_dir = ROOT / "backend/models"
    artifacts_dir.mkdir(parents=True, exist_ok=True)
    backend_dir.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(data_path)
    
    # Target column
    target_col = "disease_label"
    
    # Exclude IDs, leakage, and target
    exclude_cols = ["patient_id", "disease_condition", "disease_label"]
    feature_cols = [c for c in df.columns if c not in exclude_cols]
    
    num_cols = ["temperature_c", "heart_rate", "spo2_pct", "cough_severity", "headache_severity", "fatigue_score", "chills", "body_ache", "sore_throat", "age"]
    cat_cols = ["gender"]
    
    X = df[feature_cols]
    y = df[target_col]

    # STEP 1: SPLIT FIRST (70% Train, 15% Val, 15% Test)
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.30, random_state=42, stratify=y
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp
    )

    print(f"X_train shape: {X_train.shape} (Fitted strictly on Train)")
    print(f"X_val shape:   {X_val.shape}")
    print(f"X_test shape:  {X_test.shape}")

    # STEP 2: BUILD COLUMN TRANSFORMER & PIPELINE
    num_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    cat_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    preprocessor = ColumnTransformer(transformers=[
        ("num", num_transformer, num_cols),
        ("cat", cat_transformer, cat_cols)
    ])

    full_pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("classifier", RandomForestClassifier(
            n_estimators=100,
            max_depth=12,
            random_state=42,
            class_weight="balanced"
        ))
    ])

    # STEP 3: FIT PIPELINE ONLY ON TRAINING DATA
    print("\nFitting ColumnTransformer + RandomForest Pipeline on X_train ONLY...")
    full_pipeline.fit(X_train, y_train)

    # STEP 4: EVALUATE ON VALIDATION & TEST SETS
    y_val_pred = full_pipeline.predict(X_val)
    val_acc = accuracy_score(y_val, y_val_pred)

    y_test_pred = full_pipeline.predict(X_test)
    y_test_probs = full_pipeline.predict_proba(X_test)
    
    test_acc = float(accuracy_score(y_test, y_test_pred))
    test_prec, test_rec, test_f1, _ = precision_recall_fscore_support(y_test, y_test_pred, average="weighted")
    test_roc_auc = float(roc_auc_score(y_test, y_test_probs, multi_class="ovr", average="weighted"))
    test_cm = confusion_matrix(y_test, y_test_pred).tolist()

    # STEP 5: SAVE COMPLETE PIPELINE OBJECT
    model_artifact_path = artifacts_dir / "disease_model_v1.joblib"
    backend_model_path = backend_dir / "disease_model.joblib"
    metrics_path = artifacts_dir / "disease_model_v1_metrics.json"

    joblib.dump(full_pipeline, model_artifact_path)
    joblib.dump(full_pipeline, backend_model_path)

    metrics_payload = {
        "model_version": "v1.0",
        "algorithm": "scikit-learn Pipeline (ColumnTransformer + RandomForestClassifier)",
        "features": feature_cols,
        "numerical_features": num_cols,
        "categorical_features": cat_cols,
        "classes": {
            "0": "Normal Baseline",
            "1": "Flu / Influenza",
            "2": "Fever-Related Condition"
        },
        "validation_metrics": {
            "accuracy": round(val_acc, 4)
        },
        "test_metrics": {
            "accuracy": round(test_acc, 4),
            "precision": round(float(test_prec), 4),
            "recall": round(float(test_rec), 4),
            "f1_score": round(float(test_f1), 4),
            "roc_auc": round(test_roc_auc, 4)
        },
        "confusion_matrix": test_cm,
        "fitted_on_train_only": True
    }

    with open(metrics_path, "w") as f:
        json.dump(metrics_payload, f, indent=2)

    print("\n=== PIPELINE TRAINING & EVALUATION COMPLETED ===")
    print(f"Validation Accuracy: {val_acc * 100:.2f}%")
    print(f"Test Accuracy:       {test_acc * 100:.2f}%")
    print(f"Test Weighted F1:    {test_f1 * 100:.2f}%")
    print(f"Test Multi-Class ROC:{test_roc_auc * 100:.2f}%")
    print(f"Pipeline saved to:   {model_artifact_path}")
    print(f"Backend copy saved:  {backend_model_path}")

if __name__ == "__main__":
    build_and_train_disease_pipeline()
