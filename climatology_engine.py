import xarray as xr
import numpy as np
import json


def calculate_all_stats(data_group):
    """
    A function to be applied to each group of daily data.
    It calculates multiple percentiles for temperature and the rain probability.
    """
    percentiles_to_calc = [75, 80, 85, 90, 95, 99]
    temp_data = data_group.get("t2m", default=xr.DataArray([]))
    precip_data = data_group.get("tp", default=xr.DataArray([]))
    temp_results = {
        f"p{p}_temp_celsius": (
            np.percentile(temp_data, p) if temp_data.size > 0 else np.nan
        )
        for p in percentiles_to_calc
    }
    if precip_data.size > 0:
        rainy_days = np.sum(precip_data > 0.1)
        rain_prob = (rainy_days / len(precip_data.time)) * 100
    else:
        rain_prob = np.nan
    temp_results["rain_probability_percent"] = rain_prob
    return xr.Dataset(temp_results)


# --- Main Script ---
if __name__ == "__main__":
    print("--- Starting Full Multi-Percentile Climatology Calculation ---")
    try:
        ds_main = xr.open_dataset(
            "historical_june_week1_multi-variable.grib", engine="cfgrib"
        )
        ds_precip = xr.open_dataset(
            "historical_june_week1_multi-variable.grib",
            engine="cfgrib",
            backend_kwargs={"filter_by_keys": {"shortName": "tp"}},
        )
        historical_ds = xr.merge([ds_main, ds_precip], compat="override")

        historical_ds["t2m"] = historical_ds["t2m"] - 273.15
        historical_ds["tp"] = historical_ds["tp"] * 1000

        climatology = historical_ds.groupby("time.dayofyear").map(calculate_all_stats)

        # --- Save Final JSON ---
        climatology_output = {"location": "Visakhapatnam Area", "daily_climatology": {}}
        all_days = sorted(list(climatology.dayofyear.values))

        # UPDATED: This loop now correctly handles NaN -> null conversion
        for day in all_days:
            day_data = climatology.sel(dayofyear=day)
            stats_dict = {}
            for key in day_data.data_vars:
                value = day_data[key].item()
                # Check if the value is NaN, if so, use None (which becomes null in JSON)
                stats_dict[key] = round(value, 2) if not np.isnan(value) else None
            climatology_output["daily_climatology"][str(day)] = stats_dict

        with open("climatology_june_week1.json", "w") as f:
            json.dump(climatology_output, f, indent=4)

        print(
            "✅ Successfully saved multi-percentile climatology to 'climatology_june_week1.json'"
        )
    except Exception as e:
        print(f"❌ An error occurred: {e}")
    print("--- Finished Full Multi-Percentile Climatology Calculation ---")
