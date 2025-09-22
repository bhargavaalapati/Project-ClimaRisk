import cdsapi

c = cdsapi.Client()

YEARS = [str(y) for y in range(1991, 2021)]

print(f"Requesting historical data for multiple variables for {len(YEARS)} years...")

try:
    c.retrieve(
        "reanalysis-era5-single-levels",
        {
            "product_type": "reanalysis",
            "format": "grib",
            # UPDATED: Request all the variables we need
            "variable": [
                "2m_temperature",
                "10m_u_component_of_wind",
                "10m_v_component_of_wind",
                "total_precipitation",
            ],
            "year": YEARS,
            "month": "06",
            "day": ["01", "02", "03", "04", "05", "06", "07"],
            "time": "12:00",
            "area": [18, 83, 17, 84],
        },
        # UPDATED: New, more descriptive filename
        "historical_june_week1_multi-variable.grib",
    )

    print("🚀 Success! Historical data request complete.")

except Exception as e:
    print(f"❌ An error occurred: {e}")
