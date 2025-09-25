import numpy as np
import json

print("--- Generating final mock DAILY HISTOGRAM data ---")

full_graph_data = {}

# We'll loop through every day of the year
for day in range(1, 367):
    seasonal_factor = -np.cos((day / 366.0) * 2 * np.pi)
    base_temp = 28 + (seasonal_factor * 10)  # Base temp follows the seasons

    # Create a realistic-looking spread of 30 historical temperatures for this specific day
    temps = np.random.normal(loc=base_temp, scale=3, size=30)

    # Use numpy to create a histogram from this data
    counts, bins = np.histogram(temps, bins=8)  # Group into 8 bins

    # Format the data for our charting library
    histogram_data = {
        "dayOfYear": day,
        "temps": [
            {"temp": float(round(bins[i], 1)), "count": int(counts[i])}
            for i in range(len(counts))
        ],
    }
    full_graph_data[str(day)] = histogram_data

with open("graph_data_daily_histogram.json", "w") as f:
    json.dump(full_graph_data, f, indent=4)

print("✅ Successfully created 'graph_data_daily_histogram.json'")
