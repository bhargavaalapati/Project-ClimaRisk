# 🚀 Project ClimaRisk

ClimaRisk is a personalized climatological risk assessment tool designed for the NASA Space Apps 2025 Challenge. It provides users with the historical likelihood of adverse weather conditions for any location and date, empowering them to make informed, data-driven decisions for long-term planning.

![ClimaRisk Dashboard Screenshot]()
*Soon...*

## The Problem

Standard weather apps provide short-term forecasts but fail to help users plan long-range events like vacations, hikes, or festivals. ClimaRisk fills this gap by shifting the paradigm from "what will the weather be?" to "what are the historical risks of this weather being uncomfortable or extreme?"

## Key Features

* **Interactive Global Map:** Select any location on Earth with a simple click.
* **Total Outdoor Discomfort Index (TODI):** A unique, holistic score from 0-100 that combines temperature, humidity, and wind to measure the "feels like" discomfort.
* **Historical Risk Analysis:** Compares daily weather summaries against 30 years of historical data to identify statistically significant extreme conditions.
* **Personalized Thresholds:** Users can adjust the percentile (e.g., 90th, 95th) used to define "very hot," "very windy," etc.
* **Downloadable Reports:** Export a clean, formatted PDF or JSON report of the climate risk analysis for any location.

## Tech Stack

* **Frontend:** React, Vite, Ant Design, Recharts, `react-leaflet`
* **Backend:** Node.js, Express.js
* **Data Pipeline & Climatology Engine:** Python, xarray, cfgrib, NumPy, pandas
* **Primary Data Source:** Copernicus ERA5 Reanalysis Dataset

## How to Run Locally

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/bhargavaalapati/Project-ClimaRisk.git](https://github.com/bhargavaalapati/Project-ClimaRisk.git)
    cd Project-ClimaRisk
    ```
2.  **Setup the Backend:**
    * Navigate to the `backend` folder and install dependencies: `cd backend && npm install`.
    * Start the server: `node index.js`.
3.  **Setup the Python Environment:**
    * Create and activate a virtual environment: `python3 -m venv venv && source venv/bin/activate`.
    * Install Python dependencies: `pip install -r requirements.txt`. *(You will need to create a `requirements.txt` file)*.
4.  **Setup the Frontend:**
    * In a new terminal, navigate to the `frontend` folder and install dependencies: `cd frontend && npm install`.
    * Start the dev server: `npm run dev`.

---
*This project was developed for the NASA Space Apps 2025 Challenge.*
