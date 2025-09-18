import cdsapi

# This will automatically use your .cdsapirc file
c = cdsapi.Client()

print("✅ API client initialized. Sending request to server...")

try:
    # This is the request for the data
    c.retrieve(
        "reanalysis-era5-single-levels",
        {
            "product_type": "reanalysis",
            "format": "grib",
            "variable": "2m_temperature",
            "year": "2022",
            "month": "05",  # Just May for a quick test
            "day": ["01", "02", "03"],  # Just the first 3 days
            "time": "12:00",
            "area": [18, 83, 17, 84],  # Bounding box for Visakhapatnam
        },
        "test_download.grib",
    )  # The file it will create

    print("🚀 Success! Request complete. Check for 'test_download.grib' file.")

except Exception as e:
    print(
        f"❌ An error occurred. Please check your API key and request parameters.\nError details: {e}"
    )
