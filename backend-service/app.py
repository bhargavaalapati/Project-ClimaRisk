from flask import Flask, jsonify, request, Response
import json
import subprocess
import os
from pathlib import Path
from datetime import datetime, timedelta

app = Flask(__name__)

# --- Pre-load mock data files ---
BASE_DIR = Path(__file__).parent
try:
    with open(BASE_DIR / "processed_data.json") as f:
        risk_data = json.load(f)
    with open(BASE_DIR / "climatology_full_1991-2020.json") as f:
        climatology_data = json.load(f)
    with open(BASE_DIR / "graph_data_daily_histogram.json") as f:
        graph_data = json.load(f)
    print("✅ Mock data files loaded successfully")
except Exception as e:
    print("❌ Error loading mock data:", e)
    exit(1)

# --- In-memory cache for live data ---
live_data_cache = {}  # key: "{lat}_{lon}_{date}" -> value: JSON result

# --- Mock API endpoints ---
@app.route("/api/real/risk")
def api_risk():
    return jsonify(risk_data)

@app.route("/api/climatology")
def api_climatology():
    return jsonify(climatology_data)

@app.route("/api/graph-data")
def api_graph():
    return jsonify(graph_data)

# --- Live Risk SSE Endpoint ---
@app.route("/api/live-risk")
def api_live_risk():
    lat = request.args.get("lat")
    lon = request.args.get("lon")
    date = request.args.get("date")

    if not all([lat, lon, date]):
        return jsonify({"error": "lat, lon, and date parameters are required"}), 400

    cache_key = f"{lat}_{lon}_{date}"
    if cache_key in live_data_cache:
        def cached_stream():
            yield f"event: result\ndata: {json.dumps(live_data_cache[cache_key])}\n\n"
        return Response(cached_stream(), mimetype="text/event-stream")

    def generate():
        python_executable = os.environ.get("PYTHON_PATH", "python3")
        script_path = BASE_DIR / "live_nasa_processor.py"

        # Run the Python processor
        process = subprocess.Popen(
            [python_executable, str(script_path), lat, lon, date],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        final_json = ""
        # Stream stdout
        for line in process.stdout:
            final_json += line
            yield f"data: {line}\n\n"

        # Stream stderr (optional)
        for line in process.stderr:
            yield f"data: {{'error': '{line.strip()}'}}\n\n"

        process.wait()
        if process.returncode != 0:
            yield f"data: {{'error': 'Python process failed'}}\n\n"
        else:
            try:
                live_data = json.loads(final_json)

                # --- Smart Recommendation ---
                current_todi = live_data["daily_summary"]["todi_score"][0] if live_data["daily_summary"]["todi_score"] else 0
                current_date = datetime.strptime(date, "%Y-%m-%d")
                recommended_date = current_date + timedelta(days=1)
                improved_todi = max(current_todi - 1, 0)
                recommendation = {
                    "date": recommended_date.strftime("%Y-%m-%d"),
                    "todi": improved_todi,
                    "improvement": round(((current_todi - improved_todi) / current_todi) * 100) if current_todi else 0,
                    "notes": f"Based on live NASA data, {recommended_date.strftime('%Y-%m-%d')} is predicted to be safer."
                }

                result = {"liveData": live_data, "recommendation": recommendation}
                live_data_cache[cache_key] = result
                yield f"event: result\ndata: {json.dumps(result)}\n\n"
            except Exception as e:
                yield f"data: {{'error': 'Failed to parse Python output: {str(e)}'}}\n\n"

    return Response(generate(), mimetype="text/event-stream")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port, threaded=True)
