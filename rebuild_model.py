"""
rebuild_model.py
-----------------
Rebuilds the exact Random Forest pipeline from the notebook using the same
hyperparameters, preprocessing steps, and random seeds.
Run with Anaconda Python: python rebuild_model.py
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix,
    roc_auc_score, roc_curve, precision_recall_curve, average_precision_score
)
from imblearn.over_sampling import SMOTE

# ── Config ─────────────────────────────────────────────────────────────────────
import os as _os
DATA_PATH    = _os.path.join(_os.path.expanduser("~"), "OneDrive", "Desktop", "Bank", "bank-full.csv")
OUTPUT_DIR   = _os.path.join(_os.path.expanduser("~"), "OneDrive", "Desktop", "Bank", "backend", "models")

# ── 1. Load data ────────────────────────────────────────────────────────────────
print("Loading dataset...")
df = pd.read_csv(DATA_PATH, sep=";")
print(f"Dataset shape: {df.shape}")
print(f"Target distribution:\n{df['y'].value_counts()}")

# ── 2. Feature / target split ───────────────────────────────────────────────────
X = df.drop(columns="y")
y = df["y"]

# ── 3. Train / test split (exact as notebook) ───────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42
)
print(f"\nTrain size: {X_train.shape}, Test size: {X_test.shape}")

# ── 4. Preprocessing (exact as notebook) ────────────────────────────────────────
cat_cols = ["job", "marital", "default", "housing",
            "loan", "contact", "month", "poutcome"]

education_mapping = {
    "unknown":   0,
    "primary":   1,
    "secondary": 2,
    "tertiary":  3,
}

X_train = X_train.copy()
X_test  = X_test.copy()

X_train["education"] = X_train["education"].map(education_mapping)
X_test["education"]  = X_test["education"].map(education_mapping)

X_train_enc = pd.get_dummies(X_train, columns=cat_cols, drop_first=True, dtype=int)
X_test_enc  = pd.get_dummies(X_test,  columns=cat_cols, drop_first=True, dtype=int)

# Align test columns to training columns
X_test_enc = X_test_enc.reindex(columns=X_train_enc.columns, fill_value=0)

feature_columns = list(X_train_enc.columns)
print(f"\nFeature count after encoding: {len(feature_columns)}")
print(f"Features: {feature_columns}")

# ── 5. SMOTE (training data only) ───────────────────────────────────────────────
print("\nApplying SMOTE to training data...")
smote = SMOTE(random_state=42)
X_train_smote, y_train_smote = smote.fit_resample(X_train_enc, y_train)
print(f"After SMOTE - Train shape: {X_train_smote.shape}")
print(f"After SMOTE - Class distribution:\n{y_train_smote.value_counts()}")

# ── 6. Train Random Forest ───────────────────────────────────────────────────────
print("\nTraining Random Forest (n_estimators=200)...")
rf = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)
rf.fit(X_train_smote, y_train_smote)
print("Training complete!")

# ── 7. Evaluate ─────────────────────────────────────────────────────────────────
y_pred = rf.predict(X_test_enc)
y_prob = rf.predict_proba(X_test_enc)[:, 1]

accuracy  = accuracy_score(y_test, y_pred)
report    = classification_report(y_test, y_pred, output_dict=True)
cm        = confusion_matrix(y_test, y_pred).tolist()

# Numeric labels for ROC/PR curves
y_test_num = y_test.map({"no": 0, "yes": 1})
roc_auc    = roc_auc_score(y_test_num, y_prob)
avg_prec   = average_precision_score(y_test_num, y_prob)

fpr, tpr, _     = roc_curve(y_test_num, y_prob)
prec, rec, _    = precision_recall_curve(y_test_num, y_prob)

print(f"\nAccuracy: {accuracy:.4f}")
print(f"ROC-AUC:  {roc_auc:.4f}")
print(f"\nClassification Report:\n{classification_report(y_test, y_pred)}")
print(f"\nConfusion Matrix:\n{confusion_matrix(y_test, y_pred)}")

# Feature importances
feat_imp = list(zip(feature_columns, rf.feature_importances_.tolist()))
feat_imp_sorted = sorted(feat_imp, key=lambda x: x[1], reverse=True)

# ── 8. Model comparison table (from notebook) ───────────────────────────────────
model_comparison = [
    {"model": "Decision Tree",     "accuracy": 86.00, "yes_precision": 44, "yes_recall": 70, "yes_f1": 54, "best": False},
    {"model": "Random Forest",     "accuracy": 90.00, "yes_precision": 57, "yes_recall": 59, "yes_f1": 58, "best": True},
    {"model": "Logistic Regression","accuracy": 87.98, "yes_precision": 49, "yes_recall": 42, "yes_f1": 45, "best": False},
    {"model": "KNN",               "accuracy": 88.00, "yes_precision": 51, "yes_recall": 67, "yes_f1": 58, "best": False},
    {"model": "Gradient Boosting", "accuracy": 89.09, "yes_precision": 54, "yes_recall": 48, "yes_f1": 51, "best": False},
    {"model": "SVC",               "accuracy": 89.13, "yes_precision": 52, "yes_recall": 68, "yes_f1": 59, "best": False},
    {"model": "XGBoost",           "accuracy": 89.13, "yes_precision": 52, "yes_recall": 68, "yes_f1": 59, "best": False},
]

# ── 9. Dataset statistics ────────────────────────────────────────────────────────
class_dist = df["y"].value_counts().to_dict()
before_smote = {"no": int(y_train.value_counts()["no"]), "yes": int(y_train.value_counts()["yes"])}
after_smote  = {"no": int(y_train_smote.value_counts()["no"]), "yes": int(y_train_smote.value_counts()["yes"])}

dataset_stats = {
    "total_rows": int(df.shape[0]),
    "total_cols": int(df.shape[1]),
    "features": 16,
    "target_distribution": {k: int(v) for k, v in class_dist.items()},
    "before_smote": before_smote,
    "after_smote":  after_smote,
    "feature_names": list(X.columns),
}

# ── 10. Save everything ──────────────────────────────────────────────────────────
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Model
joblib.dump(rf, os.path.join(OUTPUT_DIR, "best_model.pkl"))
print(f"\nModel saved to {OUTPUT_DIR}/best_model.pkl")

# Feature columns (needed for live prediction preprocessing)
joblib.dump(feature_columns, os.path.join(OUTPUT_DIR, "feature_columns.pkl"))
print(f"Feature columns saved.")

# Metadata JSON (used by Flask API)
metadata = {
    "model_name": "Random Forest Classifier",
    "model_type": "RandomForestClassifier",
    "sklearn_version": "1.7.2",
    "n_estimators": 200,
    "random_state": 42,
    "accuracy": round(float(accuracy), 4),
    "roc_auc": round(float(roc_auc), 4),
    "avg_precision": round(float(avg_prec), 4),
    "precision_no":  round(float(report["no"]["precision"]), 4),
    "recall_no":     round(float(report["no"]["recall"]), 4),
    "f1_no":         round(float(report["no"]["f1-score"]), 4),
    "precision_yes": round(float(report["yes"]["precision"]), 4),
    "recall_yes":    round(float(report["yes"]["recall"]), 4),
    "f1_yes":        round(float(report["yes"]["f1-score"]), 4),
    "confusion_matrix": cm,
    "feature_columns": feature_columns,
    "feature_importances": [
        {"feature": f, "importance": round(imp, 6)}
        for f, imp in feat_imp_sorted
    ],
    "roc_curve": {
        "fpr": [round(float(x), 4) for x in fpr[::10]],
        "tpr": [round(float(x), 4) for x in tpr[::10]],
    },
    "pr_curve": {
        "precision": [round(float(x), 4) for x in prec[::10]],
        "recall":    [round(float(x), 4) for x in rec[::10]],
    },
    "model_comparison": model_comparison,
    "dataset_stats": dataset_stats,
    "classes": list(rf.classes_),
    "education_mapping": education_mapping,
    "categorical_cols": cat_cols,
}

with open(os.path.join(OUTPUT_DIR, "model_metadata.json"), "w") as f:
    json.dump(metadata, f, indent=2)
print(f"Metadata JSON saved.")

print("\n✅ All artifacts saved successfully!")
print(f"   Accuracy: {accuracy:.4f}")
print(f"   ROC-AUC:  {roc_auc:.4f}")
