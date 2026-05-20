const { Worker } = require('bullmq');
const { getRedis } = require('../config/redis');
const logger = require('../utils/logger');

async function analysisWorker(job) {
  const { analysisId } = job.data;
  logger.info(`Processing analysis job: ${analysisId}`);

  const Analysis = require('../models/Analysis');
  const Research = require('../models/Research');
  const python = require('../services/python.service');
  const { ANALYSIS_STATUS, EVENTS } = require('../config/constants');
  const { emitToUser } = require('../sockets/index');
  const notif = require('../services/notification.service');
  const reportService = require('../services/report.service');

  const analysis = await Analysis.findById(analysisId).populate({ path: 'research', select: '+extractedText title fileName user topic' });
  if (!analysis) { logger.warn(`Analysis not found: ${analysisId}`); return; }

  const research = analysis.research;
  const userId = research?.user || analysis.user;

  try {
    await Analysis.findByIdAndUpdate(analysisId, { status: ANALYSIS_STATUS.PROCESSING });
    await Research.findByIdAndUpdate(research?._id, { status: 'PROCESSING' });

    const text = research?.extractedText || '';
    if (!text.trim()) throw new Error('No extracted text available');

    const result = await python.analyzeText(text, { topic: research?.topic || '', title: research?.title || '' });

    await Analysis.findByIdAndUpdate(analysisId, {
      status: ANALYSIS_STATUS.READY,
      summary: result.summary,
      sentiment: result.sentiment,
      keywords: result.keywords,
      toxicity: result.toxicity,
      claims: result.claims,
      misinformationScore: result.misinformationScore,
      credibilityScore: result.credibilityScore,
      metrics: result.metrics,
    });
    await Research.findByIdAndUpdate(research?._id, { status: 'READY' });

    emitToUser(userId.toString(), EVENTS.ANALYSIS_DONE, { analysisId, researchId: research?._id });

    await notif.create({ userId, title: 'Analysis complete', message: `"${research?.title || research?.fileName}" has been analyzed.`, type: 'success', link: `/app/analysis/${analysisId}` });

    // Queue report generation
    try {
      await reportService.queueReport({ analysisId: analysisId.toString(), userId: userId.toString() });
    } catch (e) {
      logger.warn(`Report queue failed: ${e.message}`);
    }

    logger.info(`Analysis complete: ${analysisId}`);
  } catch (err) {
    logger.error(`Analysis failed [${analysisId}]: ${err.message}`);
    await Analysis.findByIdAndUpdate(analysisId, { status: ANALYSIS_STATUS.FAILED, error: err.message });
    await Research.findByIdAndUpdate(research?._id, { status: 'FAILED' });
    emitToUser(userId?.toString(), EVENTS.ANALYSIS_FAILED, { analysisId, error: err.message });
    await notif.create({ userId, title: 'Analysis failed', message: err.message, type: 'error' }).catch(() => {});
    throw err;
  }
}

function startWorkers() {
  const redis = getRedis();
  if (!redis) {
    logger.warn('Redis unavailable — BullMQ workers not started. Jobs will run synchronously.');
    return;
  }
  const worker = new Worker('analysis', analysisWorker, { connection: redis, concurrency: 2 });
  worker.on('completed', (job) => logger.info(`Job completed: ${job.id}`));
  worker.on('failed', (job, err) => logger.error(`Job failed: ${job?.id} — ${err.message}`));
  logger.info('BullMQ workers started');
}

module.exports = { startWorkers, analysisWorker };
