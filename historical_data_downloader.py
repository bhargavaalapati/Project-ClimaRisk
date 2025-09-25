import cdsapi
import os

c = cdsapi.Client()

# Define the years we want to download
YEARS = [str(y) for y in range(1991, 2021)]
MONTHS = [str(m).zfill(2) for m in range(1, 13)]
DAYS = [str(d).zfill(2) for d in range(1, 32)]
VARIABLES = [
    "2m_temperature",
    "10m_u_component_of_wind",
    "10m_v_component_of_wind",
    "2m_dewpoint_temperature",
]

# Create a directory to store the yearly files
output_dir = "historical_data_main"
os.makedirs(output_dir, exist_ok=True)

# --- NEW: Loop through each year and make a separate request ---
for year in YEARS:
    output_filename = f"{output_dir}/main-vars_{year}.grib"

    # Check if the file already exists to avoid re-downloading
    if os.path.exists(output_filename):
        print(f"File for year {year} already exists. Skipping.")
        continue

    print(f"Requesting historical data (main variables) for year: {year}")
    try:
        c.retrieve(
            "reanalysis-era5-single-levels",
            {
                "product_type": "reanalysis",
                "format": "grib",
                "variable": VARIABLES,
                "year": year,  # Request only one year at a time
                "month": MONTHS,
                "day": DAYS,
                "time": ["00:00", "06:00", "12:00", "18:00"],
                "area": [18, 83, 17, 84],
            },
            output_filename,
        )  # Use a unique filename for each year

        print(f"🚀 Success! Data for {year} saved to {output_filename}")

    except Exception as e:
        print(f"❌ An error occurred for year {year}: {e}")
        print("Moving to the next year...")
        continue  # If one year fails, continue with the next
