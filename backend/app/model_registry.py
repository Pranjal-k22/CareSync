import json
import joblib
from pathlib import Path
from typing import Dict, Any, Tuple

ROOT = Path(__file__).resolve().parent.parent
REGISTRY_CONFIG_PATH = ROOT / "models" / "registry" / "registry_config.json"

_cached_models: Dict[str, Any] = {}
_cached_metadata: Dict[str, Dict[str, Any]] = {}

def get_registry_config() -> Dict[str, Any]:
    if not REGISTRY_CONFIG_PATH.exists():
        raise FileNotFoundError(f"Model registry config missing at {REGISTRY_CONFIG_PATH}")
    with open(REGISTRY_CONFIG_PATH, "r") as f:
        return json.load(f)

def get_model(model_key: str = "disease"):
    """
    Dynamically loads and returns cached model pipeline from central registry.
    """
    if model_key in _cached_models:
        return _cached_models[model_key]

    config = get_registry_config()
    if model_key not in config["registered_models"]:
        raise ValueError(f"Model key '{model_key}' not registered. Registered: {list(config['registered_models'].keys())}")

    raw_meta_file = config["registered_models"][model_key]["metadata_file"]
    meta_file = Path(raw_meta_file)
    if not meta_file.is_absolute():
        meta_file = ROOT.parent / raw_meta_file
    with open(meta_file, "r") as f:
        meta = json.load(f)

    raw_artifact_path = meta["artifact_path"]
    artifact_path = Path(raw_artifact_path)
    if not artifact_path.is_absolute():
        artifact_path = ROOT.parent / raw_artifact_path
    if not artifact_path.exists():
        raise FileNotFoundError(f"Model artifact not found at {artifact_path}")

    model_pipeline = joblib.load(artifact_path)
    _cached_models[model_key] = model_pipeline
    _cached_metadata[model_key] = meta

    return model_pipeline

def get_model_metadata(model_key: str = "disease") -> Dict[str, Any]:
    """
    Returns registered metadata for a given model key.
    """
    if model_key in _cached_metadata:
        return _cached_metadata[model_key]

    config = get_registry_config()
    if model_key not in config["registered_models"]:
        raise ValueError(f"Model key '{model_key}' not registered.")

    raw_meta_file = config["registered_models"][model_key]["metadata_file"]
    meta_file = Path(raw_meta_file)
    if not meta_file.is_absolute():
        meta_file = ROOT.parent / raw_meta_file
    with open(meta_file, "r") as f:
        meta = json.load(f)

    _cached_metadata[model_key] = meta
    return meta

def list_registered_models() -> Dict[str, Any]:
    """
    Lists all active registered models and versions.
    """
    config = get_registry_config()
    summary = {}
    for k in config["registered_models"].keys():
        meta = get_model_metadata(k)
        summary[k] = {
            "name": meta.get("model_name"),
            "version": meta.get("version"),
            "algorithm": meta.get("algorithm"),
            "target": meta.get("target"),
            "features_count": len(meta.get("feature_list", []))
        }
    return summary

if __name__ == "__main__":
    print("=== MODEL REGISTRY SUMMARY ===")
    print(json.dumps(list_registered_models(), indent=2))
