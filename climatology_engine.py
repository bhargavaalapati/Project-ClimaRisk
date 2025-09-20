import xarray as xr
import numpy as np
import json


# MODIFIED HERE to accept the 'axis' argument from xarray
def calculate_percentile(data_series, percentile_value, axis=None):
    """Calculates a specific percentile from a series of data."""
    if len(data_series) == 0:
        return None

    # MODIFIED HERE to pass the 'axis' argument along to numpy
    value = np.percentile(data_series, percentile_value, axis=axis)
    return value


# The rest of the script is the same
if __name__ == "__main__":
    print("--- Starting Climatology Calculation ---")

    try:
        historical_ds = xr.open_dataset(
            "historical_june_week1_temp.grib", engine="cfgrib"
        )

        daily_max_temp_k = historical_ds["t2m"].resample(time="1D").max()
        daily_max_temp_c = daily_max_temp_k.max(dim=["latitude", "longitude"]) - 273.15

        grouped_by_day = daily_max_temp_c.groupby("time.dayofyear")

        climatology = grouped_by_day.reduce(calculate_percentile, percentile_value=95)

        print("✅ Climatology calculation successful!")
        print(climatology.to_pandas())

        climatology_output = {
            "location": "Visakhapatnam Area",
            "percentile": 95,
            "daily_thresholds_celsius": {
                str(day): round(temp, 2)
                for day, temp in climatology.to_pandas().items()
            },
        }

        with open("climatology_june_week1.json", "w") as f:
            json.dump(climatology_output, f, indent=4)

        print("✅ Successfully saved climatology to 'climatology_june_week1.json'")

    except FileNotFoundError:
        print(
            "❌ Error: The historical data file ('historical_june_week1_temp.grib') was not found."
        )
        print("Please make sure the historical data downloader has finished running.")
    except Exception as e:
        print(f"❌ An error occurred: {e}")
