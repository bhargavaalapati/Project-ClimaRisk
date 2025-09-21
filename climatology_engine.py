import xarray as xr
import numpy as np
import json


# --- Helper Functions ---
def calculate_percentile(data_series, percentile_value, axis=None):
    """Calculates a specific percentile from a series of data."""
    value = np.percentile(data_series, percentile_value, axis=axis)
    return value


def calculate_rain_probability(daily_precip_series, axis=None):
    """Calculates the probability of rain (> 0.1mm) for a given day."""
    # Count how many days had more than a trace amount of rain (0.1mm)
    rainy_days = np.sum(daily_precip_series > 0.0001, axis=axis)
    total_days = len(daily_precip_series)
    return (rainy_days / total_days) * 100  # Return as a percentage


# --- Main Script ---
if __name__ == "__main__":
    print("--- Starting Full Climatology Calculation ---")
    try:
        # We need to open the data twice with filters, just like in the processor
        ds_main = xr.open_dataset("historical_june_week1_temp.grib", engine="cfgrib")
        ds_precip = xr.open_dataset(
            "historical_june_week1_temp.grib",
            engine="cfgrib",
            backend_kwargs={"filter_by_keys": {"shortName": "tp"}},
        )

        # --- Process Temperature ---
        daily_max_temp_c = (
            ds_main["t2m"].resample(time="1D").max().max(dim=["latitude", "longitude"])
        ) - 273.15
        temp_climatology = daily_max_temp_c.groupby("time.dayofyear").reduce(
            calculate_percentile, percentile_value=95
        )

        # --- Process Precipitation ---
        end_of_day_precip = ds_precip["tp"].resample(time="1D").max()
        daily_precip_grid = end_of_day_precip.diff(dim="time", label="upper").fillna(
            end_of_day_precip.isel(time=0)
        )
        daily_total_precip_mm = (
            daily_precip_grid.sum(dim=["latitude", "longitude"]) * 1000
        )
        precip_probability = daily_total_precip_mm.groupby("time.dayofyear").reduce(
            calculate_rain_probability
        )

        # --- Save Final JSON ---
        climatology_output = {
            "location": "Visakhapatnam Area",
            "daily_climatology": {
                str(day): {
                    "p95_temp_celsius": (
                        round(temp_climatology.sel(dayofyear=day).item(), 2)
                        if day in temp_climatology.dayofyear
                        else None
                    ),
                    "rain_probability_percent": (
                        round(precip_probability.sel(dayofyear=day).item(), 2)
                        if day in precip_probability.dayofyear
                        else None
                    ),
                }
                for day in temp_climatology.dayofyear.values
            },
        }

        with open("climatology_june_week1.json", "w") as f:
            json.dump(climatology_output, f, indent=4)

        print("✅ Successfully saved full climatology to 'climatology_june_week1.json'")

    except Exception as e:
        print(f"❌ An error occurred: {e}")
