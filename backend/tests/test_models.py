import pytest
import pandas as pd
import numpy as np
from backend.app.model_registry import get_model, get_model_metadata

def test_deterioration_model_loads():
    model = get_model("deterioration")
    assert model is not None
    meta = get_model_metadata("deterioration")
    assert meta["model_key"] == "deterioration"

def test_disease_model_loads():
    model = get_model("disease")
    assert model is not None
    meta = get_model_metadata("disease")
    assert meta["model_key"] == "disease"

def test_model_feature_schema():
    det_meta = get_model_metadata("deterioration")
    dis_meta = get_model_metadata("disease")
    assert len(det_meta["feature_list"]) > 0
    assert len(dis_meta["feature_list"]) > 0

def test_model_prediction_and_probability():
    dis_model = get_model("disease")
    sample_df = pd.DataFrame([{
        "temperature_c": 38.8,
        "heart_rate": 110.0,
        "spo2_pct": 94.0,
        "cough_severity": 3.0,
        "headache_severity": 2.0,
        "fatigue_score": 3.0,
        "chills": 1.0,
        "body_ache": 1.0,
        "sore_throat": 1.0,
        "age": 45.0,
        "gender": "Male"
    }])
    
    probs = dis_model.predict_proba(sample_df)[0]
    assert len(probs) == 3
    assert 0.0 <= probs[1] <= 1.0
