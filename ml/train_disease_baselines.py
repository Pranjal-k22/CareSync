import time
import json
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier, GradientBoostingClassifier
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, roc_auc_score

ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = ROOT / "ml/data/cleaned_disease_dataset.csv"
ARTIFACTS_DIR = ROOT / "ml/artifacts"
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

sns.set_theme(style="whitegrid", palette="muted")
plt.rcParams['font.sans-serif'] = 'Helvetica'

def main():
    print("==================================================")
    print("PHASE 9 — MULTI-MODEL BASELINE EVALUATION (DISEASE)")
    print("==================================================")

    df = pd.read_csv(DATA_PATH)
    target_col = "disease_label"
    exclude_cols = ["patient_id", "disease_condition", "disease_label"]
    feature_cols = [c for c in df.columns if c not in exclude_cols]

    num_cols = ["temperature_c", "heart_rate", "spo2_pct", "cough_severity", "headache_severity", "fatigue_score", "chills", "body_ache", "sore_throat", "age"]
    cat_cols = ["gender"]

    X = df[feature_cols]
    y = df[target_col]

    # 70% Train, 15% Val, 15% Test
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.30, random_state=42, stratify=y
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp
    )

    # Preprocessor
    preprocessor = ColumnTransformer(transformers=[
        ("num", Pipeline(steps=[("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())]), num_cols),
        ("cat", Pipeline(steps=[("imputer", SimpleImputer(strategy="most_frequent")), ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))]), cat_cols)
    ])

    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42, class_weight="balanced"),
        "Decision Tree": DecisionTreeClassifier(max_depth=10, random_state=42, class_weight="balanced"),
        "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42, class_weight="balanced", n_jobs=-1),
        "HistGradientBoosting": HistGradientBoostingClassifier(max_iter=100, random_state=42),
        "Linear SVM (Calibrated)": CalibratedClassifierCV(LinearSVC(max_iter=2000, random_state=42, dual=False)),
        "Gradient Boosting": GradientBoostingClassifier(n_estimators=100, random_state=42)
    }

    results = {}
    
    print(f"{'Model Name':26s} | {'Val Acc':8s} | {'Test Acc':8s} | {'Test F1':8s} | {'Test ROC':8s} | {'Time (s)':8s}")
    print("-" * 75)

    for name, clf in models.items():
        pipe = Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("classifier", clf)
        ])

        t0 = time.time()
        pipe.fit(X_train, y_train)
        fit_time = round(time.time() - t0, 3)

        # Val metrics
        y_val_pred = pipe.predict(X_val)
        val_acc = accuracy_score(y_val, y_val_pred)

        # Test metrics
        y_test_pred = pipe.predict(X_test)
        y_test_probs = pipe.predict_proba(X_test)

        test_acc = accuracy_score(y_test, y_test_pred)
        prec, rec, f1, _ = precision_recall_fscore_support(y_test, y_test_pred, average="weighted")
        test_roc = roc_auc_score(y_test, y_test_probs, multi_class="ovr", average="weighted")

        results[name] = {
            "fit_time_sec": fit_time,
            "val_accuracy": round(float(val_acc), 4),
            "test_accuracy": round(float(test_acc), 4),
            "test_precision": round(float(prec), 4),
            "test_recall": round(float(rec), 4),
            "test_f1_score": round(float(f1), 4),
            "test_roc_auc": round(float(test_roc), 4)
        }

        print(f"{name:26s} | {val_acc*100:7.2f}% | {test_acc*100:7.2f}% | {f1*100:7.2f}% | {test_roc*100:7.2f}% | {fit_time:7.3f}s")

    # Save benchmark metrics JSON
    metrics_out = ARTIFACTS_DIR / "disease_baseline_models_metrics.json"
    with open(metrics_out, "w") as f:
        json.dump(results, f, indent=2)

    # Plot Model Comparison Bar Chart
    model_names = list(results.keys())
    f1_scores = [results[m]["test_f1_score"] * 100 for m in model_names]
    roc_scores = [results[m]["test_roc_auc"] * 100 for m in model_names]

    x = np.arange(len(model_names))
    width = 0.35

    fig, ax = plt.subplots(figsize=(10, 5))
    rects1 = ax.bar(x - width/2, f1_scores, width, label='Test Weighted F1 (%)', color='#3b82f6', edgecolor='#1e293b')
    rects2 = ax.bar(x + width/2, roc_scores, width, label='Test ROC-AUC (%)', color='#10b981', edgecolor='#1e293b')

    ax.set_title("Multi-Model Baseline Performance Benchmark (Disease Diagnosis)", fontsize=13, fontweight='bold', pad=12)
    ax.set_ylabel("Performance Score (%)", fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(model_names, rotation=15, ha="right", fontweight='bold')
    ax.set_ylim(80, 102)
    ax.legend(frameon=True, facecolor='#f8fafc', edgecolor='#cbd5e1')

    for bar in rects1:
        h = bar.get_height()
        ax.annotate(f'{h:.1f}%', xy=(bar.get_x() + bar.get_width() / 2, h), xytext=(0, 3), textcoords="offset points", ha='center', fontsize=9, fontweight='bold')

    for bar in rects2:
        h = bar.get_height()
        ax.annotate(f'{h:.1f}%', xy=(bar.get_x() + bar.get_width() / 2, h), xytext=(0, 3), textcoords="offset points", ha='center', fontsize=9, fontweight='bold')

    plt.tight_layout()
    chart_out = ARTIFACTS_DIR / "disease_model_comparison_chart.png"
    plt.savefig(chart_out, dpi=300)
    plt.close()

    print(f"\n✅ Multi-Model Baseline Benchmark complete!")
    print(f"Metrics saved to: {metrics_out}")
    print(f"Chart saved to:   {chart_out}")

if __name__ == "__main__":
    main()
