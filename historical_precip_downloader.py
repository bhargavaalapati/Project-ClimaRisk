import cdsapi

c = cdsapi.Client()
YEARS = [str(y) for y in range(1991, 2021)]
MONTHS = [str(m).zfill(2) for m in range(1, 13)]
DAYS = [str(d).zfill(2) for d in range(1, 32)]

print(
    f"Requesting FULL historical dataset (precipitation only) for {len(YEARS)} years..."
)

try:
    c.retrieve(
        "reanalysis-era5-single-levels",
        {
            "product_type": "reanalysis",
            "format": "grib",
            "variable": ["total_precipitation"],  # Only precipitation
            "year": YEARS,
            "month": MONTHS,
            "day": DAYS,
            "time": ["00:00", "06:00", "12:00", "18:00"],
            "area": [18, 83, 17, 84],
        },
        "historical_precip_1991-2020.grib",
    )  # New filename

    print("🚀 Success! Precipitation request sent.")
    print(
        "Monitor your request status by logging in at https://cds.climate.copernicus.eu and clicking 'Your requests'."
    )

except Exception as e:
    print(f"❌ An error occurred: {e}")
