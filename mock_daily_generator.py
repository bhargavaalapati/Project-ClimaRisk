import numpy as np
import json
import pandas as pd
import todi_engine  # Import your actual TODI engine!

print("--- Generating mock full-year DAILY SUMMARY data ---")

# Generate a date range for the entire year 2023
dates = pd.date_range(start="2023-01-01", end="2023-12-31", freq="D")

daily_summary = {
    "timestamps": [],
    "max_temp_celsius": [],
    "max_wind_speed_ms": [],
    "total_precip_mm": [],
    "todi_score": [],
}

for date in dates:
    day_of_year = date.dayofyear
    seasonal_factor = -np.cos((day_of_year / 365.0) * 2 * np.pi)

    # Generate realistic-looking daily data
    temp = 28 + (seasonal_factor * 10) + np.random.uniform(-3, 3)
    wind = np.random.uniform(2, 10)
    # Most days have no rain
    precip = max(0, np.random.choice([0, 0, 0, 0, np.random.uniform(1, 20)]))
    # Use a mock humidity that varies slightly with season
    humidity = 60 - (seasonal_factor * 20) + np.random.uniform(-5, 5)

    # Calculate a real TODI score using your engine!
    todi = todi_engine.calculate_todi_score(temp, humidity, wind)

    daily_summary["timestamps"].append(date.isoformat())
    daily_summary["max_temp_celsius"].append(temp)
    daily_summary["max_wind_speed_ms"].append(wind)
    daily_summary["total_precip_mm"].append(precip)
    daily_summary["todi_score"].append(todi)

processed_data = {"location": "Global Test Location", "daily_summary": daily_summary}

with open("processed_data.json", "w") as f:
    json.dump(processed_data, f, indent=4)

print("✅ Successfully created 'processed_data.json' with a full year of data.")
