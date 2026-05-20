const axios = require('axios');
const logger = require('../utils/logger');

async function searchSerp(query, limit = 10) {
  if (!process.env.SERP_API_KEY) return [];
  try {
    const { data } = await axios.get('https://serpapi.com/search.json', {
      params: { q: query, api_key: process.env.SERP_API_KEY, num: limit },
      timeout: 15000,
    });
    return (data.organic_results || []).map(r => ({
      provider: 'serpapi', url: r.link, title: r.title, snippet: r.snippet,
      domain: safeDomain(r.link), publishedAt: null,
    }));
  } catch (e) { logger.warn(`serp error: ${e.message}`); return []; }
}

async function searchNews(query, limit = 10) {
  if (!process.env.NEWS_API_KEY) return [];
  try {
    const { data } = await axios.get('https://newsapi.org/v2/everything', {
      params: { q: query, pageSize: limit, sortBy: 'relevancy', language: 'en' },
      headers: { 'X-Api-Key': process.env.NEWS_API_KEY }, timeout: 15000,
    });
    return (data.articles || []).map(a => ({
      provider: 'newsapi', url: a.url, title: a.title, snippet: a.description,
      domain: safeDomain(a.url), publishedAt: a.publishedAt,
    }));
  } catch (e) { logger.warn(`news error: ${e.message}`); return []; }
}

async function searchAcademic(query, limit = 10) {
  try {
    const { data } = await axios.get('https://api.semanticscholar.org/graph/v1/paper/search', {
      params: { query, limit, fields: 'title,abstract,url,year,authors' },
      headers: process.env.SEMANTIC_SCHOLAR_API_KEY ? { 'x-api-key': process.env.SEMANTIC_SCHOLAR_API_KEY } : {},
      timeout: 20000,
    });
    return (data.data || []).map(p => ({
      provider: 'semanticscholar', url: p.url, title: p.title, snippet: p.abstract,
      domain: 'semanticscholar.org', publishedAt: p.year ? new Date(`${p.year}-01-01`) : null,
    }));
  } catch (e) { logger.warn(`academic error: ${e.message}`); return []; }
}

async function factCheck(query) {
  if (!process.env.GOOGLE_FACTCHECK_API_KEY) return [];
  try {
    const { data } = await axios.get('https://factchecktools.googleapis.com/v1alpha1/claims:search', {
      params: { query, key: process.env.GOOGLE_FACTCHECK_API_KEY }, timeout: 15000,
    });
    const out = [];
    for (const c of data.claims || []) {
      for (const r of c.claimReview || []) {
        out.push({ claim: c.text, verdict: mapVerdict(r.textualRating), rating: r.textualRating, publisher: r.publisher?.name, url: r.url, reviewedAt: r.reviewDate ? new Date(r.reviewDate) : null });
      }
    }
    return out;
  } catch (e) { logger.warn(`factcheck error: ${e.message}`); return []; }
}

function mapVerdict(t='') {
  const s = t.toLowerCase();
  if (s.includes('true')) return 'TRUE';
  if (s.includes('false')) return 'FALSE';
  if (s.includes('mix') || s.includes('partly')) return 'MIXED';
  return 'UNVERIFIED';
}
function safeDomain(u) { try { return new URL(u).hostname.replace(/^www\./,''); } catch { return null; } }

module.exports = { searchSerp, searchNews, searchAcademic, factCheck };
