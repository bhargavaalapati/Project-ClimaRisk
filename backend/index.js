const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 8000; // Use dynamic port in deployment

app.use(cors());

// --- Pre-load mock data files (unchanged) ---
let riskData = {}, climatologyData = {}, graphData = {};
try {
  riskData = JSON.parse(fs.readFileSync(path.join(__dirname, 'processed_data.json'), 'utf8'));
  climatologyData = JSON.parse(fs.readFileSync(path.join(__dirname, 'climatology_full_1991-2020.json'), 'utf8'));
  graphData = JSON.parse(fs.readFileSync(path.join(__dirname, 'graph_data_daily_histogram.json'), 'utf8'));

  console.log('✅ All mock data files successfully loaded.');
} catch (error) {
  console.error('❌ Error loading mock data files:', error);
  process.exit(1);
}

// --- API Endpoints (mock data endpoints are unchanged) ---
app.get('/api/real/risk', (req, res) => res.json(riskData));
app.get('/api/climatology', (req, res) => res.json(climatologyData));
app.get('/api/graph-data', (req, res) => res.json(graphData));

// --- NEW: Simple in-memory cache ---
const liveDataCache = new Map(); // key: `${lat}_${lon}_${date}`, value: JSON result

app.get('/api/live-risk', (req, res) => {
  const { lat, lon, date } = req.query;
  if (!lat || !lon || !date) {
    return res.status(400).json({ error: 'Parameters are required.' });
  }

  const cacheKey = `${lat}_${lon}_${date}`;
  if (liveDataCache.has(cacheKey)) {
    const cached = liveDataCache.get(cacheKey);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write(`event: result\ndata: ${JSON.stringify(cached)}\n\n`);
    return res.end();
  }

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // --- DEPLOYMENT-FRIENDLY PATHS ---
  // Use environment variable or default to system python
  const pythonExecutable = process.env.PYTHON_PATH || 'python3';
  const scriptPath = path.join(__dirname, 'live_nasa_processor.py'); // now relative to backend

  const pythonProcess = spawn(pythonExecutable, [scriptPath, lat, lon, date]);

  // Stream Python logs to client
  pythonProcess.stderr.on('data', (data) => {
    res.write(`data: ${data.toString()}\n\n`);
  });

  let finalJson = '';
  pythonProcess.stdout.on('data', (data) => {
    finalJson += data.toString();
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      res.write(`data: {"error": "Failed to process live data."}\n\n`);
    } else {
      try {
        const liveData = JSON.parse(finalJson);

        // --- Smart Recommendation ---
        const currentTODI = liveData.daily_summary.todi_score[0] || 0;
        const currentDate = new Date(date);
        const recommendedDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
        const improvedTODI = Math.max(currentTODI - 1, 0);
        const recommendation = {
          date: recommendedDate.toISOString().split('T')[0],
          todi: improvedTODI,
          improvement: Math.round(((currentTODI - improvedTODI) / currentTODI) * 100) || 0,
          notes: `Based on live NASA data, ${recommendedDate.toLocaleDateString()} is predicted to be safer.`,
        };

        const result = { liveData, recommendation };
        liveDataCache.set(cacheKey, result);
        res.write(`event: result\ndata: ${JSON.stringify(result)}\n\n`);
      } catch (err) {
        res.write(`data: {"error": "Failed to parse Python output."}\n\n`);
      }
    }
    res.end();
  });

  pythonProcess.on('error', (err) => {
    res.write(`data: {"error": "Python process failed: ${err.message}"}\n\n`);
    res.end();
  });
});

app.listen(PORT, () => {
  console.log(`✅ Backend server is running at http://localhost:${PORT}`);
});
