import xarray as xr
import numpy as np
import json

print("--- Generating data for distribution graph ---")
try:
    # We'll use just one year of data to generate a sample distribution
    ds = xr.open_dataset("historical_data_main/main-vars_1994.grib", engine="cfgrib")

    # Get all the temperature data points for the first week of June
    june_temps_k = ds["t2m"].sel(time=slice("1994-06-01", "1994-06-07"))
    june_temps_c = june_temps_k.values.flatten() - 273.15

    # Use numpy to create a histogram
    counts, bins = np.histogram(june_temps_c, bins=10)

    # Format the data for our charting library
    graph_data = [
        {
            # FIXED: Explicitly convert the numpy float to a standard Python float
            "temp": float(round(bins[i], 1)),
            "probability": int(counts[i]),
        }
        for i in range(len(counts))
    ]

    # Save to a JSON file
    with open("graph_data.json", "w") as f:
        json.dump(graph_data, f, indent=4)

    print("✅ Successfully created 'graph_data.json'")

except Exception as e:
    print(f"❌ An error occurred: {e}")
