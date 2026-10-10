---
license: cc-by-4.0
language:
  - en
pretty_name: "Hospital Deterioration — Simulated Early Warning"
size_categories:
  - 100K<n<1M

task_categories:
  - tabular-classification
  - time-series-forecasting

tags:
  - healthcare
  - clinical
  - hospital
  - early-warning
  - sepsis
  - deterioration
  - time-series
  - tabular
  - machine-learning
  - classification
  - risk-prediction
  - synthetic-data
  - open-dataset
---


# 🏥 Hospital Deterioration — Simulated Early Warning  
### Clinical Time-Series Benchmark for Early Warning Models

A fully simulated **hospital cohort** for building and testing **early warning models** and **clinical deterioration risk scores**.  
Each admission includes up to **72 hours** of hourly data: vitals, labs, patient context, and multiple deterioration outcomes — with a main label for **“deterioration in the next 12 hours”**.

All records are **fully simulated**, **internally consistent**, and contain **no missing values**, making the dataset directly usable for **machine learning** and **time-series modeling**.

---

## ⚠️ Simulation & Privacy

- No row corresponds to a real patient or a real hospital.  
- All values are generated through a simulation pipeline designed to create **plausible clinical patterns**, not to reproduce real EHR data.  
- The dataset is intended for **research, education, and prototyping**, not for real clinical decision-making.

---

## 📘 Dataset Overview

| Field          | Description                                                                 |
|---------------|-----------------------------------------------------------------------------|
| **Files**     | `patients.csv`, `vitals_timeseries.csv`, `labs_timeseries.csv`, `hospital_deterioration_hourly_panel.csv`, `hospital_deterioration_ml_ready.csv` |
| **Patients**  | 10,000 admissions (one row per patient in `patients.csv`)                   |
| **Time span** | Up to 72 hours of follow-up per admission (`hour_from_admission` = 0–71)    |
| **Granularity** | Hourly time series per patient (vitals, labs, labels)                     |
| **Main target** | `deterioration_next_12h` (binary label, 0/1)                              |
| **Type**      | Tabular / time-series (simulated)                                           |

---

## 🧠 Feature Groups

### 🧍 Patient-Level Features (`patients.csv`)

- `patient_id`  
- `age`, `gender`  
- `comorbidity_index`  
- `admission_type` (ED / Elective / Transfer)  
- `baseline_risk_score` (latent baseline deterioration risk, 0–1)  
- `los_hours` (length of stay, 12–72 hours)  
- Deterioration summary outcomes:  
  - `deterioration_event`  
  - `deterioration_within_12h_from_admission`  
  - `deterioration_hour` (or -1 if no event)

---

### 📉 Hourly Vitals (`vitals_timeseries.csv`)

Per `(patient_id, hour_from_admission)`:

- `heart_rate`, `respiratory_rate`  
- `spo2_pct`, `temperature_c`  
- `systolic_bp`, `diastolic_bp`  
- `oxygen_device`, `oxygen_flow`  
- `mobility_score`  
- `nurse_alert`

**Consistency rule:**  
When `oxygen_device == "none"`, `oxygen_flow` is always `0.0`.

---

### 🧪 Hourly Labs (`labs_timeseries.csv`)

Per `(patient_id, hour_from_admission)`:

- `wbc_count`  
- `lactate`  
- `creatinine`  
- `crp_level`  
- `hemoglobin`  
- `sepsis_risk_score` (latent hourly sepsis risk, 0–1)

---

### 🧾 Joined Panel & ML-Ready View

- `hospital_deterioration_hourly_panel.csv`  
  - One row per `(patient_id, hour_from_admission)`  
  - Joins **vitals + labs + patient-level features + all deterioration labels**  
  - Useful for custom label definitions, multi-task learning, and advanced feature engineering.

- `hospital_deterioration_ml_ready.csv`  
  - Same hourly granularity  
  - **Features only** (vitals, labs, static features)  
  - **Single target**: `deterioration_next_12h` (0/1)  
  - Recommended entry point for most ML tasks.

---

## 🎯 Target Definition — `deterioration_next_12h`

The main label is:

- `deterioration_next_12h = 1`  
  if a deterioration event happens **after the current hour** and **within the next 12 hours**.

- `deterioration_next_12h = 0`  
  if:
  - there is **no event** in the stay, or  
  - the event is happening **now**, or  
  - it happens **more than 12 hours** later.

This framing mirrors real-world **early warning systems**:  
the model should trigger an alert **before** the deterioration happens, not at the same time.

---

## 🚀 Example Usage

```python
from datasets import load_dataset

dataset = load_dataset("TarekMasryo/hospital-deterioration-early-warning")

# Load ML-ready split as a pandas DataFrame
df = dataset["train"].to_pandas()

X = df.drop(columns=["deterioration_next_12h"])
y = df["deterioration_next_12h"]

print(X.shape, y.mean())
```

To reconstruct a full hourly panel from separate files (if you export them):

```python
import pandas as pd

patients = pd.read_csv("patients.csv")
vitals = pd.read_csv("vitals_timeseries.csv")
labs = pd.read_csv("labs_timeseries.csv")

panel = (
    vitals
    .merge(labs, on=["patient_id", "hour_from_admission"], how="inner")
    .merge(patients, on="patient_id", how="left")
)

print(panel.shape)
```

---

## 🔬 Research & Applications

- Early warning models for **clinical deterioration**  
- Sepsis and high-risk trajectory modeling  
- Sequence models over **hourly vitals + labs**  
- Risk score calibration and interpretability (e.g., SHAP, partial dependence)  
- Threshold tuning and policy design (balancing recall vs false alarms)  
- Teaching end-to-end **clinical ML pipelines** without real-patient data

---

## 🧩 Reproducibility

- No missing values  
- Clean numeric + categorical schema  
- Hourly-aligned time indexing (`hour_from_admission`)  
- Suitable for:
  - Classic ML (tree-based models, logistic regression)  
  - Deep learning (RNNs, Temporal CNNs, Transformers)  
  - Survival-like / time-to-event framing with custom labels

---

## 🧭 Ethical Considerations

- This dataset is **simulated** and must **not** be used for clinical decisions.  
- Patterns are **plausible**, not calibrated to any specific hospital, region, or population.  
- Any model trained on this data requires:
  - Validation on real EHR data  
  - Clinical oversight  
  - Regulatory and ethical review before deployment.

Treat this dataset as a **simulation benchmark** and a **teaching tool**, not as a substitute for real-world evidence.

---

## 📚 Citation

If you use this dataset, please cite:

> Tarek Masryo. “Hospital Deterioration — Simulated Early Warning.”  
> Simulation benchmark dataset for early clinical deterioration modeling and time-series ML.

You may also cite the Hugging Face dataset URL and any associated GitHub repository or notebooks.

---

## 📜 License

**CC BY 4.0 (Attribution Required)**  

Free to use, share, and modify with proper attribution.  
For full license terms: https://creativecommons.org/licenses/by/4.0/
