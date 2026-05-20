const axios = require('axios');
const logger = require('../utils/logger');

const client = axios.create({
  baseURL: process.env.PYTHON_API_URL || 'http://localhost:8000',
  timeout: 120000,
  headers: process.env.PYTHON_API_KEY ? { 'X-API-Key': process.env.PYTHON_API_KEY } : {},
});

async function call(endpoint, data) {
  try {
    const { data: result } = await client.post(endpoint, data);
    return result;
  } catch (err) {
    const msg = err?.response?.data?.detail || err.message || 'Python service unavailable';
    logger.error(`Python service error [${endpoint}]: ${msg}`);
    throw new Error(msg);
  }
}

exports.analyzeText = (text, opts = {}) => call('/analyze', { text, ...opts });
exports.sentiment   = (text) => call('/sentiment', { text });
exports.keywords    = (text, topN = 15) => call('/keywords', { text, top_n: topN });
exports.summarize   = (text, maxLen = 300) => call('/summary', { text, max_length: maxLen });
exports.toxicity    = (text) => call('/toxicity', { text });
exports.misinformation = (text) => call('/misinformation', { text });
exports.semanticSearch = (query, candidates, topK = 5) => call('/semantic-search', { query, candidates, top_k: topK });
exports.chat        = async (message, context = '') => {
  const r = await call('/chat', { message, context });
  return r.reply || r.response || '';
};
