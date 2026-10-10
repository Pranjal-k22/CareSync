import json
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix, roc_auc_score, classification_report

def main():
    root = Path(__file__).resolve().parent.parent
    data_path = root / "ml/data/cleaned_disease_dataset.csv"
    artifacts_dir = root / "ml/artifacts"
    artifacts_dir.mkdir(parents=True, exist_ok=True)

    print("Loading cleaned Disease Dataset...")
    df = pd.read_csv(data_path)

    # Feature columns & Target
    feature_cols = [
        "temperature_c", "heart_rate", "spo2_pct", "cough_severity",
        "headache_severity", "fatigue_score", "chills", "body_ache", "sore_throat", "age"
    ]
    target_col = "disease_label"

    X = df[feature_cols]
    y = df[target_col]

    # Split train/test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("Training Multi-Class Random Forest Disease Classifier...")
    clf = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42, class_weight="balanced")
    clf.fit(X_train, y_train)

    # Predict probabilities and classes
    y_pred = clf.predict(X_test)
    y_probs = clf.predict_proba(X_test)

    # Calculate actual metrics from holdout test set
    acc = float(accuracy_score(y_test, y_pred))
    prec, rec, f1, _ = precision_recall_fscore_support(y_test, y_pred, average="weighted")
    roc_auc = float(roc_auc_score(y_test, y_probs, multi_class="ovr", average="weighted"))
    cm = confusion_matrix(y_test, y_pred).tolist()

    model_path = artifacts_dir / "disease_model_v1.joblib"
    metrics_path = artifacts_dir / "disease_model_v1_metrics.json"

    joblib.dump(clf, model_path)

    metrics_payload = {
        "model_version": "v1.0",
        "algorithm": "RandomForestClassifier (Multi-Class Disease)",
        "features": feature_cols,
        "classes": {
            0: "Normal Baseline",
            1: "Flu / Influenza",
            2: "Fever-Related Condition"
        },
        "metrics": {
            "accuracy": round(acc, 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4),
            "roc_auc": round(roc_auc, 4)
        },
        "confusion_matrix": cm
    }

    with open(metrics_path, "w") as f:
        json.dump(metrics_payload, f, indent=2)

    print("=== DISEASE MODEL TRAINING COMPLETED ===")
    print(f"Accuracy:           {acc * 100:.2f}%")
    print(f"Precision:          {prec * 100:.2f}%")
    print(f"Recall:             {rec * 100:.2f}%")
    print(f"Weighted F1:        {f1 * 100:.2f}%")
    print(f"Multi-Class ROC-AUC:{roc_auc * 100:.2f}%")
    print(f"Model saved to:     {model_path}")
    print(f"Metrics saved to:   {metrics_path}")

if __name__ == "__main__":
    main()
