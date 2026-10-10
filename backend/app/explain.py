import joblib
import numpy as np
import pandas as pd
import shap
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
MODEL_PATH = PROJECT_ROOT / "ml/artifacts/risk_model_v1.joblib"
if not MODEL_PATH.exists():
    MODEL_PATH = PROJECT_ROOT / "backend/models/risk_model.joblib"

NUMERIC_FEATURES = [
    "heart_rate", "respiratory_rate", "spo2_pct", "temperature_c",
    "systolic_bp", "diastolic_bp", "oxygen_flow", "mobility_score",
    "nurse_alert", "age", "comorbidity_index"
]
CATEGORICAL_FEATURES = ["oxygen_device", "gender", "admission_type"]
FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES

def base_feature_name(transformed_name: str) -> str:
    name = transformed_name.replace("numeric__", "").replace("categorical__", "")
    for feature in CATEGORICAL_FEATURES:
        if name == feature or name.startswith(f"{feature}_"):
            return feature
    return name

def class_one_values(values: object) -> np.ndarray:
    if isinstance(values, list):
        idx = 1 if len(values) > 1 else 0
        val = values[idx]
        return np.asarray(val)[0] if np.asarray(val).ndim > 1 else np.asarray(val)
    array = np.asarray(values)
    if array.ndim == 3:
        idx = 1 if array.shape[2] > 1 else 0
        return array[0, :, idx]
    elif array.ndim == 2:
        return array[0]
    return array.flatten()

def explain_vitals_record(record_df, model=None):
    if isinstance(record_df, dict):
        raw_input_dict = record_df
    elif isinstance(record_df, pd.DataFrame) and len(record_df) > 0:
        raw_input_dict = record_df.iloc[0].to_dict()
    else:
        raw_input_dict = {}

    raw_temp = float(raw_input_dict.get("temperature_c") or raw_input_dict.get("temperature") or 37.0)
    temp_c = (raw_temp - 32.0) * 5.0 / 9.0 if raw_temp > 50.0 else raw_temp

    full_dict = {
        "heart_rate": float(raw_input_dict.get("heart_rate") or raw_input_dict.get("heartRate") or 76.0),
        "respiratory_rate": float(raw_input_dict.get("respiratory_rate") or raw_input_dict.get("respiratoryRate") or 16.0),
        "spo2_pct": float(raw_input_dict.get("spo2_pct") or raw_input_dict.get("spo2") or 98.0),
        "temperature_c": temp_c,
        "systolic_bp": float(raw_input_dict.get("systolic_bp") or raw_input_dict.get("systolicBp") or 120.0),
        "diastolic_bp": float(raw_input_dict.get("diastolic_bp") or raw_input_dict.get("diastolicBp") or 80.0),
        "oxygen_flow": float(raw_input_dict.get("oxygen_flow") or 0.0),
        "mobility_score": float(raw_input_dict.get("mobility_score") or 3.0),
        "nurse_alert": int(raw_input_dict.get("nurse_alert") or 0),
        "age": float(raw_input_dict.get("age") or 35.0),
        "comorbidity_index": float(raw_input_dict.get("comorbidity_index") or 0.0),
        "oxygen_device": str(raw_input_dict.get("oxygen_device") or "room_air"),
        "gender": str(raw_input_dict.get("gender") or "Male"),
        "admission_type": str(raw_input_dict.get("admission_type") or "Elective")
    }
    record_df = pd.DataFrame([full_dict])

    if model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Trained model not found at {MODEL_PATH}")
        model = joblib.load(MODEL_PATH)

    if hasattr(model, "named_steps"):
        preprocessor = model.named_steps["preprocessor"]
        classifier = model.named_steps["classifier"]
        cols = [c for c in FEATURES if c in record_df.columns]
        transformed_record = preprocessor.transform(record_df[cols])
        if hasattr(transformed_record, "toarray"):
            transformed_record = transformed_record.toarray()
        transformed_record = np.asarray(transformed_record)
        transformed_names = preprocessor.get_feature_names_out()
    else:
        classifier = model
        if hasattr(model, "feature_names_in_"):
            cols = list(model.feature_names_in_)
            transformed_record = record_df[[c for c in cols if c in record_df.columns]].values
            transformed_names = cols
        else:
            cols = [c for c in FEATURES if c in record_df.columns]
            transformed_record = record_df[cols].values
            transformed_names = cols

    explainer = shap.TreeExplainer(classifier)
    shap_values = class_one_values(explainer.shap_values(transformed_record, check_additivity=False))

    contributions: dict[str, float] = {}
    for feature, value in zip(transformed_names, shap_values):
        key = base_feature_name(str(feature))
        contributions[key] = contributions.get(key, 0.0) + float(value)

    factors = []
    for feature, contribution in sorted(contributions.items(), key=lambda item: abs(item[1]), reverse=True):
        raw_val = raw_input_dict.get(feature, "N/A")
        factors.append({
            "feature": feature,
            "value": raw_val.item() if hasattr(raw_val, "item") else raw_val,
            "shap_value": round(contribution, 6),
            "effect": "increases_risk" if contribution > 0 else "reduces_risk"
        })

    return factors

get_shap_explanation_for_vitals = explain_vitals_record
