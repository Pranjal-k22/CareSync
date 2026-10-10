import pandas as pd
import numpy as np
import os

def prepare_hospital_deterioration_data():
    raw_path = "datasets/hospital-deterioration/hospital_deterioration_ml_ready.csv"
    output_dir = "datasets"
    os.makedirs(output_dir, exist_ok=True)

    print(f"Reading raw dataset from {raw_path}...")
    df = pd.read_csv(raw_path)

    # 1. Remove duplicate rows
    initial_len = len(df)
    df = df.drop_duplicates()
    print(f"Removed {initial_len - len(df)} duplicate rows. Total rows: {len(df)}")

    # 2. Convert temperature from Celsius to Fahrenheit if needed
    if 'temperature_c' in df.columns:
        df['temperature'] = round(df['temperature_c'] * 1.8 + 32, 1)
    elif 'temperature' in df.columns:
        df['temperature'] = df['temperature']
    else:
        df['temperature'] = 98.6

    # Rename spo2_pct to spo2
    if 'spo2_pct' in df.columns:
        df['spo2'] = df['spo2_pct']

    # Select core target features
    feature_cols = [
        'heart_rate',
        'spo2',
        'temperature',
        'systolic_bp',
        'diastolic_bp',
        'respiratory_rate',
        'age',
        'gender'
    ]
    target_col = 'deterioration_next_12h'

    # Filter columns
    df_clean = df[feature_cols + [target_col]].copy()

    # 3. Handle missing values
    for col in ['heart_rate', 'spo2', 'temperature', 'systolic_bp', 'diastolic_bp', 'respiratory_rate', 'age']:
        if col in df_clean.columns:
            df_clean[col] = df_clean[col].fillna(df_clean[col].median())

    # 4. Encode gender (Male -> 1, Female -> 0)
    df_clean['gender_encoded'] = df_clean['gender'].apply(lambda g: 1 if str(g).lower() == 'male' or str(g).lower() == 'm' else 0)

    # Replace gender column with encoded version
    df_clean['gender'] = df_clean['gender_encoded']
    df_clean = df_clean.drop(columns=['gender_encoded'])

    # Final feature column order
    clean_cols = ['heart_rate', 'spo2', 'temperature', 'systolic_bp', 'diastolic_bp', 'respiratory_rate', 'age', 'gender', target_col]
    df_clean = df_clean[clean_cols]

    # Save cleaned dataset
    cleaned_csv_path = os.path.join(output_dir, "cleaned_hospital_data.csv")
    df_clean.to_csv(cleaned_csv_path, index=False)
    print(f"Saved cleaned dataset to {cleaned_csv_path} with shape {df_clean.shape}")

    # 5. Partition dataset into 3 simulated hospitals for Federated Learning
    shuffled = df_clean.sample(frac=1, random_state=42).reset_index(drop=True)
    n = len(shuffled)
    n_a = int(n * 0.4)
    n_b = int(n * 0.3)

    hosp_a = shuffled.iloc[:n_a]
    hosp_b = shuffled.iloc[n_a:n_a+n_b]
    hosp_c = shuffled.iloc[n_a+n_b:]

    hosp_a.to_csv(os.path.join(output_dir, "hospital_a.csv"), index=False)
    hosp_b.to_csv(os.path.join(output_dir, "hospital_b.csv"), index=False)
    hosp_c.to_csv(os.path.join(output_dir, "hospital_c.csv"), index=False)

    print(f"Federated hospital datasets created: Hospital A ({len(hosp_a)}), Hospital B ({len(hosp_b)}), Hospital C ({len(hosp_c)})")
    return cleaned_csv_path

if __name__ == "__main__":
    prepare_hospital_deterioration_data()
