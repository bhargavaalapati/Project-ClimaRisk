import cdsapi

c = cdsapi.Client()

# Generate a list of years as strings from 1991 to 2020
YEARS = [str(y) for y in range(1991, 2021)]

print(
    f"Requesting historical data for the first week of June for {len(YEARS)} years..."
)

try:
    c.retrieve(
        "reanalysis-era5-single-levels",
        {
            "product_type": "reanalysis",
            "format": "grib",
            "variable": "2m_temperature",
            # This is the key change: requesting many years
            "year": YEARS,
            # We only want one specific week across all those years
            "month": "06",
            "day": ["01", "02", "03", "04", "05", "06", "07"],
            # We'll get the temperature at noon each day
            "time": "12:00",
            "area": [18, 83, 17, 84],  # Bounding box for Visakhapatnam
        },
        "historical_june_week1_temp.grib",
    )

    print(
        "🚀 Success! Historical data request complete. Check for 'historical_june_week1_temp.grib'."
    )

except Exception as e:
    print(f"❌ An error occurred: {e}")
