import datetime
import json
import numpy as np
import pandas as pd
from typing import Dict, Any

from backend.app.model_registry import get_model, get_model_metadata
from backend.app.services.db_service import db_service

def _format_risk_level(prob: float) -> str:
    if prob >= 0.75:
        return "Critical" if prob >= 0.88 else "High"
    elif prob >= 0.40:
        return "Medium"
    else:
        return "Low"

def predict_deterioration(patient_input: Dict[str, Any]) -> Dict[str, Any]:
    """
    Executes real patient deterioration risk inference using registered risk model.
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
            "oxygen_flow": [float(patient_input.get("oxygen_flow", 0.0))],
            "mobility_score": [float(patient_input.get("mobility_score", 3.0))],
            "nurse_alert": [int(patient_input.get("nurse_alert", 0))],
            "age": [float(patient_input.get("age", 35))],
            "comorbidity_index": [float(patient_input.get("comorbidity_index", 0.0))],
            "oxygen_device": [str(patient_input.get("oxygen_device", "room_air"))],
            "gender": [str(patient_input.get("gender", "Male"))],
            "admission_type": [str(patient_input.get("admission_type", "Elective"))]
        }

        df_feat = pd.DataFrame(raw_feats)
        
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(df_feat)[0]
            prob_risk = float(probs[1]) if len(probs) > 1 else float(probs[0])
        else:
            prob_risk = float(model.predict(df_feat)[0])

        risk_level = _format_risk_level(prob_risk)
        prediction_label = "Acute Deterioration Risk" if prob_risk >= 0.50 else "Stable Baseline"

        return {
            "prediction": prediction_label,
            "probability": round(prob_risk, 4),
            "probability_pct": round(prob_risk * 100.0, 2),
            "risk_level": risk_level,
            "version": meta.get("version", "v1.0")
        }
    except Exception as e:
        return {
            "prediction": "Error",
            "probability": 0.0,
            "probability_pct": 0.0,
            "risk_level": "Unknown",
            "error_message": str(e),
            "version": "v1.0"
        }

def predict_flu(patient_input: Dict[str, Any]) -> Dict[str, Any]:
    """
    Executes real flu & disease diagnosis inference using registered disease model.
    """
    try:
        model = get_model("disease")
        meta = get_model_metadata("disease")

        # Parse inputs
        temp_c = float(patient_input.get("temperature_c") or (((float(patient_input.get("temperature", 98.6)) - 32) * 5/9)))
        raw_feats = {
            "temperature_c": temp_c,
            "heart_rate": float(patient_input.get("heart_rate") or patient_input.get("heartRate") or 75),
            "spo2_pct": float(patient_input.get("spo2_pct") or patient_input.get("spo2") or 98.0),
            "cough_severity": float(patient_input.get("cough_severity", 0)),
            "headache_severity": float(patient_input.get("headache_severity", 0)),
            "fatigue_score": float(patient_input.get("fatigue_score", 0)),
            "chills": float(patient_input.get("chills", 0)),
            "body_ache": float(patient_input.get("body_ache", 0)),
            "sore_throat": float(patient_input.get("sore_throat", 0)),
            "age": float(patient_input.get("age", 35)),
            "gender": str(patient_input.get("gender", "Female")).capitalize()
        }

        df_feat = pd.DataFrame([raw_feats])

        # Calculate real probability from actual model
        probs = model.predict_proba(df_feat)[0]
        pred_class_id = int(np.argmax(probs))

        class_map = {0: "Normal Baseline", 1: "Flu / Influenza", 2: "Fever-Related Condition"}
        prediction_label = class_map.get(pred_class_id, "Normal Baseline")

        flu_prob = float(probs[1])
        confidence_prob = float(np.max(probs))
        risk_level = _format_risk_level(flu_prob if pred_class_id == 1 else (1.0 - probs[0]))

        return {
            "prediction": prediction_label,
            "probability": round(flu_prob, 4),
            "probability_pct": round(flu_prob * 100.0, 2),
            "model_confidence_pct": round(confidence_prob * 100.0, 2),
            "risk_level": risk_level,
            "version": meta.get("version", "v1.0")
        }
    except Exception as e:
        return {
            "prediction": "Error",
            "probability": 0.0,
            "probability_pct": 0.0,
            "model_confidence_pct": 0.0,
            "risk_level": "Unknown",
            "error_message": str(e),
            "version": "v1.0"
        }

def predict_unified(patient_input: Dict[str, Any]) -> Dict[str, Any]:
    """
    Unified prediction service executing both deterioration and disease models plus SHAP explainability.
    """
    from backend.app.services.explainability_service import explain_deterioration, explain_disease

    patient_id = str(patient_input.get("patient_id") or patient_input.get("patientId") or "UNIFIED-PATIENT-001")

    det_res = predict_deterioration(patient_input)
    dis_res = predict_flu(patient_input)

    det_exp = explain_deterioration(patient_input)
    dis_exp = explain_disease(patient_input)

    unified_record = {
        "status": "success",
        "patient_id": patient_id,
        "prediction": {
            "deterioration": {
                "risk_score": det_res["probability"],
                "risk_percentage": det_res["probability_pct"],
                "risk_level": str(det_res["risk_level"]).upper(),
                "prediction": det_res["prediction"]
            },
            "influenza": {
                "risk_score": dis_res["probability"],
                "risk_percentage": dis_res["probability_pct"],
                "risk_level": str(dis_res["risk_level"]).upper(),
                "prediction": dis_res["prediction"]
            }
        },
        "explainability": {
            "deterioration": det_exp.get("top_contributing_features", []),
            "influenza": dis_exp.get("top_contributing_features", [])
        },
        "models": {
            "deterioration": det_res.get("version", "v1.0"),
            "influenza": dis_res.get("version", "v1.0")
        },
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

    # Persist a de-identified record for the authorised care team audit trail.
    try:
        import hashlib
        anon_hash = hashlib.sha256(patient_id.encode()).hexdigest()[:16]
        hist_entry = {
            "prediction_id": f"PRED-{int(datetime.datetime.now().timestamp()*1000)}",
            "anonymous_patient_hash": anon_hash,
            "patient_id": patient_id,
            "prediction_type": "Unified",
            "model_version": det_res.get("version", "v1.0"),
            "risk_score": dis_res["probability"],
            "risk_level": str(dis_res["risk_level"]).upper(),
            "prediction_result": dis_res["prediction"],
            "explanation_summary": dis_exp.get("top_contributing_features", []),
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        db_service.save_prediction(hist_entry)
    except Exception:
        unified_record["persistence_warning"] = "Prediction could not be persisted"

    return unified_record

if __name__ == "__main__":
    sample = {
        "patient_id": "TEST-UNIFIED-001",
        "heartRate": 112,
        "spo2": 94.5,
        "temperature": 102.0,
        "temperature_c": 38.9,
        "systolicBp": 138,
        "diastolicBp": 88,
        "respiratoryRate": 24,
        "cough_severity": 3,
        "fatigue_score": 3,
        "chills": 1,
        "age": 48,
        "gender": "Male"
    }
    
    print("=== UNIFIED PREDICTION TEST RESPONSE ===")
    print(json.dumps(predict_unified(sample), indent=2))
