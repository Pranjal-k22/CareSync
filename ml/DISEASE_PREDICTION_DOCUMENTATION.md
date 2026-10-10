# 🩺 HealConnect Disease Prediction & Influenza Module

> **Mandatory Clinical Disclaimer**:
> *"This model predicts risk based on patterns learned from the training dataset. It does not constitute medical diagnosis."*

---

## 📌 Executive Overview
The **HealConnect Disease Prediction Module** extends the HealConnect Healthcare platform with a multi-class clinical decision-support engine. The engine predicts **Flu / Influenza** and **Fever-Related Conditions** alongside **Normal Baselines** using real patient vital signs, symptom severity scores, and demographic indicators.

---

## 📊 1. Dataset Specification
- **Dataset Source**: `datasets/disease_dataset/disease_prediction_dataset.csv`
- **Total Records**: `15,000` patient entries
- **Missing Values**: `0` (100% complete)
- **Duplicate Records**: `0`
- **Biological Bounds Audit**: Validated physiological ranges (`temp`: 34–43°C, `HR`: 30–230 BPM, `SpO2`: 50–100%).

---

## 🎯 2. Target Variable Analysis
The primary outcome column is `disease_label` / `disease_condition`:

| Class ID | Target Condition | Sample Count | Percentage (%) | Clinical Category |
| :---: | :--- | :---: | :---: | :--- |
| `0` | **Normal Baseline** | 6,744 | 44.96% | Non-infected control cohort |
| `1` | **Flu / Influenza** | 4,474 | 29.83% | Confirmed influenza infection |
| `2` | **Fever-Related Condition** | 3,782 | 25.21% | Non-flu febrile illness |

---

## 🧪 3. Clinical Features Schema
The predictive pipeline consumes 11 patient features:
- **Numerical Features (10)**: `temperature_c`, `heart_rate`, `spo2_pct`, `cough_severity`, `headache_severity`, `fatigue_score`, `chills`, `body_ache`, `sore_throat`, `age`
- **Categorical Features (1)**: `gender` (`Male`, `Female`)

---

## ⚙️ 4. Data Preprocessing Pipeline
Built using scikit-learn `Pipeline` and `ColumnTransformer`:
- **Numerical Pipeline**: `SimpleImputer(strategy='median')` -> `StandardScaler()`
- **Categorical Pipeline**: `SimpleImputer(strategy='most_frequent')` -> `OneHotEncoder(handle_unknown='ignore')`
- **Data Splitting**: 70% Train (`10,500`), 15% Validation (`2,250`), 15% Test (`2,250`) with zero patient overlap across splits.

---

## 🏆 5. Model Evaluation & Benchmarking
Evaluated 6 baseline classifier algorithms on the holdout test set:

| Model Name | Test Accuracy | Test Weighted F1 | Multi-Class ROC-AUC | Training Time |
| :--- | :---: | :---: | :---: | :---: |
| **Gradient Boosting (Tuned)** 🏆 | **96.58%** | **96.58%** | **99.70%** | `1.514s` |
| **Random Forest** | 96.58% | 96.58% | 99.65% | `0.101s` |
| **HistGradientBoosting** | 96.58% | 96.58% | 99.69% | `2.315s` |
| **Decision Tree** | 96.00% | 96.00% | 99.44% | `0.017s` |
| **Logistic Regression** | 95.96% | 95.96% | 99.58% | `0.027s` |
| **Linear SVM (Calibrated)** | 94.93% | 94.93% | 99.42% | `0.090s` |

---

## 🥇 6. Final Production Model
- **Selected Algorithm**: **Gradient Boosting Classifier** (`learning_rate=0.05`, `max_depth=5`, `n_estimators=100`)
- **Serialized Artifact**: `ml/artifacts/flu_model_v1.joblib` & `backend/models/flu_model_v1.joblib`
- **Final Metrics**:
  - **Accuracy**: `96.58%`
  - **Weighted F1-Score**: `96.58%`
  - **Multi-Class ROC-AUC**: `99.70%`
  - **Multi-Class PR-AUC**: `99.22%`

---

## 💻 7. Prediction & Inference Engine
Production inference is accessible via `predict_flu_risk(patient_data)` in `ml/disease/predict_flu.py` and `POST /predict-disease` on the FastAPI server:

```python
from ml.disease import predict_flu_risk

result = predict_flu_risk({
    "temperature_c": 38.9,
    "cough_severity": 3,
    "fatigue_score": 3,
    "spo2_pct": 95.0
})
```

---

## 🔬 8. SHAP Explainability & Attribution
Calculated using `shap.Explainer`. Key feature importance hierarchy:
1. `fatigue_score` (`41.88%`)
2. `cough_severity` (`27.69%`)
3. `temperature_c` (`18.08%`)
4. `spo2_pct` (`4.76%`)

---

## ⚠️ 9. Limitations & Clinical Disclaimer
- **Statistical Correlation**: Model feature weights represent decision-tree split contributions, not biological causation.
- **Population Constraints**: Predictions are optimized for adult inpatient & ambulatory screening cohorts.
- **Clinical Role**: Serves as a clinical decision-support recommendation tool. Final diagnostic authority remains strictly with licensed medical professionals.
