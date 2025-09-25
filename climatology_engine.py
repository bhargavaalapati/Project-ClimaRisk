import xarray as xr
import numpy as np
import json
import glob


def calculate_all_stats(data_group):
    """
    Calculates multiple percentiles for temperature and the rain probability.
    """
    percentiles_to_calc = [75, 80, 85, 90, 95, 99]
    temp_data = data_group.get("t2m")
    precip_data = data_group.get("tp")

    stats = {}
    if temp_data is not None and temp_data.size > 0:
        for p in percentiles_to_calc:
            stats[f"p{p}_temp_celsius"] = np.percentile(temp_data.values, p)

    if precip_data is not None and precip_data.size > 0:
        # Correctly calculate total days in the group for probability
        total_days = len(np.unique(precip_data.time.dt.date))
        if total_days > 0:
            rainy_days = np.sum(precip_data.values > 0.1)
            stats["rain_probability_percent"] = (rainy_days / total_days) * 100
        else:
            stats["rain_probability_percent"] = 0
    else:
        stats["rain_probability_percent"] = 0

    return xr.Dataset(stats)


# --- Main Script ---
if __name__ == "__main__":
    print("--- Starting Full Climatology Calculation for 1991-2020 ---")
    try:
        # CORRECTED: Find and open the FOLDER of main variable files
        main_files = sorted(glob.glob("historical_data_main/main-vars_*.grib"))
        print(f"Found {len(main_files)} main data files to process.")
        ds_main = xr.open_mfdataset(main_files, engine="cfgrib", combine="by_coords")

        # CORRECTED: Open the SINGLE large precipitation file
        print("Found 1 precipitation file to process.")
        ds_precip = xr.open_dataset("historical_precip_1991-2020.grib", engine="cfgrib")

        # Merge the two datasets
        historical_ds = xr.merge([ds_main, ds_precip], compat="override")

        print("All data files successfully loaded and merged.")

        # Convert units
        historical_ds["t2m"] = historical_ds["t2m"] - 273.15
        historical_ds["tp"] = historical_ds["tp"] * 1000

        # Group by day of year and apply our calculation function
        climatology = historical_ds.groupby("time.dayofyear").map(calculate_all_stats)

        # --- Save Final JSON ---
        climatology_output = {"location": "Visakhapatnam Area", "daily_climatology": {}}
        all_days = sorted(list(climatology.dayofyear.values))

        for day in all_days:
            day_data = climatology.sel(dayofyear=day)
            stats_dict = {
                key: (
                    round(day_data[key].item(), 2)
                    if not np.isnan(day_data[key].item())
                    else None
                )
                for key in day_data.data_vars
            }
            climatology_output["daily_climatology"][str(day)] = stats_dict

        with open("climatology_full_1991-2020.json", "w") as f:
            json.dump(climatology_output, f, indent=4)

        print(
            "✅ Successfully saved FINAL climatology to 'climatology_full_1991-2020.json'"
        )

    except Exception as e:
        print(f"❌ An error occurred: {e}")
        print("Exiting the script.")
