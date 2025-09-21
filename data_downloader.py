import cdsapi  # pyright: ignore[reportMissingImports]

# This will automatically use your .cdsapirc file
c = cdsapi.Client()

print("✅ API client initialized. Sending request for multiple variables...")

try:
    # This is the request for the data
    c.retrieve(
        "reanalysis-era5-single-levels",
        {
            "product_type": "reanalysis",
            "format": "grib",
            # MODIFIED HERE to include more variables
            "variable": [
                "2m_temperature",
                "10m_u_component_of_wind",
                "10m_v_component_of_wind",
                "total_precipitation",
            ],
            "year": "2023",  # A recent, complete year
            "month": "06",  # Align with your climatology data
            "day": [  # The first week of June
                "01",
                "02",
                "03",
                "04",
                "05",
                "06",
                "07",
            ],
        },
        "multi_variable_test.grib",
    )  # Changed the output filename

    print("🚀 Success! Request complete. Check for 'multi_variable_test.grib' file.")

except Exception as e:
    print(
        f"❌ An error occurred. Please check your API key and request parameters.\nError details: {e}"
    )
