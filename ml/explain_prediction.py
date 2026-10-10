"""Generate a clinician-readable SHAP explanation for a HealConnect prediction."""

from __future__ import annotations

import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import shap

from train_risk_model import CATEGORICAL_FEATURES, FEATURES, INPUT, MODEL_PATH, NUMERIC_FEATURES, PROJECT_ROOT


OUTPUT = PROJECT_ROOT / "ml/artifacts/sample_shap_explanation.json"


def risk_level(probability: float) -> str:
    if probability >= 0.50:
        return "high"
    if probability >= 0.25:
        return "medium"
    return "low"


def base_feature_name(transformed_name: str) -> str:
    """Map one-hot encoded feature names back to clinician-facing names."""
    name = transformed_name.replace("numeric__", "").replace("categorical__", "")
    for feature in CATEGORICAL_FEATURES:
        if name == feature or name.startswith(f"{feature}_"):
            return feature
    return name


def class_one_values(values: object) -> np.ndarray:
    """Normalise SHAP's output across supported SHAP versions."""
    if isinstance(values, list):
        return np.asarray(values[1])[0]
    array = np.asarray(values)
    if array.ndim == 3:
        return array[0, :, 1]
    return array[0]


def main() -> None:
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Train the model first: {MODEL_PATH}")

    data = pd.read_csv(INPUT)
    model = joblib.load(MODEL_PATH)
    X = data[FEATURES]
    probabilities = model.predict_proba(X)[:, 1]

    # Use the highest-risk available record for an easily visible demo result.
    row_index = int(np.argmax(probabilities))
    record = X.iloc[[row_index]]
    probability = float(probabilities[row_index])

    preprocessor = model.named_steps["preprocessor"]
    classifier = model.named_steps["classifier"]
    transformed_record = preprocessor.transform(record)
    if hasattr(transformed_record, "toarray"):
        transformed_record = transformed_record.toarray()
    transformed_record = np.asarray(transformed_record)

    explainer = shap.TreeExplainer(classifier)
    shap_values = class_one_values(explainer.shap_values(transformed_record))
    transformed_names = preprocessor.get_feature_names_out()

    # Combine one-hot categorical values under their original input feature.
    contributions: dict[str, float] = {}
    for feature, value in zip(transformed_names, shap_values):
        key = base_feature_name(str(feature))
        contributions[key] = contributions.get(key, 0.0) + float(value)

    factors = []
    for feature, contribution in sorted(contributions.items(), key=lambda item: abs(item[1]), reverse=True):
        raw_value = record.iloc[0][feature]
        factors.append(
            {
                "feature": feature,
                "value": raw_value.item() if hasattr(raw_value, "item") else raw_value,
                "shap_value": round(contribution, 6),
                "effect": "increases_risk" if contribution > 0 else "reduces_risk",
            }
        )

    output = {
        "model_version": "v1.0",
        "patient_id": int(data.iloc[row_index]["patient_id"]),
        "hour_from_admission": int(data.iloc[row_index]["hour_from_admission"]),
        "risk_score": round(probability * 100, 2),
        "risk_level": risk_level(probability),
        "actual_deterioration_next_12h": int(data.iloc[row_index]["deterioration_next_12h"]),
        "top_factors": factors[:8],
        "note": "SHAP values explain this model output only; they are not clinical advice.",
    }
    OUTPUT.write_text(json.dumps(output, indent=2) + "\n", encoding="utf-8")

    print(f"Saved explanation: {OUTPUT.relative_to(PROJECT_ROOT)}")
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
