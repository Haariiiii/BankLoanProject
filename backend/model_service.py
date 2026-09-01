"""
model_service.py — Model loading & prediction pipeline
"""
import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path

MODELS_DIR = Path(__file__).parent / "models"


class ModelService:
    def __init__(self):
        self.model          = None
        self.feature_cols   = None
        self.metadata       = None
        self._loaded        = False

    def load(self):
        """Load model artifacts once at startup."""
        model_path    = MODELS_DIR / "best_model.pkl"
        feat_path     = MODELS_DIR / "feature_columns.pkl"
        metadata_path = MODELS_DIR / "model_metadata.json"

        if not model_path.exists():
            raise FileNotFoundError(
                f"Model not found at {model_path}. "
                "Run rebuild_model.py first."
            )

        self.model        = joblib.load(str(model_path))
        self.feature_cols = joblib.load(str(feat_path))

        with open(str(metadata_path), "r") as f:
            self.metadata = json.load(f)

        self._loaded = True
        print(f"[ModelService] Model loaded: {self.metadata['model_name']}")
        print(f"[ModelService] Accuracy: {self.metadata['accuracy']}")

    # ── Preprocessing (exact mirror of notebook) ───────────────────────────────
    EDUCATION_MAP = {"unknown": 0, "primary": 1, "secondary": 2, "tertiary": 3}
    CAT_COLS      = ["job", "marital", "default", "housing",
                     "loan", "contact", "month", "poutcome"]
    FEATURE_ORDER = [
        "age", "job", "marital", "education", "default", "balance",
        "housing", "loan", "contact", "day", "month", "duration",
        "campaign", "pdays", "previous", "poutcome"
    ]

    def preprocess(self, input_dict: dict) -> pd.DataFrame:
        """Transform raw user input into the 40-feature vector."""
        # Build single-row DataFrame in exact feature order
        row = {col: [input_dict[col]] for col in self.FEATURE_ORDER}
        df = pd.DataFrame(row)

        # Ordinal-encode education
        df["education"] = df["education"].map(self.EDUCATION_MAP)

        # One-hot encode categorical columns
        df_enc = pd.get_dummies(df, columns=self.CAT_COLS, drop_first=True, dtype=int)

        # Align to training columns (add missing, drop extra)
        df_enc = df_enc.reindex(columns=self.feature_cols, fill_value=0)

        return df_enc

    def predict(self, input_dict: dict) -> dict:
        """Run preprocessing and return prediction + probabilities."""
        if not self._loaded:
            raise RuntimeError("Model not loaded. Call load() first.")

        df_enc   = self.preprocess(input_dict)
        pred_raw = self.model.predict(df_enc)[0]          # 'no' or 'yes'
        proba    = self.model.predict_proba(df_enc)[0]    # [p_no, p_yes]

        # model.classes_ = ['no', 'yes']
        classes  = list(self.model.classes_)
        idx_yes  = classes.index("yes")
        idx_no   = classes.index("no")

        prob_yes = float(proba[idx_yes])
        prob_no  = float(proba[idx_no])
        confidence = max(prob_yes, prob_no)

        return {
            "prediction":  pred_raw,
            "prob_yes":    round(prob_yes, 4),
            "prob_no":     round(prob_no, 4),
            "confidence":  round(confidence, 4),
            "model_name":  self.metadata["model_name"],
            "interpretation": self._interpret(pred_raw, prob_yes),
        }

    @staticmethod
    def _interpret(pred: str, prob_yes: float) -> str:
        if pred == "yes":
            if prob_yes >= 0.75:
                return "High likelihood of subscribing to a term deposit."
            elif prob_yes >= 0.55:
                return "Moderate likelihood of subscribing. Worth pursuing."
            else:
                return "Slight lean towards subscribing, but uncertain."
        else:
            if prob_yes <= 0.25:
                return "Very low likelihood of subscribing to a term deposit."
            elif prob_yes <= 0.45:
                return "Unlikely to subscribe. Consider other products."
            else:
                return "Leans towards not subscribing, but borderline."

    def get_feature_importance(self, top_n: int = 20) -> list:
        if not self._loaded:
            return []
        return self.metadata["feature_importances"][:top_n]

    def get_info(self) -> dict:
        if not self._loaded:
            return {}
        m = self.metadata
        return {
            "model_name":     m["model_name"],
            "model_type":     m["model_type"],
            "accuracy":       m["accuracy"],
            "roc_auc":        m["roc_auc"],
            "precision_yes":  m["precision_yes"],
            "recall_yes":     m["recall_yes"],
            "f1_yes":         m["f1_yes"],
            "precision_no":   m["precision_no"],
            "recall_no":      m["recall_no"],
            "f1_no":          m["f1_no"],
            "n_estimators":   m["n_estimators"],
            "feature_count":  len(m["feature_columns"]),
            "classes":        m["classes"],
            "dataset_stats":  m["dataset_stats"],
        }


# Singleton
_service = ModelService()


def get_service() -> ModelService:
    return _service
