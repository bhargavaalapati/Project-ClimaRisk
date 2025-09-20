const express = require('express');
const fs = require('fs'); 
const cors = require('cors');
const app = express();
const PORT = 8000;

app.use(cors()); // Enable communication between frontend and backend

// New REAL API Endpoint
app.get('/api/real/risk', (req, res) => {
  fs.readFile('../processed_data.json', 'utf8', (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(500).send('Error reading processed data');
    }
    res.json(JSON.parse(data));
  });
});

app.listen(PORT, () => {
  console.log(`✅ Backend server is running at http://localhost:${PORT}`);
});