const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Backend is running!' });
});

// Test endpoint to check if API keys are loaded
app.get('/test-keys', (req, res) => {
  res.json({
    fmp_key_exists: !!process.env.FMP_API_KEY,
    fmp_key_length: process.env.FMP_API_KEY ? process.env.FMP_API_KEY.length : 0,
    anthropic_key_exists: !!process.env.ANTHROPIC_API_KEY,
    anthropic_key_length: process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.length : 0
  });
});

// Income statement endpoint
app.get('/api/income-statement/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/income-statement/${ticker}?period=annual&limit=5&apikey=${process.env.FMP_API_KEY}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Balance sheet endpoint
app.get('/api/balance-sheet/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${ticker}?period=annual&limit=5&apikey=${process.env.FMP_API_KEY}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cash flow endpoint
app.get('/api/cash-flow/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/cash-flow-statement/${ticker}?period=annual&limit=5&apikey=${process.env.FMP_API_KEY}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Company profile endpoint
app.get('/api/profile/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/profile/${ticker}?apikey=${process.env.FMP_API_KEY}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Anthropic AI endpoint
app.post('/api/ai-analysis', async (req, res) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});