import pandas as pd
import numpy as np
import joblib
import json
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

def train_risk_model():
    data_path = "datasets/cleaned_hospital_data.csv"
    models_dir = "backend/models"
    os.makedirs(models_dir, exist_ok=True)

    print(f"Loading cleaned data from {data_path}...")
    df = pd.read_csv(data_path)

    # Features and Target
    feature_cols = ['heart_rate', 'spo2', 'temperature', 'systolic_bp', 'diastolic_bp', 'respiratory_rate', 'age', 'gender']
    target_col = 'deterioration_next_12h'

    X = df[feature_cols]
    y = df[target_col]

    # Split 80% train, 20% test
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)
    print(f"Training set: {X_train.shape[0]} rows | Testing set: {X_test.shape[0]} rows")

    # Train Random Forest Classifier
    print("Training Random Forest Classifier (n_estimators=100)...")
    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=12,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )
    clf.fit(X_train, y_train)

    # Evaluate
    y_pred = clf.predict(X_test)
    y_prob = clf.predict_proba(X_test)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    cm = confusion_matrix(y_test, y_pred).tolist()

    print("\n================ MODEL EVALUATION METRICS ================")
    print(f"Model Version: v1.0")
    print(f"Accuracy:      {acc * 100:.2f}%")
    print(f"Precision:     {prec * 100:.2f}%")
    print(f"Recall:        {rec * 100:.2f}%")
    print(f"F1-Score:      {f1 * 100:.2f}%")
    print(f"Confusion Matrix:\n{np.array(cm)}")
    print("==========================================================\n")

    # Save trained model artifact
    model_path = os.path.join(models_dir, "risk_model.joblib")
    joblib.dump(clf, model_path)
    print(f"Saved trained Random Forest model to {model_path}")

    # Save model metadata
    metadata = {
        "model_version": "v1.0",
        "algorithm": "RandomForestClassifier",
        "n_estimators": 100,
        "max_depth": 12,
        "features": feature_cols,
        "accuracy": round(acc * 100, 2),
        "precision": round(prec * 100, 2),
        "recall": round(rec * 100, 2),
        "f1_score": round(f1 * 100, 2),
        "confusion_matrix": cm,
        "trained_samples": X_train.shape[0],
        "test_samples": X_test.shape[0]
    }
    meta_path = os.path.join(models_dir, "model_metadata.json")
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)

    return clf, metadata

if __name__ == "__main__":
    train_risk_model()
