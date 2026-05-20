const Analysis = require('../models/Analysis');
const Source = require('../models/Source');
const FactCheck = require('../models/FactCheck');
const SemanticMatch = require('../models/SemanticMatch');
const Research = require('../models/Research');
const research = require('./research.service');
const python = require('./python.service');
const { cosine } = require('../utils/similarity');
const { ANALYSIS_STATUS, EVENTS } = require('../config/constants');
const { emitToUser } = require('../sockets');
const notify = require('./notification.service');
const logger = require('../utils/logger');

async function progress(analysis, pct, message) {
  analysis.progress = pct; await analysis.save();
  emitToUser(analysis.user.toString(), EVENTS.ANALYSIS_PROGRESS, { analysisId: analysis._id, progress: pct, message });
}

async function runAnalysis({ analysisId }) {
  const analysis = await Analysis.findById(analysisId);
  if (!analysis) throw new Error('Analysis missing');
  const r = await Research.findById(analysis.research).select('+extractedText title topic');
  if (!r) throw new Error('Research missing');

  analysis.status = ANALYSIS_STATUS.PROCESSING; analysis.startedAt = new Date(); await analysis.save();
  await progress(analysis, 5, 'Starting');

  try {
    // 1. Python AI analysis
    const aiResult = await python.analyzeText(r.extractedText || '', { topic: r.topic, title: r.title });
    analysis.summary = aiResult.summary;
    analysis.claims = (aiResult.claims || []).map(c => ({ text: c.text, verdict: c.verdict, confidence: c.confidence }));
    analysis.sentiment = aiResult.sentiment;
    analysis.credibilityScore = aiResult.credibilityScore;
    analysis.misinformationScore = aiResult.misinformationScore;
    analysis.metrics = aiResult.metrics;
    await analysis.save();
    await progress(analysis, 35, 'AI analysis complete');

    // 2. Internet research per claim (or topic)
    const queries = (analysis.claims?.length ? analysis.claims.map(c => c.text) : [r.topic || r.title]).slice(0, 5);
    const allSources = [];
    for (const q of queries) {
      const [s1, s2, s3] = await Promise.all([
        research.searchSerp(q, 5),
        research.searchNews(q, 5),
        research.searchAcademic(q, 5),
      ]);
      allSources.push(...s1, ...s2, ...s3);
    }
    await progress(analysis, 60, 'Internet research complete');

    // dedupe by url
    const seen = new Set();
    const unique = allSources.filter(s => s.url && !seen.has(s.url) && seen.add(s.url));

    // 3. Score & persist sources
    const baseText = (r.extractedText || '').slice(0, 20000);
    const sourceDocs = await Source.insertMany(unique.map(s => {
      const text = `${s.title || ''} ${s.snippet || ''}`;
      const sim = cosine(baseText, text);
      return {
        analysis: analysis._id, ...s,
        semanticSimilarity: Number(sim.toFixed(4)),
        relevanceScore: Number(Math.min(1, sim * 1.5).toFixed(4)),
        credibilityScore: domainCredibility(s.domain),
      };
    }));
    await progress(analysis, 75, 'Sources scored');

    // 4. Fact checks
    const factDocs = [];
    for (const c of (analysis.claims || []).slice(0, 5)) {
      const facts = await research.factCheck(c.text);
      facts.forEach(f => factDocs.push({ analysis: analysis._id, ...f }));
    }
    if (factDocs.length) await FactCheck.insertMany(factDocs);
    await progress(analysis, 88, 'Fact-check complete');

    // 5. Semantic matches per claim
    const matches = [];
    for (const c of (analysis.claims || []).slice(0, 10)) {
      for (const s of sourceDocs) {
        const sim = cosine(c.text, `${s.title || ''} ${s.snippet || ''}`);
        if (sim > 0.15) matches.push({ analysis: analysis._id, source: s._id, claim: c.text, matchedText: s.snippet, similarity: Number(sim.toFixed(4)) });
      }
    }
    if (matches.length) await SemanticMatch.insertMany(matches);

    analysis.status = ANALYSIS_STATUS.COMPLETED;
    analysis.completedAt = new Date();
    await analysis.save();
    await progress(analysis, 100, 'Done');
    emitToUser(analysis.user.toString(), EVENTS.ANALYSIS_DONE, { analysisId: analysis._id });
    await notify.notify(analysis.user, { type: 'analysis.completed', title: 'Analysis ready', message: `Analysis for "${r.title}" is ready.`, data: { analysisId: analysis._id } });

    r.status = 'ANALYZED'; await r.save();
  } catch (err) {
    logger.error('Analysis failed', err);
    analysis.status = ANALYSIS_STATUS.FAILED; analysis.error = err.message; await analysis.save();
    await notify.notify(analysis.user, { type: 'analysis.failed', title: 'Analysis failed', message: err.message, data: { analysisId: analysis._id } });
    throw err;
  }
}

function domainCredibility(domain='') {
  const trusted = ['nature.com','science.org','nytimes.com','bbc.com','reuters.com','apnews.com','semanticscholar.org','who.int','nih.gov','gov.uk'];
  if (!domain) return 0.5;
  if (trusted.some(d => domain.endsWith(d))) return 0.95;
  if (domain.endsWith('.gov') || domain.endsWith('.edu')) return 0.9;
  if (domain.endsWith('.org')) return 0.7;
  return 0.55;
}

module.exports = { runAnalysis };
