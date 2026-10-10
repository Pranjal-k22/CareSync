import pandas as pd
import numpy as np
import json
from pathlib import Path
from sklearn.model_selection import train_test_split, GroupShuffleSplit

ROOT = Path("/Users/omraj/Downloads/Heal_connectmain")

def split_disease_dataset():
    print("\n--- 1. SPLITTING DISEASE DIAGNOSIS DATASET ---")
    df_path = ROOT / "ml/data/cleaned_disease_dataset.csv"
    df = pd.read_csv(df_path)
    
    # 15,000 unique patients
    target_col = "disease_label"
    
    # First split: 70% Train, 30% Temp (Val + Test)
    train_df, temp_df = train_test_split(
        df, test_size=0.30, random_state=42, stratify=df[target_col]
    )
    
    # Second split: Split Temp 50/50 into Validation (15%) and Test (15%)
    val_df, test_df = train_test_split(
        temp_df, test_size=0.50, random_state=42, stratify=temp_df[target_col]
    )
    
    summary = {
        "dataset_name": "Disease Diagnosis Dataset",
        "total_records": len(df),
        "unique_patients": df["patient_id"].nunique(),
        "strategy": "Stratified 3-Way Patient-Level Split (70% Train, 15% Val, 15% Test)",
        "train_set": {
            "records": len(train_df),
            "pct": round(len(train_df) / len(df) * 100, 2),
            "class_distribution": train_df[target_col].value_counts().to_dict()
        },
        "validation_set": {
            "records": len(val_df),
            "pct": round(len(val_df) / len(df) * 100, 2),
            "class_distribution": val_df[target_col].value_counts().to_dict()
        },
        "test_set": {
            "records": len(test_df),
            "pct": round(len(test_df) / len(df) * 100, 2),
            "class_distribution": test_df[target_col].value_counts().to_dict()
        },
        "patient_overlap_check": {
            "train_val_overlap": len(set(train_df["patient_id"]).intersection(set(val_df["patient_id"]))),
            "train_test_overlap": len(set(train_df["patient_id"]).intersection(set(test_df["patient_id"]))),
            "val_test_overlap": len(set(val_df["patient_id"]).intersection(set(test_df["patient_id"])))
        }
    }
    
    return summary

def split_deterioration_dataset():
    print("\n--- 2. SPLITTING HOSPITAL DETERIORATION DATASET ---")
    df_path = ROOT / "ml/data/cleaned_hospital_deterioration.csv"
    df = pd.read_csv(df_path)
    
    target_col = "deterioration_next_12h"
    group_col = "patient_id"
    
    # Group-level split by patient_id: 70% Train patients, 30% Temp patients
    gss1 = GroupShuffleSplit(n_splits=1, test_size=0.30, random_state=42)
    train_idx, temp_idx = next(gss1.split(df, df[target_col], groups=df[group_col]))
    
    train_df = df.iloc[train_idx]
    temp_df = df.iloc[temp_idx]
    
    # Second Group-level split on temp_df: 50/50 Val/Test patients
    gss2 = GroupShuffleSplit(n_splits=1, test_size=0.50, random_state=42)
    val_idx, test_idx = next(gss2.split(temp_df, temp_df[target_col], groups=temp_df[group_col]))
    
    val_df = temp_df.iloc[val_idx]
    test_df = temp_df.iloc[test_idx]
    
    summary = {
        "dataset_name": "Hospital Deterioration Dataset",
        "total_records": len(df),
        "total_patients": df[group_col].nunique(),
        "strategy": "Patient-Level GroupShuffleSplit by patient_id (70% Train, 15% Val, 15% Test)",
        "train_set": {
            "records": len(train_df),
            "patients": train_df[group_col].nunique(),
            "pct_records": round(len(train_df) / len(df) * 100, 2),
            "class_distribution": train_df[target_col].value_counts().to_dict()
        },
        "validation_set": {
            "records": len(val_df),
            "patients": val_df[group_col].nunique(),
            "pct_records": round(len(val_df) / len(df) * 100, 2),
            "class_distribution": val_df[target_col].value_counts().to_dict()
        },
        "test_set": {
            "records": len(test_df),
            "patients": test_df[group_col].nunique(),
            "pct_records": round(len(test_df) / len(df) * 100, 2),
            "class_distribution": test_df[target_col].value_counts().to_dict()
        },
        "patient_overlap_check": {
            "train_val_overlap": len(set(train_df[group_col]).intersection(set(val_df[group_col]))),
            "train_test_overlap": len(set(train_df[group_col]).intersection(set(test_df[group_col]))),
            "val_test_overlap": len(set(val_df[group_col]).intersection(set(test_df[group_col])))
        }
    }
    
    return summary

def main():
    s_disease = split_disease_dataset()
    s_deter = split_deterioration_dataset()
    
    payload = {
        "split_version": "v1.0-LEAKAGE-SAFE",
        "timestamp": pd.Timestamp.now().isoformat(),
        "datasets": [s_disease, s_deter]
    }
    
    out_file = ROOT / "ml/artifacts/data_split_summary.json"
    with open(out_file, "w") as f:
        json.dump(payload, f, indent=2)
        
    print(f"\n✅ Data Splitting execution complete! Summary saved to: {out_file}")

if __name__ == "__main__":
    main()
