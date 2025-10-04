from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import json
import os
import datetime
from threading import Lock
import time

# --- Initialize Flask app ---
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# --- Thread-safe in-memory cache for live data ---
live_data_cache = {}
cache_lock = Lock()

# --- Pre-load mock data files ---
risk_data = {}
climatology_data = {}
graph_data = {}

try:
    with open("processed_data.json", "r") as f:
        risk_data = json.load(f)
    with open("climatology_full_1991-2020.json", "r") as f:
        climatology_data = json.load(f)
    with open("graph_data_daily_histogram.json", "r") as f:
        graph_data = json.load(f)
    print("✅ Mock data files loaded successfully")
except Exception as e:
    print("❌ Error loading mock data files:", e)


# --- API Endpoints for mock data ---
@app.route("/api/real/risk")
def api_risk():
    return jsonify(risk_data)


@app.route("/api/climatology")
def api_climatology():
    return jsonify(climatology_data)


@app.route("/api/graph-data")
def api_graph():
    return jsonify(graph_data)


# --- Live NASA data endpoint using SSE ---
@app.route("/api/live-risk")
def api_live_risk():
    lat = request.args.get("lat")
    lon = request.args.get("lon")
    date = request.args.get("date")

    if not lat or not lon or not date:
        return jsonify({"error": "Parameters lat, lon, and date are required"}), 400

    cache_key = f"{lat}_{lon}_{date}"
    with cache_lock:
        if cache_key in live_data_cache:
            cached_result = live_data_cache[cache_key]
            return Response(
                f"event: result\ndata: {json.dumps(cached_result)}\n\n",
                mimetype="text/event-stream",
            )

    def generate_live_data():
        try:
            # Here you would normally spawn your Python process
            # For demonstration, we simulate processing time
            for i in range(1, 6):
                yield f"data: Processing step {i}/5...\n\n"
                time.sleep(0.5)

            # Fake live data result
            live_result = {
                "daily_summary": {
                    "todi_score": [42],
                    "max_temp_celsius": [30],
                    "max_wind_speed_ms": [5],
                },
                "recommendation": {
                    "date": date,
                    "todi": 42,
                    "improvement": 0,
                    "notes": f"Simulated live analysis for {lat}, {lon} on {date}",
                },
            }

            with cache_lock:
                live_data_cache[cache_key] = live_result

            yield f"event: result\ndata: {json.dumps(live_result)}\n\n"

        except Exception as e:
            yield f"data: {{'error': 'Live data processing failed: {str(e)}'}}\n\n"

    return Response(generate_live_data(), mimetype="text/event-stream")


# --- Start Flask app ---
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    print(f"✅ Your service is live on port {port}")
    app.run(host="0.0.0.0", port=port)
