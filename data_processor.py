import xarray as xr
import json

print("Processing GRIB file...")

try:
    # --- Step 1: Open datasets as before ---
    ds_main = xr.open_dataset("multi_variable_test.grib", engine="cfgrib")
    ds_precip = xr.open_dataset(
        "multi_variable_test.grib",
        engine="cfgrib",
        backend_kwargs={"filter_by_keys": {"shortName": "tp"}},
    )

    # --- Step 2: Perform calculations ---

    # Temperature and Wind (no changes here)
    max_temp_k_grid = ds_main["t2m"].resample(time="1D").max(dim="time")
    daily_abs_max_temp_c = (max_temp_k_grid.max(dim=["latitude", "longitude"])) - 273.15

    wind_speed_grid = (ds_main["u10"] ** 2 + ds_main["v10"] ** 2) ** 0.5
    max_wind_speed_grid = wind_speed_grid.resample(time="1D").max(dim="time")
    daily_abs_max_wind = max_wind_speed_grid.max(dim=["latitude", "longitude"])

    # UPDATED Precipitation Calculation
    end_of_day_precip = ds_precip["tp"].resample(time="1D").max(dim="time")
    # This correctly calculates daily precipitation and handles the first day
    daily_precip_grid = end_of_day_precip.diff(dim="time", label="upper").fillna(
        end_of_day_precip.isel(time=0)
    )
    daily_total_precip = daily_precip_grid.sum(dim=["latitude", "longitude"])

    # --- Step 3: Prepare data for JSON export ---
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
