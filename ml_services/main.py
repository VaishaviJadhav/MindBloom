from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os

# ===============================
# Flask App Setup
# ===============================
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=False)

# ===============================
# Load Model & Assets (ONCE)
# ===============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

try:
    model = joblib.load(os.path.join(BASE_DIR, "dyslexia_screening_model.pkl"))
    features = joblib.load(os.path.join(BASE_DIR, "dyslexia_features.pkl"))
    threshold = joblib.load(os.path.join(BASE_DIR, "dyslexia_threshold.pkl"))
    scaler    = joblib.load('dyslexia_scaler.pkl')
    print("✅ Dyslexia screening model loaded successfully")
except Exception as e:
    print(f"❌ Failed to load model assets: {e}")
    model = None
    features = None
    threshold = None


# ===============================
# Intercept ALL preflight requests
# ===============================
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = app.make_default_options_response()
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        return response


# ===============================
# Inject CORS into every response
# ===============================
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


# ===============================
# Health Check Route
# ===============================
@app.route("/", methods=["GET"])
def health_check():
    return jsonify({
        "status": "OK",
        "message": "Dyslexia Screening API is running",
        "model_loaded": model is not None
    })


# ===============================
# Prediction Route
# ===============================
@app.route("/predict", methods=["POST", "OPTIONS"])
def predict():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    if model is None or scaler is None or features is None or threshold is None:
        return jsonify({
            "error": "Model not loaded. Check server logs for missing .pkl files."
        }), 500

    try:
        data = request.json

        if not data:
            return jsonify({"error": "No input data provided"}), 400

        # Auto-calculate Accuracy/Missrate from raw counts if not sent by frontend
        def safe_ratio(num, den):
            return num / den if den > 0 else 0.0

        for i in range(1, 4):
            clicks = data.get(f'Clicks{i}', 0)
            hits   = data.get(f'Hits{i}', 0)
            misses = data.get(f'Misses{i}', 0)
            if f'Accuracy{i}' not in data:
                data[f'Accuracy{i}'] = safe_ratio(hits, clicks)
            if f'Missrate{i}' not in data:
                data[f'Missrate{i}'] = safe_ratio(misses, clicks)

        # Convert input to DataFrame
        input_df = pd.DataFrame([data])

        # Ensure correct feature order & fill missing
        input_df = input_df.reindex(columns=features, fill_value=0).astype(float)

        # ✅ Scale input (required by new model)
        input_scaled = scaler.transform(input_df)

        # Debug prints
        print("🔍 FEATURES ORDER:", list(features))
        print("🔍 INPUT VECTOR:", input_df.iloc[0].tolist())
        print("🔍 INPUT DATA KEYS:", list(data.keys()))
        print("🔍 SCALED VECTOR:", input_scaled[0].tolist())
        print("🔍 PREDICT PROBA:", model.predict_proba(input_scaled)[0])

        # Predict probability
        probability = model.predict_proba(input_scaled)[0, 1]

        # Risk interpretation
        if probability >= threshold:
            risk_level = "High Risk (Screening Recommended)"
        elif probability >= threshold * 0.7:
            risk_level = "Moderate Risk"
        else:
            risk_level = "Low Risk"

        return jsonify({
            "dyslexia_risk_percentage": round(float(probability) * 100, 1),
            "risk_level": risk_level,
            "confidence": round(max(probability, 1 - probability) * 100, 1)
        })

    except Exception as e:
        print(f"❌ Prediction error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/routes", methods=["GET"])
def list_routes():
    return jsonify([str(rule) for rule in app.url_map.iter_rules()])
# ===============================
# Run Server
# ===============================
if __name__ == "__main__":
    app.run(debug=False, use_reloader=False, port=5000)