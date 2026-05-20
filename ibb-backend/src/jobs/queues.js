const { Queue } = require('bullmq');
const { getRedis } = require('../config/redis');
const logger = require('../utils/logger');

let analysisQueue = null;
let reportQueue = null;

// Lazy queue creation — only if Redis is available
function getAnalysisQueue() {
  if (analysisQueue) return analysisQueue;
  const conn = getRedis();
  if (!conn) { logger.warn('No Redis — analysis queue unavailable'); return null; }
  analysisQueue = new Queue('analysis', { connection: conn });
  return analysisQueue;
}

function getReportQueue() {
  if (reportQueue) return reportQueue;
  const conn = getRedis();
  if (!conn) return null;
  reportQueue = new Queue('report', { connection: conn });
  return reportQueue;
}

// Proxy objects that resolve lazily
const analysisQueueProxy = {
  add: async (...args) => {
    const q = getAnalysisQueue();
    if (!q) { logger.warn('Queue unavailable — job skipped'); return null; }
    return q.add(...args);
  },
};

module.exports = { analysisQueue: analysisQueueProxy, getAnalysisQueue, getReportQueue };
