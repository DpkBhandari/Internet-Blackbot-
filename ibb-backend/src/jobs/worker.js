require('dotenv').config();
const { Worker } = require('bullmq');
const { connection } = require('./queues');
const { connectMongo } = require('../config/db');
const { QUEUES } = require('../config/constants');
const analysis = require('../services/analysis.service');
const report = require('../services/report.service');
const logger = require('../utils/logger');

(async () => {
  await connectMongo();

  new Worker(QUEUES.ANALYSIS, async (job) => analysis.runAnalysis(job.data), { connection, concurrency: 2 })
    .on('failed', (job, err) => logger.error(`analysis ${job?.id} failed`, err));

  new Worker(QUEUES.REPORT, async (job) => report.generateReport(job.data), { connection, concurrency: 2 })
    .on('failed', (job, err) => logger.error(`report ${job?.id} failed`, err));

  logger.info('Workers started');
})();
