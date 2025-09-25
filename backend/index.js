const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path'); 

const app = express();
const PORT = 8000;

app.use(cors());


let riskData = {};
let climatologyData = {};
let graphData = {};

try {
  riskData = JSON.parse(fs.readFileSync(path.join(__dirname, '../processed_data.json'), 'utf8'));
  climatologyData = JSON.parse(fs.readFileSync(path.join(__dirname, '../climatology_full_1991-2020_refined.json'), 'utf8'));
  graphData = JSON.parse(fs.readFileSync(path.join(__dirname, '../graph_data_daily_histogram.json'), 'utf8'));
  console.log('✅ All data files successfully loaded into memory.');
} catch (error) {
  console.error('❌ Error loading data files at startup:', error);
  // Exit if essential data can't be loaded
  process.exit(1); 
}


// --- API Endpoints ---

app.get('/api/real/risk', (req, res) => {
  res.json(riskData);
});

app.get('/api/climatology', (req, res) => {
  res.json(climatologyData);
});

app.get('/api/graph-data', (req, res) => {
  res.json(graphData);
});

// NEW: Catch-all route for any requests that don't match
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});


app.listen(PORT, () => {
  console.log(`✅ Backend server is running at http://localhost:${PORT}`);
});