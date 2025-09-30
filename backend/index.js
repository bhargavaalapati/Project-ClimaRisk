const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = 8000;

app.use(cors());

// --- Pre-load mock data files (unchanged) ---
let riskData = {}, climatologyData = {}, graphData = {};
try {
  riskData = JSON.parse(fs.readFileSync(path.join(__dirname, '../processed_data.json'), 'utf8'));
  climatologyData = JSON.parse(fs.readFileSync(path.join(__dirname, '../climatology_full_1991-2020_refined.json'), 'utf8'));
  graphData = JSON.parse(fs.readFileSync(path.join(__dirname, '../graph_data_daily_histogram.json'), 'utf8'));
  console.log('✅ All mock data files successfully loaded.');
} catch (error) {
  console.error('❌ Error loading mock data files:', error);
  process.exit(1);
}

// --- API Endpoints (mock data endpoints are unchanged) ---
app.get('/api/real/risk', (req, res) => res.json(riskData));
app.get('/api/climatology', (req, res) => res.json(climatologyData));
app.get('/api/graph-data', (req, res) => res.json(graphData));


// --- NEW: The Live Analysis Streaming Endpoint ---
app.get('/api/live-risk', (req, res) => {
  const { lat, lon, date } = req.query;
  if (!lat || !lon || !date) {
    return res.status(400).json({ error: 'Parameters are required.' });
  }

  // Set headers for Server-Sent Events (SSE)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const pythonExecutable = path.join(__dirname, '../venv/bin/python3');
  const scriptPath = path.join(__dirname, '../live_nasa_processor.py');
  const pythonProcess = spawn(pythonExecutable, [scriptPath, lat, lon, date]);

  // Stream the progress logs from Python's stderr to the client
  pythonProcess.stderr.on('data', (data) => {
    // Format as an SSE message
    res.write(`data: ${data.toString()}\n\n`);
  });

  // When the script finishes, send the final JSON result
  let finalJson = '';
  pythonProcess.stdout.on('data', (data) => {
    finalJson += data.toString();
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      res.write(`data: {"error": "Failed to process live data."}\n\n`);
    } else {
      // Send the final result as a special "result" event
      res.write(`event: result\ndata: ${finalJson}\n\n`);
    }
    res.end(); // Close the connection
  });
});


app.listen(PORT, () => {
  console.log(`✅ Backend server is running at http://localhost:${PORT}`);
});