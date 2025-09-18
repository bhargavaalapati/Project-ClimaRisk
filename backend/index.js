const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 8000;

app.use(cors()); // Enable communication between frontend and backend

// This is your mock API route with the Data Contract
app.get('/api/mock/risk', (req, res) => {
  const mockData = {
    "query": {
      "location": "Visakhapatnam, India",
      "date": "2025-10-26"
    },
    "riskAnalysis": {
      "todi": {
        "score": 72,
        "level": "High",
        "description": "High discomfort due to a combination of heat and humidity."
      },
      "temperature": {
        "historical_95th_percentile_celsius": 34.5,
        "forecast_celsius": 36.0,
        "distribution": [5, 15, 40, 80, 100, 80, 40, 15, 5]
      },
      "keyIndicators": [
        { "name": "Very Hot", "value": "97th Percentile", "risk": "High" },
        { "name": "Very Wet", "value": "40% Chance", "risk": "Moderate" },
        { "name": "Very Windy", "value": "15 km/h", "risk": "Low" }
      ]
    }
  };
  res.json(mockData);
});

app.listen(PORT, () => {
  console.log(`✅ Backend server is running at http://localhost:${PORT}`);
});