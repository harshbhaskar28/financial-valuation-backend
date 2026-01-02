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
    alpha_vantage_key_exists: !!process.env.ALPHA_VANTAGE_API_KEY,
    alpha_vantage_key_length: process.env.ALPHA_VANTAGE_API_KEY ? process.env.ALPHA_VANTAGE_API_KEY.length : 0,
    anthropic_key_exists: !!process.env.ANTHROPIC_API_KEY,
    anthropic_key_length: process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.length : 0
  });
});

// Income statement endpoint
app.get('/api/income-statement/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    const response = await fetch(
      `https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${ticker}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();
    
    if (data.Note || data['Error Message']) {
      return res.status(429).json({ error: data.Note || data['Error Message'] });
    }
    
    // Transform Alpha Vantage data to match FMP format
    const annualReports = data.annualReports || [];
    const transformed = annualReports.slice(0, 5).map(report => ({
      date: report.fiscalDateEnding,
      revenue: parseInt(report.totalRevenue) || 0,
      costOfRevenue: parseInt(report.costOfRevenue) || 0,
      grossProfit: parseInt(report.grossProfit) || 0,
      operatingExpenses: parseInt(report.operatingExpenses) || 0,
      ebitda: parseInt(report.ebitda) || 0,
      researchAndDevelopmentExpenses: parseInt(report.researchAndDevelopment) || 0,
      sellingGeneralAndAdministrativeExpenses: parseInt(report.sellingAndMarketingExpenses) || 0,
      depreciationAndAmortization: parseInt(report.depreciationAndAmortization) || 0,
      netIncome: parseInt(report.netIncome) || 0
    }));
    
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Balance sheet endpoint
app.get('/api/balance-sheet/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    const response = await fetch(
      `https://www.alphavantage.co/query?function=BALANCE_SHEET&symbol=${ticker}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();
    
    if (data.Note || data['Error Message']) {
      return res.status(429).json({ error: data.Note || data['Error Message'] });
    }
    
    const annualReports = data.annualReports || [];
    const transformed = annualReports.slice(0, 5).map(report => ({
      date: report.fiscalDateEnding,
      totalCurrentAssets: parseInt(report.totalCurrentAssets) || 0,
      totalCurrentLiabilities: parseInt(report.totalCurrentLiabilities) || 0,
      totalAssets: parseInt(report.totalAssets) || 0,
      totalLiabilities: parseInt(report.totalLiabilities) || 0
    }));
    
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cash flow endpoint
app.get('/api/cash-flow/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    const response = await fetch(
      `https://www.alphavantage.co/query?function=CASH_FLOW&symbol=${ticker}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();
    
    if (data.Note || data['Error Message']) {
      return res.status(429).json({ error: data.Note || data['Error Message'] });
    }
    
    const annualReports = data.annualReports || [];
    const transformed = annualReports.slice(0, 5).map(report => ({
      date: report.fiscalDateEnding,
      operatingCashFlow: parseInt(report.operatingCashflow) || 0,
      capitalExpenditure: parseInt(report.capitalExpenditures) || 0,
      freeCashFlow: (parseInt(report.operatingCashflow) || 0) - Math.abs(parseInt(report.capitalExpenditures) || 0)
    }));
    
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Company profile endpoint
app.get('/api/profile/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    const response = await fetch(
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();
    
    if (data.Note || data['Error Message']) {
      return res.status(429).json({ error: data.Note || data['Error Message'] });
    }
    
    // Transform to array format to match FMP
    const transformed = [{
      companyName: data.Name,
      price: parseFloat(data['50DayMovingAverage']) || 150,
      industry: data.Industry,
      sector: data.Sector,
      mktCap: parseInt(data.MarketCapitalization) || 0
    }];
    
    res.json(transformed);
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