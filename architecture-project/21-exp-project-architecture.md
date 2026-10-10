# 21 — Experimental Laboratory (`exp_project`) Architecture

> **Path:** `architecture-project/21-exp-project-architecture.md`  
> **Status:** Experimental Research Sandbox Prototypes  

```mermaid
flowchart TD
    subgraph Exp_Lab["exp_project/ Isolated Research Sandbox"]
        CNN_Proto["ecg_arrhythmia_prototype.py (1D-CNN / Isolation Forest)"]
        FHIR_Proto["fhir_r4_serializer.py (HL7 FHIR R4 JSON Exporter)"]
        DP_Proto["federated_differential_privacy.py (Laplace NoisePerturbation)"]
    end

    subgraph Main_System["HealConnect Core System"]
        BackendAPI["FastAPI Core Backend"]
        FL_System["Flower Federated Learning Engine"]
    end

    CNN_Proto -.->|Future Integration| BackendAPI
    FHIR_Proto -.->|Future Integration| BackendAPI
    DP_Proto -.->|Integration| FL_System
```

## Prototype Descriptions
1. **`ecg_arrhythmia_prototype.py`:** Unsupervised anomaly detection on Lead-II waveforms via Isolation Forest.
2. **`fhir_r4_serializer.py`:** Converts internal schemas to standard HL7 FHIR R4 `Patient` and `Observation` JSON resources.
3. **`federated_differential_privacy.py`:** Implements Laplace noise parameter perturbation for $(\epsilon, \delta)$-differential privacy.
