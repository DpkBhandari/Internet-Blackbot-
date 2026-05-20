const { Redis } = require("ioredis");
const logger = require("../utils/logger");

let redis = null;

async function connectRedis() {
  const url = process.env.REDIS_URL;
  if (!url) {
    logger.warn("REDIS_URL not set — Redis features disabled");
    return;
  }
  try {
    redis = new Redis(url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      lazyConnect: true,
    });
    await redis.connect();
    logger.info("Redis connected");
  } catch (err) {
    logger.warn(
      `Redis connection failed: ${err.message} — continuing without Redis`,
    );
    redis = null;
  }
}

function getRedis() {
  return redis;
}

module.exports = { connectRedis, getRedis };
