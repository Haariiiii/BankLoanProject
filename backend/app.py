"""
app.py — Flask REST API for Bank Marketing Prediction
"""
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from model_service import get_service
import database as db

app = Flask(__name__)
# Allow all origins in production (Vercel URL will vary per deploy)
CORS(app)

# ── Load model once at startup ─────────────────────────────────────────────────
svc = get_service()
svc.load()


# ── Validation helpers ─────────────────────────────────────────────────────────
VALID_JOB = [
    "admin.", "blue-collar", "entrepreneur", "housemaid", "management",
    "retired", "self-employed", "services", "student", "technician",
    "unemployed", "unknown"
]
VALID_MARITAL   = ["married", "single", "divorced"]
VALID_EDUCATION = ["primary", "secondary", "tertiary", "unknown"]
VALID_BINARY    = ["yes", "no"]
VALID_CONTACT   = ["cellular", "telephone", "unknown"]
VALID_MONTH     = ["jan", "feb", "mar", "apr", "may", "jun",
                   "jul", "aug", "sep", "oct", "nov", "dec"]
VALID_POUTCOME  = ["success", "failure", "other", "unknown"]

REQUIRED_FIELDS = {
    "age":       {"type": int,   "min": 18,    "max": 100},
    "job":       {"type": str,   "choices": VALID_JOB},
    "marital":   {"type": str,   "choices": VALID_MARITAL},
    "education": {"type": str,   "choices": VALID_EDUCATION},
    "default":   {"type": str,   "choices": VALID_BINARY},
    "balance":   {"type": float, "min": -20000, "max": 200000},
    "housing":   {"type": str,   "choices": VALID_BINARY},
    "loan":      {"type": str,   "choices": VALID_BINARY},
    "contact":   {"type": str,   "choices": VALID_CONTACT},
    "day":       {"type": int,   "min": 1,     "max": 31},
    "month":     {"type": str,   "choices": VALID_MONTH},
    "duration":  {"type": int,   "min": 0,     "max": 5000},
    "campaign":  {"type": int,   "min": 1,     "max": 100},
    "pdays":     {"type": int,   "min": -1,    "max": 1000},
    "previous":  {"type": int,   "min": 0,     "max": 300},
    "poutcome":  {"type": str,   "choices": VALID_POUTCOME},
}


def validate_input(data: dict):
    errors = []
    cleaned = {}

    for field, rules in REQUIRED_FIELDS.items():
        if field not in data or data[field] is None or data[field] == "":
            errors.append(f"'{field}' is required.")
            continue

        val = data[field]

        # Type coercion
        try:
            if rules["type"] in (int, float):
                val = rules["type"](val)
            else:
                val = str(val).strip().lower()
        except (ValueError, TypeError):
            errors.append(f"'{field}' must be of type {rules['type'].__name__}.")
            continue

        # Range check
        if "min" in rules and val < rules["min"]:
            errors.append(f"'{field}' must be >= {rules['min']}.")
        elif "max" in rules and val > rules["max"]:
            errors.append(f"'{field}' must be <= {rules['max']}.")

        # Choices check
        if "choices" in rules and val not in rules["choices"]:
            errors.append(f"'{field}' must be one of {rules['choices']}.")

        cleaned[field] = val

    return cleaned, errors


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "model_loaded": svc._loaded}), 200


@app.get("/api/model-info")
def model_info():
    return jsonify(svc.get_info()), 200


@app.post("/api/predict")
def predict():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    cleaned, errors = validate_input(data)

    if errors:
        return jsonify({"errors": errors}), 422

    try:
        result = svc.predict(cleaned)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # Save to history
    try:
        db.save_prediction(
            prediction=result["prediction"],
            prob_yes=result["prob_yes"],
            prob_no=result["prob_no"],
            model_name=result["model_name"],
            input_data=cleaned,
        )
    except Exception:
        pass  # Don't fail prediction if DB write fails

    return jsonify(result), 200


@app.get("/api/analytics")
def analytics():
    meta = svc.metadata
    if not meta:
        return jsonify({"error": "Model not loaded"}), 503

    stats = meta["dataset_stats"]
    return jsonify({
        "dataset": {
            "total_rows":     stats["total_rows"],
            "total_features": stats["features"],
            "feature_names":  stats["feature_names"],
            "target_distribution": stats["target_distribution"],
        },
        "smote": {
            "before": stats["before_smote"],
            "after":  stats["after_smote"],
        },
        "feature_types": {
            "numerical": ["age", "balance", "day", "duration", "campaign", "pdays", "previous"],
            "categorical": ["job", "marital", "education", "default", "housing",
                            "loan", "contact", "month", "poutcome"],
        },
    }), 200


@app.get("/api/metrics")
def metrics():
    meta = svc.metadata
    if not meta:
        return jsonify({"error": "Model not loaded"}), 503

    return jsonify({
        "accuracy":       meta["accuracy"],
        "roc_auc":        meta["roc_auc"],
        "avg_precision":  meta["avg_precision"],
        "precision_yes":  meta["precision_yes"],
        "recall_yes":     meta["recall_yes"],
        "f1_yes":         meta["f1_yes"],
        "precision_no":   meta["precision_no"],
        "recall_no":      meta["recall_no"],
        "f1_no":          meta["f1_no"],
        "confusion_matrix": meta["confusion_matrix"],
        "roc_curve":      meta["roc_curve"],
        "pr_curve":       meta["pr_curve"],
        "model_comparison": meta["model_comparison"],
    }), 200


@app.get("/api/feature-importance")
def feature_importance():
    top_n = request.args.get("top_n", 20, type=int)
    return jsonify({"feature_importance": svc.get_feature_importance(top_n)}), 200


@app.get("/api/history")
def history():
    limit = request.args.get("limit", 200, type=int)
    rows  = db.get_history(limit)
    return jsonify({"history": rows, "count": len(rows)}), 200


@app.delete("/api/history")
def delete_history():
    db.clear_history()
    return jsonify({"message": "History cleared"}), 200


# ── Error handlers ─────────────────────────────────────────────────────────────
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"error": "Method not allowed"}), 405


@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, port=port, host="0.0.0.0")
