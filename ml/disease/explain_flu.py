import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any

from .config import FLU_MODEL_ARTIFACT_PATH, NUMERICAL_COLS, CATEGORICAL_COLS
from .preprocessing import validate_disease_data

def explain_patient_prediction(patient_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate local feature contribution explanation for a patient sample.
    """
    is_valid, err_msg, validated_feats = validate_disease_data(patient_data)
    if not is_valid:
        return {"status": "error", "error_message": err_msg}

    try:
        pipeline = joblib.load(FLU_MODEL_ARTIFACT_PATH)
        preprocessor = pipeline.named_steps["preprocessor"]
        classifier = pipeline.named_steps["classifier"]

        df_feat = pd.DataFrame([validated_feats])
        X_trans = preprocessor.transform(df_feat)[0]

        cat_onehot_names = list(preprocessor.named_transformers_["cat"].named_steps["onehot"].get_feature_names_out(CATEGORICAL_COLS))
        feature_names = NUMERICAL_COLS + cat_onehot_names
        importances = classifier.feature_importances_

        factors = []
        for f_name, f_val, imp in zip(feature_names, X_trans, importances):
            # Compute heuristic directional contribution
            direction = "increases_risk" if f_val > 0 else "reduces_risk"
            factors.append({
                "feature": f_name,
                "value": round(float(f_val), 3),
                "model_importance_weight": round(float(imp), 4),
                "directional_effect": direction
            })

        factors = sorted(factors, key=lambda x: x["model_importance_weight"], reverse=True)

        return {
            "status": "success",
            "patient_id": str(patient_data.get("patient_id", "PATIENT-001")),
            "top_contributing_features": factors[:5],
            "all_features": factors,
            "disclaimer": "Model explanation reflects tree-split statistical weight, NOT biological causation."
        }

    except Exception as e:
        return {"status": "error", "error_message": f"Explainability error: {str(e)}"}

if __name__ == "__main__":
    sample = {"temperature_c": 39.1, "cough_severity": 3, "fatigue_score": 3}
    import json
    print(json.dumps(explain_patient_prediction(sample), indent=2))
