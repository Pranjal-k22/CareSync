"""Prepare the Hospital Deterioration dataset for HealConnect risk modelling.

The input file is kept unchanged.  This script creates a modelling dataset with
one row per patient-hour and a binary target: deterioration_next_12h.
"""

from __future__ import annotations

import csv
import json
from pathlib import Path
from statistics import median



PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE = PROJECT_ROOT / "datasets/hospital-deterioration/hospital_deterioration_hourly_panel.csv"
OUTPUT_DIR = PROJECT_ROOT / "ml/data"
OUTPUT = OUTPUT_DIR / "cleaned_hospital_deterioration.csv"
SUMMARY = OUTPUT_DIR / "cleaned_hospital_deterioration_summary.json"

FEATURE_COLUMNS = [
    "heart_rate",
    "respiratory_rate",
    "spo2_pct",
    "temperature_c",
    "systolic_bp",
    "diastolic_bp",
    "oxygen_device",
    "oxygen_flow",
    "mobility_score",
    "nurse_alert",
    "age",
    "gender",
    "comorbidity_index",
    "admission_type",
]
IDENTIFIER_COLUMNS = ["patient_id", "hour_from_admission"]
TARGET_COLUMN = "deterioration_next_12h"
NUMERIC_COLUMNS = [
    "heart_rate",
    "respiratory_rate",
    "spo2_pct",
    "temperature_c",
    "systolic_bp",
    "diastolic_bp",
    "oxygen_flow",
    "mobility_score",
    "nurse_alert",
    "age",
    "comorbidity_index",
]
CATEGORICAL_COLUMNS = ["oxygen_device", "gender", "admission_type"]


def main() -> None:
    if not SOURCE.exists():
        raise FileNotFoundError(f"Dataset not found: {SOURCE}")

    required = set(IDENTIFIER_COLUMNS + FEATURE_COLUMNS + [TARGET_COLUMN])
    with SOURCE.open(newline="", encoding="utf-8") as source_file:
        reader = csv.DictReader(source_file)
        missing = required.difference(reader.fieldnames or [])
        if missing:
            raise ValueError(f"Input dataset is missing columns: {sorted(missing)}")

        # First pass: calculate numeric medians without a third-party package.
        numeric_values = {column: [] for column in NUMERIC_COLUMNS}
        for row in reader:
            for column in NUMERIC_COLUMNS:
                try:
                    numeric_values[column].append(float(row[column]))
                except (TypeError, ValueError):
                    pass
    medians = {column: median(values) for column, values in numeric_values.items()}

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    counts = {0: 0, 1: 0}
    rows_written = 0
    seen_rows = set()
    with SOURCE.open(newline="", encoding="utf-8") as source_file, OUTPUT.open(
        "w", newline="", encoding="utf-8"
    ) as output_file:
        reader = csv.DictReader(source_file)
        output_columns = IDENTIFIER_COLUMNS + FEATURE_COLUMNS + [TARGET_COLUMN]
        writer = csv.DictWriter(output_file, fieldnames=output_columns)
        writer.writeheader()
        for row in reader:
            try:
                target = int(float(row[TARGET_COLUMN]))
            except (TypeError, ValueError):
                continue
            if target not in counts:
                continue

            cleaned = {column: (row[column] or "").strip() for column in IDENTIFIER_COLUMNS}
            for column in NUMERIC_COLUMNS:
                try:
                    cleaned[column] = float(row[column])
                except (TypeError, ValueError):
                    cleaned[column] = medians[column]
            for column in CATEGORICAL_COLUMNS:
                cleaned[column] = (row[column] or "unknown").strip() or "unknown"
            cleaned[TARGET_COLUMN] = target

            signature = tuple(str(cleaned[column]) for column in output_columns)
            if signature in seen_rows:
                continue
            seen_rows.add(signature)
            writer.writerow(cleaned)
            counts[target] += 1
            rows_written += 1

    summary = {
        "source": str(SOURCE.relative_to(PROJECT_ROOT)),
        "output": str(OUTPUT.relative_to(PROJECT_ROOT)),
        "rows": rows_written,
        "features": FEATURE_COLUMNS,
        "target": TARGET_COLUMN,
        "class_counts": {str(label): count for label, count in counts.items()},
        "class_percentages": {
            str(label): round(count / rows_written * 100, 2)
            for label, count in counts.items()
        },
    }
    SUMMARY.write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")

    print(f"Created {OUTPUT.relative_to(PROJECT_ROOT)}")
    print(f"Rows: {rows_written:,}")
    print("Class counts:")
    for label, count in sorted(counts.items()):
        print(f"  {label}: {count:,} ({count / rows_written * 100:.2f}%)")


if __name__ == "__main__":
    main()
