---
license: mit
---
# ❤️ Heart Disease Dataset (Enhanced with Feature Engineering)

## 📌 Overview

This dataset is an **enhanced version of the classic UCI Heart Disease dataset**, enriched with extensive **feature engineering** to support advanced data analysis and machine learning applications.

In addition to the original clinical features, several **derived variables** have been introduced to provide deeper insights into cardiovascular risk patterns. These engineered features allow for improved predictive modeling and more robust exploratory data analysis.

---

## 📊 Original Features

| Column | Description |
|--------|-------------|
| `age` | Age of the patient (years) |
| `sex` | Gender (1 = male, 0 = female) |
| `cp` | Chest pain type (1 = typical angina, 2 = atypical angina, 3 = non-anginal pain, 4 = asymptomatic) |
| `trestbps` | Resting blood pressure (mm Hg) |
| `chol` | Serum cholesterol (mg/dl) |
| `fbs` | Fasting blood sugar > 120 mg/dl (1 = true, 0 = false) |
| `restecg` | Resting electrocardiographic results (0 = normal, 1 = ST-T abnormality, 2 = left ventricular hypertrophy) |
| `thalach` | Maximum heart rate achieved |
| `exang` | Exercise-induced angina (1 = yes, 0 = no) |
| `oldpeak` | ST depression induced by exercise |
| `slope` | Slope of the peak exercise ST segment (1 = upsloping, 2 = flat, 3 = downsloping) |
| `ca` | Number of major vessels colored by fluoroscopy |
| `thal` | Thalassemia (3 = normal, 6 = fixed defect, 7 = reversible defect) |
| `num` | Diagnosis of heart disease (0 = no disease, 1-4 = disease severity levels) |

---

## 🧠 Engineered Features

| Feature | Description |
|--------|-------------|
| `age_group` | Age category (`30s`, `40s`, `50s`, `60s`) |
| `cholesterol_level` | Cholesterol status (`low`, `normal`, `high`) |
| `bp_level` | Blood pressure status (`low`, `normal`, `high`) |
| `risk_score` | Composite risk score: (`age * chol / 1000 + trestbps / 100`) |
| `symptom_severity` | Severity index based on symptoms: (`cp * oldpeak`) |
| `log_chol` | Logarithm of cholesterol level |
| `log_trestbps` | Logarithm of resting blood pressure |
| `age_squared` | Square of patient age |
| `chol_squared` | Square of cholesterol level |
| `age_thalach_ratio` | Ratio of max heart rate to age (plus 1) |
| `risk_factor` | Advanced risk factor: (`cp * oldpeak * thal`) |
| `missing_values` | Count of missing values in `ca` and `thal` |
| `chol_trestbps_ratio` | Ratio of cholesterol to resting BP |
| `log_thalach_chol` | Log of (heart rate × cholesterol) |
| `symptom_zscore` | Z-score of symptom severity |
| `avg_chol_by_age_group` | Average cholesterol for corresponding age group |
| `thalach_chol_diff` | Difference between max heart rate and cholesterol |
| `symptom_severity_diff` | Deviation from average symptom severity by age group |
| `age_chol_effect` | Product of age and cholesterol |
| `thalach_risk_effect` | Product of max heart rate and risk score |
| `age_trestbps_effect` | Product of age and resting BP |
| `chol_risk_ratio` | Ratio of cholesterol to risk score |

---

## 💡 Use Cases

- Cardiovascular risk prediction using machine learning
- Exploratory data analysis for medical research
- Feature selection and dimensionality reduction tutorials
- Educational purposes in data science and healthcare analytics
- Model interpretability studies using engineered variables

---

## 📁 File Info

- **Format**: CSV or DataFrame (depending on hosting)
- **Instances**: ~300 patients
- **License**: MIT (Open Source)
- **Source**: Based on UCI Heart Disease Dataset + custom engineered features

---

## 📬 Citation & Contact

If you use this dataset in your research or application, please consider citing the original UCI dataset and giving credit to this enhanced version's author.

**Author**: [nezahatkk](https://huggingface.co/nezahatkk)  
**GitHub**: [https://github.com/nezahatkk](https://github.com/nezahatkk)

---

