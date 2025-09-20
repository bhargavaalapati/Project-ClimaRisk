import xarray as xr
import json

print("Processing GRIB file...")

try:
    # --- Step 1: Open the main variables (temp and wind) ---
    ds_main = xr.open_dataset("multi_variable_test.grib", engine="cfgrib")

    # --- Step 2: Open the precipitation variable separately ---
    # We use backend_kwargs to filter specifically for the 'tp' variable
    ds_precip = xr.open_dataset(
        "multi_variable_test.grib",
        engine="cfgrib",
        backend_kwargs={"filter_by_keys": {"shortName": "tp"}},
    )

    # --- Step 3: Perform calculations on each dataset ---

    # 1. Calculate Daily Max Temperature (and convert from Kelvin to Celsius)
    max_temp_k_grid = ds_main["t2m"].resample(time="1D").max(dim="time")
    daily_abs_max_temp_c = (max_temp_k_grid.max(dim=["latitude", "longitude"])) - 273.15

    # 2. Calculate Daily Max Wind Speed
    wind_speed_grid = (ds_main["u10"] ** 2 + ds_main["v10"] ** 2) ** 0.5
    max_wind_speed_grid = wind_speed_grid.resample(time="1D").max(dim="time")
    daily_abs_max_wind = max_wind_speed_grid.max(dim=["latitude", "longitude"])

    # 3. Calculate Daily Total Precipitation from the second dataset
    total_precip_grid = (
        ds_precip["tp"]
        .resample(time="1D")
        .max(dim="time")
        .diff(dim="time", label="lower")
        .fillna(0)
    )
    daily_total_precip = total_precip_grid.sum(dim=["latitude", "longitude"])

    # --- Step 4: Prepare data for JSON export ---
    processed_data = {
        "location": "Visakhapatnam Area",
        "daily_summary": {
            "timestamps": [str(t.values) for t in daily_abs_max_temp_c.time],
            "max_temp_celsius": daily_abs_max_temp_c.values.tolist(),
            "max_wind_speed_ms": daily_abs_max_wind.values.tolist(),
            "total_precip_mm": (
                daily_total_precip.values * 1000
            ).tolist(),  # Convert m to mm
        },
    }

    # Save to a JSON file
    with open("processed_data.json", "w") as f:
        json.dump(processed_data, f, indent=4)

    print("✅ Success! Data processed and saved to 'processed_data.json'")

except Exception as e:
    print(f"❌ An error occurred: {e}")
