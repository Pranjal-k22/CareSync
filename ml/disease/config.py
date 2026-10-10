from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DISEASE_DATA_PATH = BASE_DIR / "ml" / "data" / "cleaned_disease_dataset.csv"
ARTIFACTS_DIR = BASE_DIR / "ml" / "artifacts"
BACKEND_MODELS_DIR = BASE_DIR / "backend" / "models"

FLU_MODEL_ARTIFACT_PATH = ARTIFACTS_DIR / "flu_model_v1.joblib"
FLU_METRICS_ARTIFACT_PATH = ARTIFACTS_DIR / "flu_model_v1_metrics.json"

BACKEND_FLU_MODEL_PATH = BACKEND_MODELS_DIR / "flu_model_v1.joblib"

# Model Configuration
RANDOM_STATE = 42
TEST_SIZE = 0.15
VAL_SIZE = 0.15
TRAIN_SIZE = 0.70

TARGET_COL = "disease_label"
EXCLUDE_COLS = ["patient_id", "disease_condition", "disease_label"]

NUMERICAL_COLS = [
    "temperature_c",
    "heart_rate",
    "spo2_pct",
    "cough_severity",
    "headache_severity",
    "fatigue_score",
    "chills",
    "body_ache",
    "sore_throat",
    "age"
]

CATEGORICAL_COLS = ["gender"]

FEATURE_COLS = NUMERICAL_COLS + CATEGORICAL_COLS

CLASS_MAPPING = {
    0: "Normal Baseline",
    1: "Flu / Influenza",
    2: "Fever-Related Condition"
}

NUMERICAL_RANGES = {
    "temperature_c": (34.0, 43.0),
    "heart_rate": (30, 230),
    "spo2_pct": (50.0, 100.0),
    "cough_severity": (0, 3),
    "headache_severity": (0, 3),
    "fatigue_score": (0, 3),
    "chills": (0, 1),
    "body_ache": (0, 1),
    "sore_throat": (0, 1),
    "age": (0, 120)
}
