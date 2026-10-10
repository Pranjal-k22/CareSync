import json
import shap
import numpy as np
import pandas as pd
from typing import Dict, Any, List

from backend.app.model_registry import get_model, get_model_metadata

DISCLAIMER_TEXT = (
    "MODEL EXPLANATION DISCLAIMER: SHAP feature values represent mathematical decision-tree "
    "split contributions to the model's predictive output, NOT direct biological clinical causation."
)

def explain_deterioration(patient_input: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes optimized local SHAP TreeExplainer feature attributions for patient deterioration risk.
    """
    try:
        model = get_model("deterioration")
        meta = get_model_metadata("deterioration")

        raw_temp = float(patient_input.get("temperature") or patient_input.get("temperature_c") or 37.0)
        temp_c = (raw_temp - 32.0) * 5/9 if raw_temp > 50.0 else raw_temp

        raw_feats = {
            "heart_rate": [float(patient_input.get("heartRate") or patient_input.get("heart_rate") or 75)],
            "respiratory_rate": [float(patient_input.get("respiratoryRate") or patient_input.get("respiratory_rate") or 16)],
            "spo2_pct": [float(patient_input.get("spo2") or patient_input.get("spo2_pct") or 98.0)],
            "temperature_c": [temp_c],
            "systolic_bp": [float(patient_input.get("systolicBp") or patient_input.get("systolic_bp") or 120)],
            "diastolic_bp": [float(patient_input.get("diastolicBp") or patient_input.get("diastolic_bp") or 80)],
            "oxygen_flow": [float(patient_input.get("oxygen_flow") or 0.0)],
            "mobility_score": [float(patient_input.get("mobility_score") or 3.0)],
            "nurse_alert": [int(patient_input.get("nurse_alert") or 0)],
            "age": [float(patient_input.get("age") or 35.0)],
            "comorbidity_index": [float(patient_input.get("comorbidity_index") or 0.0)],
            "oxygen_device": [str(patient_input.get("oxygen_device") or "room_air")],
            "gender": [str(patient_input.get("gender") or "Male")],
            "admission_type": [str(patient_input.get("admission_type") or "Elective")]
        }

        df_feat = pd.DataFrame(raw_feats)

        # Extract classifier if model is a scikit-learn Pipeline
        if hasattr(model, "named_steps"):
            preprocessor = model.named_steps["preprocessor"]
            classifier = model.named_steps["classifier"]
            X_trans = preprocessor.transform(df_feat)
            feature_names = list(preprocessor.get_feature_names_out())
        else:
            classifier = model
            X_trans = df_feat.values
            feature_names = list(df_feat.columns)

        # Compute SHAP TreeExplainer on single sample
        explainer = shap.TreeExplainer(classifier)
        shap_vals = explainer.shap_values(X_trans, check_additivity=False)

        if isinstance(shap_vals, list):
            s_array = shap_vals[1][0] if len(shap_vals) > 1 else shap_vals[0][0]
        elif shap_vals.ndim == 3:
            s_array = shap_vals[0, :, 1]
        else:
            s_array = shap_vals[0]

        probs = model.predict_proba(df_feat)[0]
        prob_risk = float(probs[1]) if len(probs) > 1 else float(probs[0])

        factors = []
        for name, val, s_val in zip(feature_names, X_trans[0], s_array):
            clean_name = name.replace("num__", "").replace("cat__", "")
            factors.append({
                "feature": clean_name,
                "input_value": round(float(val), 2),
                "shap_value": round(float(s_val), 4),
                "direction": "increases_risk" if s_val > 0 else "reduces_risk",
                "magnitude": round(abs(float(s_val)), 4)
            })

        factors = sorted(factors, key=lambda x: x["magnitude"], reverse=True)

        return {
            "status": "success",
            "model_type": "Patient Deterioration Risk Model",
            "model_version": meta.get("version", "v1.0"),
            "risk_score_pct": round(prob_risk * 100.0, 2),
            "top_contributing_features": factors[:5],
            "all_feature_attributions": factors,
            "disclaimer": DISCLAIMER_TEXT
        }
    except Exception as e:
        return {
            "status": "error",
            "error_message": f"Deterioration explainability error: {str(e)}"
        }

def explain_disease(patient_input: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes local feature attributions for flu and disease diagnosis.
    """
    try:
        from ml.disease.explain_flu import explain_patient_prediction
        res = explain_patient_prediction(patient_input)
        if res.get("status") == "success":
            res["disclaimer"] = DISCLAIMER_TEXT
        return res
    except Exception as e:
        return {
            "status": "error",
            "error_message": f"Disease explainability error: {str(e)}"
        }

if __name__ == "__main__":
    sample = {
        "patient_id": "EXPLAIN-TEST-001",
        "heartRate": 115,
        "spo2": 91,
        "temperature": 101.5,
        "cough_severity": 3,
        "fatigue_score": 3,
        "age": 52
    }
    
    print("=== DETERIORATION SHAP EXPLANATION ===")
    print(json.dumps(explain_deterioration(sample), indent=2))
    
    print("\n=== DISEASE SHAP EXPLANATION ===")
    print(json.dumps(explain_disease(sample), indent=2))
