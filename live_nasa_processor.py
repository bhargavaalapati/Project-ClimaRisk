import sys
import json
import xarray as xr
import numpy as np
import earthaccess
import requests
import todi_engine


def process_live_data(lat, lon, start_date, end_date):
    """
    Fetches and processes live MERRA-2 data for a specific location and date.
    """
    try:
        # UPDATED: All progress messages now print to stderr
        print("--- Live NASA Analysis Started ---", file=sys.stderr)
        print(
            f"1. Searching for MERRA-2 data for Lat: {lat}, Lon: {lon}...",
            file=sys.stderr,
        )

        bounding_box = (float(lon), float(lat), float(lon) + 0.625, float(lat) + 0.5)

        results = earthaccess.search_data(
            short_name="M2T1NXSLV",
            version="5.12.4",
            temporal=(start_date, end_date),
            bounding_box=bounding_box,
        )
        if not results:
            return {"error": "No live data found for this location/date."}

        print("2. Found data granule. Constructing download URL...", file=sys.stderr)
        opendap_url = results[0]["umm"]["RelatedUrls"][0]["URL"]
        required_vars = "T2M,U10M,V10M,T2MDEW"
        download_url = f"{opendap_url}?{required_vars}"

        print(f"3. Starting download from NASA server...", file=sys.stderr)
        response = requests.get(download_url, timeout=120)
        response.raise_for_status()
        print("4. Download complete. Processing data in memory...", file=sys.stderr)

        ds = xr.open_dataset(response.content)

        daily_max_temp_c = ds["T2M"].mean().item() - 273.15
        wind_speed = (ds["U10M"] ** 2 + ds["V10M"] ** 2) ** 0.5
        daily_max_wind_ms = wind_speed.mean().item()
        todi_score = todi_engine.calculate_todi_score(
            daily_max_temp_c, 65.0, daily_max_wind_ms
        )

        # Safety checks for NaN values
        daily_max_temp_c = (
            None if np.isnan(daily_max_temp_c) else round(daily_max_temp_c, 2)
        )
        daily_max_wind_ms = (
            None if np.isnan(daily_max_wind_ms) else round(daily_max_wind_ms, 2)
        )
        todi_score = None if np.isnan(todi_score) else todi_score

        print("5. Processing complete. Generating final JSON output.", file=sys.stderr)
        print("--- Live NASA Analysis Finished ---", file=sys.stderr)

        return {
            "location": f"Live Data for {lat}, {lon}",
            "daily_summary": {
                "timestamps": [start_date],
                "max_temp_celsius": [daily_max_temp_c],
                "max_wind_speed_ms": [daily_max_wind_ms],
                "todi_score": [todi_score],
            },
        }
    except Exception as e:
        # Errors should also go to stderr
        print(
            f"An error occurred during live data processing: {str(e)}", file=sys.stderr
        )
        return {"error": f"An error occurred during live data processing."}


if __name__ == "__main__":
    latitude = float(sys.argv[1])
    longitude = float(sys.argv[2])
    date_str = sys.argv[3]

    processed_data = process_live_data(latitude, longitude, date_str, date_str)

    # This is the ONLY print statement that goes to the standard output
    print(json.dumps(processed_data))
