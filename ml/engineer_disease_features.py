import pandas as pd
import numpy as np
import json
import joblib
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score

ROOT = Path(__file__).resolve().parent.parent

def add_derived_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    
    # 1. Fever Severity Index (Degree above normal 37.0°C)
    df["fever_severity_index"] = (df["temperature_c"] - 37.0).clip(lower=0.0)
    
    # 2. Total Systemic Symptom Score (Range 0 - 12)
    df["symptom_total_score"] = (
        df["cough_severity"] + 
        df["headache_severity"] + 
        df["fatigue_score"] + 
        df["chills"] + 
        df["body_ache"] + 
        df["sore_throat"]
    )
    
    # 3. Cardiorespiratory Stress Ratio (Pulse vs Oxygen Saturation)
    df["cardiorespiratory_stress_ratio"] = df["heart_rate"] / (df["spo2_pct"] + 1e-5)
    
    # 4. Classic Acute Flu Triad Flag (Chills + Body Ache + Moderate-to-Severe Cough)
    df["flu_symptom_triad"] = (
        (df["chills"] == 1) & 
        (df["body_ache"] == 1) & 
        (df["cough_severity"] >= 2)
    ).astype(int)
    
    return df

def main():
    print("==================================================")
    print("PHASE 8 — CLINICAL FEATURE ENGINEERING (DISEASE)")
    print("==================================================")
    
    data_path = ROOT / "ml/data/cleaned_disease_dataset.csv"
    df_raw = pd.read_csv(data_path)
    
    df_eng = add_derived_features(df_raw)
    
    target_col = "disease_label"
    exclude_cols = ["patient_id", "disease_condition", "disease_label", "gender"]
    feature_cols = [c for c in df_eng.columns if c not in exclude_cols]
    
    X = df_eng[feature_cols]
    y = df_eng[target_col]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    clf = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42, class_weight="balanced")
    clf.fit(X_train, y_train)
    
    importances = clf.feature_importances_
    feat_imp = sorted(zip(feature_cols, importances), key=lambda x: x[1], reverse=True)
    
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average="weighted")
    
    report = {
        "feature_engineering_version": "v1.0-CLINICAL",
        "total_features": len(feature_cols),
        "derived_features": [
            {
                "feature": "fever_severity_index",
                "formula": "max(0, temperature_c - 37.0)",
                "clinical_rationale": "Quantifies degree of fever elevation above baseline normal 37°C core body temperature."
            },
            {
                "feature": "symptom_total_score",
                "formula": "cough_severity + headache_severity + fatigue_score + chills + body_ache + sore_throat",
                "clinical_rationale": "Aggregates overall systemic viral symptom burden score (range 0 to 12)."
            },
            {
                "feature": "cardiorespiratory_stress_ratio",
                "formula": "heart_rate / spo2_pct",
                "clinical_rationale": "Measures pulse rate elevation relative to arterial oxygen saturation."
            },
            {
                "feature": "flu_symptom_triad",
                "formula": "chills==1 AND body_ache==1 AND cough_severity>=2",
                "clinical_rationale": "Binary indicator for classic acute influenza triad presentation."
            }
        ],
        "feature_importance_ranking": [{"feature": f, "importance": round(float(imp), 4)} for f, imp in feat_imp],
        "model_performance_with_derived": {
            "accuracy": round(float(acc), 4),
            "f1_score": round(float(f1), 4)
        }
    }
    
    out_path = ROOT / "ml/artifacts/feature_engineering_report.json"
    with open(out_path, "w") as f:
        json.dump(report, f, indent=2)
        
    print("\nFeature Importance Ranking:")
    for f, imp in feat_imp:
        print(f"  - {f:32s}: {imp*100:.2f}%")
        
    print(f"\nAccuracy with Engineered Features: {acc * 100:.2f}%")
    print(f"Weighted F1 with Engineered Features: {f1 * 100:.2f}%")
    print(f"\nReport written to: {out_path}")

if __name__ == "__main__":
    main()
