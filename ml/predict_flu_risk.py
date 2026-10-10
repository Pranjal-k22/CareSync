import os
import json
import joblib
import pandas as pd
import numpy as np

from pathlib import Path
from typing import Dict, Any, Union

ROOT = Path(__file__).resolve().parent
MODEL_PATH = ROOT / "artifacts" / "flu_model_v1.joblib"
ALT_MODEL_PATH = ROOT.parent / "backend" / "models" / "flu_model_v1.joblib"
METRICS_PATH = ROOT / "artifacts" / "flu_model_v1_metrics.json"

_loaded_pipeline = None
_loaded_metrics = None

def _get_pipeline():
    global _loaded_pipeline, _loaded_metrics
    if _loaded_pipeline is not None:
        return _loaded_pipeline, _loaded_metrics

    if MODEL_PATH.exists():
        _loaded_pipeline = joblib.load(MODEL_PATH)
    elif ALT_MODEL_PATH.exists():
        _loaded_pipeline = joblib.load(ALT_MODEL_PATH)
    else:
        raise FileNotFoundError("flu_model_v1.joblib artifact not found.")

    if METRICS_PATH.exists():
        with open(METRICS_PATH, "r") as f:
            _loaded_metrics = json.load(f)
    else:
        _loaded_metrics = {"version": "v1.0", "model_name": "HealConnect Flu Model"}

    return _loaded_pipeline, _loaded_metrics

REQUIRED_NUMERICAL_RANGES = {
    "temperature_c": (34.0, 43.0, 37.0),
    "heart_rate": (30, 230, 75),
    "spo2_pct": (50.0, 100.0, 98.0),
    "cough_severity": (0, 3, 0),
    "headache_severity": (0, 3, 0),
    "fatigue_score": (0, 3, 0),
    "chills": (0, 1, 0),
    "body_ache": (0, 1, 0),
    "sore_throat": (0, 1, 0),
    "age": (0, 120, 35)
}

def predict_flu_risk(patient_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Reusable custom patient influenza prediction function.
    
    Parameters:
        patient_data (dict): Dictionary containing patient clinical features.
        
    Returns:
        dict: Validated inference response containing prediction, probability, confidence, and version.
    """
    try:
        if not isinstance(patient_data, dict):
            return {
                "status": "error",
                "error_message": "Input patient_data must be a dictionary."
            }

        # 1. Validate & Parse Features
        validated_input = {}
        for num_feat, (min_v, max_v, default_v) in REQUIRED_NUMERICAL_RANGES.items():
            raw_val = patient_data.get(num_feat, default_v)
            try:
                val = float(raw_val)
            except (ValueError, TypeError):
                return {
                    "status": "error",
                    "error_message": f"Feature '{num_feat}' must be a numerical value. Got: {raw_val}"
                }

            if not (min_v <= val <= max_v):
                return {
                    "status": "error",
                    "error_message": f"Feature '{num_feat}' value {val} is outside valid physiological range [{min_v}, {max_v}]."
                }
            validated_input[num_feat] = val

        # Gender validation
        gender_raw = str(patient_data.get("gender", "Female")).strip().capitalize()
        if gender_raw not in ["Male", "Female"]:
            gender_raw = "Female"
        validated_input["gender"] = gender_raw

        # Patient ID
        patient_id = str(patient_data.get("patient_id", "CUSTOM-PATIENT-001"))

        # 2. Load Model Pipeline
        pipeline, metrics = _get_pipeline()

        # Build feature DataFrame
        df_feat = pd.DataFrame([validated_input])

        # 3. Apply Pipeline & Predict
        probs = pipeline.predict_proba(df_feat)[0]
        pred_class_id = int(np.argmax(probs))

        class_map = {
            0: "Normal Baseline",
            1: "Flu / Influenza",
            2: "Fever-Related Condition"
        }

        predicted_condition = class_map.get(pred_class_id, "Normal Baseline")
        influenza_prob = float(probs[1] * 100.0)
        confidence = float(np.max(probs) * 100.0)

        return {
            "status": "success",
            "patient_id": patient_id,
            "prediction": predicted_condition,
            "is_influenza": bool(pred_class_id == 1),
            "influenza_probability_pct": round(influenza_prob, 2),
            "model_confidence_pct": round(confidence, 2),
            "class_probabilities": {
                "Normal Baseline": round(float(probs[0] * 100.0), 2),
                "Flu / Influenza": round(float(probs[1] * 100.0), 2),
                "Fever-Related Condition": round(float(probs[2] * 100.0), 2)
            },
            "model_version": metrics.get("version", "v1.0"),
            "validated_input_features": validated_input,
            "disclaimer": "Academic decision-support prototype, not for real clinical diagnosis."
        }

    except Exception as e:
        return {
            "status": "error",
            "error_message": f"Inference pipeline error: {str(e)}"
        }

def create_interactive_widgets_ui():
    """Optional ipywidgets interactive UI wrapper (non-mandatory)."""
    try:
        import ipywidgets as widgets
        from IPython.display import display

        temp_w = widgets.FloatSlider(value=38.8, min=35.0, max=42.0, step=0.1, description='Temp (°C):')
        hr_w = widgets.IntSlider(value=105, min=40, max=180, step=1, description='Heart Rate:')
        spo2_w = widgets.FloatSlider(value=95.5, min=80.0, max=100.0, step=0.5, description='SpO2 (%):')
        cough_w = widgets.IntSlider(value=2, min=0, max=3, step=1, description='Cough (0-3):')
        chills_w = widgets.Dropdown(options=[(0, 'No'), (1, 'Yes')], value=1, description='Chills:')
        button_w = widgets.Button(description='Predict Risk', button_style='success')
        output_w = widgets.Output()

        def on_btn_click(b):
            with output_w:
                output_w.clear_output()
                data = {
                    "temperature_c": temp_w.value,
                    "heart_rate": hr_w.value,
                    "spo2_pct": spo2_w.value,
                    "cough_severity": cough_w.value,
                    "chills": chills_w.value
                }
                res = predict_flu_risk(data)
                print(json.dumps(res, indent=2))

        button_w.on_click(on_btn_click)
        display(widgets.VBox([temp_w, hr_w, spo2_w, cough_w, chills_w, button_w, output_w]))
    except ImportError:
        print("ipywidgets is not installed. Use predict_flu_risk(patient_data) directly.")

if __name__ == "__main__":
    test_sample = {
        "patient_id": "TEST-PATIENT-999",
        "temperature_c": 38.9,
        "heart_rate": 110,
        "spo2_pct": 95.0,
        "cough_severity": 3,
        "headache_severity": 2,
        "fatigue_score": 3,
        "chills": 1,
        "body_ache": 1,
        "sore_throat": 1,
        "age": 45,
        "gender": "Male"
    }
    
    result = predict_flu_risk(test_sample)
    print("=== TEST PATIENT PREDICTION RESPONSE ===")
    print(json.dumps(result, indent=2))
