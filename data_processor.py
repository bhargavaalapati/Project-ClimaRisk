import xarray as xr
import json
import todi_engine

print("Processing GRIB file...")

try:
    # --- Data loading remains the same ---
    ds_main = xr.open_dataset("multi_variable_test.grib", engine="cfgrib")
    ds_precip = xr.open_dataset(
        "multi_variable_test.grib",
        engine="cfgrib",
        backend_kwargs={"filter_by_keys": {"shortName": "tp"}},
    )

    # --- Calculations remain the same ---
    daily_max_temp_c = (
        ds_main["t2m"].resample(time="1D").max().max(dim=["latitude", "longitude"])
    ) - 273.15
    wind_speed_grid = (ds_main["u10"] ** 2 + ds_main["v10"] ** 2) ** 0.5
    daily_abs_max_wind = (
        wind_speed_grid.resample(time="1D").max().max(dim=["latitude", "longitude"])
    )
    end_of_day_precip = ds_precip["tp"].resample(time="1D").max()
    daily_precip_grid = end_of_day_precip.diff(dim="time", label="upper").fillna(
        end_of_day_precip.isel(time=0)
    )
    daily_total_precip = daily_precip_grid.sum(dim=["latitude", "longitude"])

    # NEW: Correct for negative values caused by the model's reset cycle
    daily_total_precip = daily_total_precip.where(daily_total_precip >= 0, 0)

    # --- NEW: Calculate TODI Score for each day ---
    todi_scores = []
    mock_humidity = 65.0
    for i in range(len(daily_max_temp_c.time)):
        temp = daily_max_temp_c.values[i]
        wind = daily_abs_max_wind.values[i]
        score = todi_engine.calculate_todi_score(temp, mock_humidity, wind)
        todi_scores.append(score)

    # --- Prepare final JSON with TODI score ---
    processed_data = {
        "location": "Visakhapatnam Area",
        "daily_summary": {
            "timestamps": [str(t.values) for t in daily_max_temp_c.time],
            "max_temp_celsius": daily_max_temp_c.values.tolist(),
            "max_wind_speed_ms": daily_abs_max_wind.values.tolist(),
            "total_precip_mm": (daily_total_precip.values * 1000).tolist(),
            "todi_score": todi_scores,
        },
    }

    # Save to a JSON file
    with open("processed_data.json", "w") as f:
        json.dump(processed_data, f, indent=4)

    print("✅ Success! Data processed with TODI scores and saved.")

except Exception as e:
    print(f"❌ An error occurred: {e}")
