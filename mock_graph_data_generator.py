import numpy as np
import json

print("--- Generating full-year mock GRAPH data ---")

# Define a base temperature for each month to simulate seasons
monthly_base_temps = {
    1: 18,
    2: 20,
    3: 25,
    4: 30,
    5: 35,
    6: 38,
    7: 36,
    8: 34,
    9: 32,
    10: 28,
    11: 24,
    12: 20,
}

full_graph_data = {}

for month, base_temp in monthly_base_temps.items():
    # Create a realistic-looking spread of temperatures around the month's base temp
    # np.random.normal creates a normal distribution (a bell curve)
    # We generate 500 data points to simulate historical observations
    temps = np.random.normal(loc=base_temp, scale=4, size=500)

    # Use numpy to create a histogram from this data
    counts, bins = np.histogram(temps, bins=10)

    # Format the data for our charting library
    graph_data = [
        {"temp": float(round(bins[i], 1)), "observations": int(counts[i])}
        for i in range(len(counts))
    ]
    full_graph_data[str(month)] = graph_data

with open("graph_data_full_year.json", "w") as f:
    json.dump(full_graph_data, f, indent=4)

print("✅ Successfully created 'graph_data_full_year.json'")
