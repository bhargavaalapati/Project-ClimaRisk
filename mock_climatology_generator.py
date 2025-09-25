import numpy as np
import json

climatology_output = {"location": "Global Test Location", "daily_climatology": {}}

rainy_seasons = [(100, 130), (250, 280)]  # Define rainy season day ranges

for day in range(1, 367):
    seasonal_factor = -np.cos((day / 366.0) * 2 * np.pi)
    base_temp = 28 + (seasonal_factor * 10)
    base_wind = 8 + (seasonal_factor * 5)

    # Default rain probability outside rainy seasons
    rain_prob = max(0, 10 + (seasonal_factor * 30) + np.random.uniform(-5, 5))

    # Boost rain probability smoothly inside rainy seasons
    for start, end in rainy_seasons:
        if start <= day <= end:
            mid = (start + end) / 2
            peak = 70  # peak rain probability at mid-season
            # Smooth ramp: use a cosine curve
            rain_prob = peak * (1 + np.cos(np.pi * (day - mid) / (end - start))) / 2
            rain_prob += np.random.uniform(-5, 5)  # small randomness
            break

    stats_dict = {
        "p5_temp_celsius": round(base_temp - 8.0, 2),
        "p75_temp_celsius": round(base_temp + 2.0, 2),
        "p80_temp_celsius": round(base_temp + 2.8, 2),
        "p85_temp_celsius": round(base_temp + 3.6, 2),
        "p90_temp_celsius": round(base_temp + 4.5, 2),
        "p95_temp_celsius": round(base_temp + 6.5, 2),
        "p99_temp_celsius": round(base_temp + 9.0, 2),
        "p95_wind_speed_ms": round(base_wind + 5.0, 2),
        "rain_probability_percent": round(rain_prob, 2),
    }

    climatology_output["daily_climatology"][str(day)] = stats_dict

with open("climatology_full_1991-2020.json", "w") as f:
    json.dump(climatology_output, f, indent=4)

print("✅ Successfully created refined climatology with rainy seasons!")
