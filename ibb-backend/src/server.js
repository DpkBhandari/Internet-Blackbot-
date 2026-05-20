require("dotenv").config();

const http = require("http");
const app = require("./app");
const { connectDB } = require("./config/db");
const { connectRedis } = require("./config/redis");
const { initSocket } = require("./sockets/index");
const { startWorkers } = require("./jobs/workers");
const logger = require("./utils/logger");

// Validate required envs
const required = ["MONGODB_URI"];
for (const key of required) {
  if (!process.env[key]) {
    logger.error(`Missing required env: ${key}`);
    process.exit(1);
  }
}

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

async function start() {
  try {
    await connectDB();
    await connectRedis();
    initSocket(server);
    startWorkers();

    server.listen(PORT, () => {
      logger.info(
        `IBB Backend running on port ${PORT} (${process.env.NODE_ENV || "development"})`,
      );
    });
  } catch (err) {
    logger.error(`Startup failed: ${err.message}`, { stack: err.stack });
    process.exit(1);
  }
}

process.on("unhandledRejection", (reason) =>
  logger.error("Unhandled rejection", { reason }),
);
process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception", { err });
  process.exit(1);
});

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received — shutting down");
  server.close(() => process.exit(0));
});

start();
