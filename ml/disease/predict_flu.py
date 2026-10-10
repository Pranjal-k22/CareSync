import json
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any

from .config import FLU_MODEL_ARTIFACT_PATH, BACKEND_FLU_MODEL_PATH, FLU_METRICS_ARTIFACT_PATH, CLASS_MAPPING
from .preprocessing import validate_disease_data

_cached_pipeline = None
_cached_version = "v1.0"

def _get_model():
    global _cached_pipeline, _cached_version
    if _cached_pipeline is not None:
        return _cached_pipeline, _cached_version

    if FLU_MODEL_ARTIFACT_PATH.exists():
        _cached_pipeline = joblib.load(FLU_MODEL_ARTIFACT_PATH)
    elif BACKEND_FLU_MODEL_PATH.exists():
        _cached_pipeline = joblib.load(BACKEND_FLU_MODEL_PATH)
    else:
        raise FileNotFoundError("Flu model joblib artifact not found.")

    if FLU_METRICS_ARTIFACT_PATH.exists():
        try:
            with open(FLU_METRICS_ARTIFACT_PATH, "r") as f:
                data = json.load(f)
                _cached_version = data.get("version", "v1.0")
        except Exception:
            _cached_version = "v1.0"

    return _cached_pipeline, _cached_version

def predict_flu_risk(patient_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Production inference function for custom patient influenza prediction.
    """
    is_valid, err_msg, validated_feats = validate_disease_data(patient_data)
    if not is_valid:
        return {
            "status": "error",
            "error_message": err_msg
        }

    try:
        pipeline, version = _get_model()
        df_feat = pd.DataFrame([validated_feats])

        probs = pipeline.predict_proba(df_feat)[0]
        pred_class_id = int(np.argmax(probs))

        pred_condition = CLASS_MAPPING.get(pred_class_id, "Normal Baseline")
        flu_prob = float(probs[1] * 100.0)
        confidence = float(np.max(probs) * 100.0)

        return {
            "status": "success",
            "patient_id": str(patient_data.get("patient_id", "PATIENT-001")),
            "prediction": pred_condition,
            "is_influenza": bool(pred_class_id == 1),
            "influenza_probability_pct": round(flu_prob, 2),
            "model_confidence_pct": round(confidence, 2),
            "class_probabilities": {
                "Normal Baseline": round(float(probs[0] * 100.0), 2),
                "Flu / Influenza": round(float(probs[1] * 100.0), 2),
                "Fever-Related Condition": round(float(probs[2] * 100.0), 2)
            },
            "model_version": version,
            "validated_input_features": validated_feats
        }

    except Exception as e:
        return {
            "status": "error",
            "error_message": f"Inference engine failure: {str(e)}"
        }

if __name__ == "__main__":
    sample = {"temperature_c": 39.1, "cough_severity": 3, "fatigue_score": 3}
    print(json.dumps(predict_flu_risk(sample), indent=2))
