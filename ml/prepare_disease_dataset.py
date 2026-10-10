import numpy as np
import pandas as pd
from pathlib import Path
import json

def generate_disease_dataset(n_samples: int = 15000, random_state: int = 42) -> pd.DataFrame:
    np.random.seed(random_state)

    # 1. Generate demographic & physiological features
    age = np.random.randint(12, 85, size=n_samples)
    gender = np.random.choice(["Male", "Female"], size=n_samples)

    # 3 disease categories:
    # 0: Normal / Mild Baseline
    # 1: Flu / Influenza
    # 2: Fever-Related Condition (Viral / High Fever)
    labels = np.random.choice([0, 1, 2], size=n_samples, p=[0.45, 0.30, 0.25])

    temp = []
    hr = []
    spo2 = []
    cough = []
    headache = []
    fatigue = []
    chills = []
    body_ache = []
    sore_throat = []

    for l in labels:
        if l == 0:  # Normal / Baseline
            temp.append(round(np.random.normal(36.8, 0.3), 1))
            hr.append(int(np.random.normal(74, 8)))
            spo2.append(round(np.random.uniform(97.0, 100.0), 1))
            cough.append(np.random.choice([0, 1], p=[0.8, 0.2]))
            headache.append(np.random.choice([0, 1], p=[0.85, 0.15]))
            fatigue.append(np.random.choice([0, 1], p=[0.75, 0.25]))
            chills.append(0)
            body_ache.append(0)
            sore_throat.append(np.random.choice([0, 1], p=[0.9, 0.1]))
        elif l == 1:  # Flu / Influenza
            temp.append(round(np.random.normal(38.6, 0.6), 1))
            hr.append(int(np.random.normal(98, 12)))
            spo2.append(round(np.random.uniform(93.0, 97.5), 1))
            cough.append(np.random.choice([1, 2, 3], p=[0.2, 0.5, 0.3]))
            headache.append(np.random.choice([1, 2, 3], p=[0.3, 0.4, 0.3]))
            fatigue.append(np.random.choice([2, 3], p=[0.4, 0.6]))
            chills.append(np.random.choice([0, 1], p=[0.2, 0.8]))
            body_ache.append(np.random.choice([0, 1], p=[0.1, 0.9]))
            sore_throat.append(np.random.choice([0, 1], p=[0.3, 0.7]))
        else:  # Fever-Related Condition (High Fever / Dengue / Typhoid)
            temp.append(round(np.random.normal(39.4, 0.5), 1))
            hr.append(int(np.random.normal(110, 14)))
            spo2.append(round(np.random.uniform(94.0, 98.0), 1))
            cough.append(np.random.choice([0, 1, 2], p=[0.5, 0.3, 0.2]))
            headache.append(np.random.choice([2, 3], p=[0.3, 0.7]))
            fatigue.append(np.random.choice([2, 3], p=[0.3, 0.7]))
            chills.append(np.random.choice([0, 1], p=[0.1, 0.9]))
            body_ache.append(np.random.choice([0, 1], p=[0.2, 0.8]))
            sore_throat.append(np.random.choice([0, 1], p=[0.6, 0.4]))

    condition_names = {
        0: "Normal Baseline",
        1: "Flu / Influenza",
        2: "Fever-Related Condition"
    }

    df = pd.DataFrame({
        "patient_id": [f"DIS-{1000 + i}" for i in range(n_samples)],
        "age": age,
        "gender": gender,
        "temperature_c": temp,
        "heart_rate": hr,
        "spo2_pct": spo2,
        "cough_severity": cough,
        "headache_severity": headache,
        "fatigue_score": fatigue,
        "chills": chills,
        "body_ache": body_ache,
        "sore_throat": sore_throat,
        "disease_label": labels,
        "disease_condition": [condition_names[l] for l in labels]
    })

    return df

def main():
    root = Path("/Users/omraj/Downloads/Heal_connectmain")
    datasets_dir = root / "datasets/disease_dataset"
    ml_data_dir = root / "ml/data"
    
    datasets_dir.mkdir(parents=True, exist_ok=True)
    ml_data_dir.mkdir(parents=True, exist_ok=True)

    print("Generating separate Disease Dataset (Flu / Influenza & Fever-Related Conditions)...")
    df = generate_disease_dataset(n_samples=15000, random_state=42)

    raw_path = datasets_dir / "disease_prediction_dataset.csv"
    cleaned_path = ml_data_dir / "cleaned_disease_dataset.csv"

    df.to_csv(raw_path, index=False)
    df.to_csv(cleaned_path, index=False)

    summary = {
        "dataset_name": "Disease Dataset (Flu / Influenza & Fever-Related Condition)",
        "total_records": len(df),
        "columns": df.columns.tolist(),
        "class_distribution": df["disease_condition"].value_counts().to_dict(),
        "files_saved": [str(raw_path), str(cleaned_path)]
    }

    print(json.dumps(summary, indent=2))

if __name__ == "__main__":
    main()
