import math


# --- Helper Functions (no changes) ---
def calculate_heat_index(temp_celsius, relative_humidity):
    temp_fahrenheit = (temp_celsius * 9 / 5) + 32
    heat_index_f = 0.5 * (
        temp_fahrenheit
        + 61.0
        + ((temp_fahrenheit - 68.0) * 1.2)
        + (relative_humidity * 0.094)
    )
    if heat_index_f < temp_fahrenheit:
        heat_index_f = temp_fahrenheit
    heat_index_celsius = (heat_index_f - 32) * 5 / 9
    return heat_index_celsius


def calculate_wind_chill(temp_celsius, wind_speed_ms):
    if temp_celsius > 10 or wind_speed_ms < 1.3:
        return temp_celsius
    temp_f = (temp_celsius * 9 / 5) + 32
    wind_mph = wind_speed_ms * 2.23694
    wind_chill_f = (
        35.74
        + (0.6215 * temp_f)
        - (35.75 * (wind_mph**0.16))
        + (0.4275 * temp_f * (wind_mph**0.16))
    )
    wind_chill_c = (wind_chill_f - 32) * 5 / 9
    return wind_chill_c


# --- NEW Main Function ---
def calculate_todi_score(temp_celsius, relative_humidity, wind_speed_ms):
    """
    Calculates the final 0-100 TODI score.
    It decides whether to use Heat Index or Wind Chill.
    """
    feels_like_c = temp_celsius

    # Decide which calculation to use based on temperature
    if temp_celsius > 27:  # If it's hot, calculate heat index
        feels_like_c = calculate_heat_index(temp_celsius, relative_humidity)
    elif temp_celsius < 10:  # If it's cold, calculate wind chill
        feels_like_c = calculate_wind_chill(temp_celsius, wind_speed_ms)

    # --- Convert "feels like" temperature to a 0-100 score ---
    # We'll define our discomfort scale from 10°C (score 0) to 40°C (score 100)
    # This is a simple linear scale we can adjust later.
    lower_bound_temp = 10
    upper_bound_temp = 40

    score = (
        (feels_like_c - lower_bound_temp) / (upper_bound_temp - lower_bound_temp)
    ) * 100

    # Clamp the score between 0 and 100
    score = max(0, min(100, score))

    return int(score)


# --- Main test block updated ---
if __name__ == "__main__":
    # Test Case 1: Hot and Humid Day
    hot_temp = 32.0
    humidity = 65.0
    hot_wind = 2.0
    hot_score = calculate_todi_score(hot_temp, humidity, hot_wind)
    print(f"--- Test Case 1: Hot Day ---")
    print(f"Score: {hot_score}/100\n")

    # Test Case 2: Mild Day
    mild_temp = 20.0
    mild_humidity = 50.0
    mild_wind = 3.0
    mild_score = calculate_todi_score(mild_temp, mild_humidity, mild_wind)
    print(f"--- Test Case 2: Mild Day ---")
    print(f"Score: {mild_score}/100\n")

    # Test Case 3: Cold and Windy Day
    cold_temp = 2.0
    cold_humidity = 40.0
    cold_wind = 10.0
    cold_score = calculate_todi_score(cold_temp, cold_humidity, cold_wind)
    print(f"--- Test Case 3: Cold Day ---")
    print(f"Score: {cold_score}/100")
