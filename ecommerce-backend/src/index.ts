import { app } from "./app";
import { env } from "./config/env";
import { pool } from "./config/db";
import { logger } from "./config/logger";

// app.ts holds the Express app (so tests import it without starting a server).
// This file's job: start listening + shut down cleanly.
const server = app.listen(env.PORT, () => {
  logger.info(`Server running on http://localhost:${env.PORT}`);
});

// Graceful shutdown: stop accepting new connections, let in-flight requests
// finish, close the DB pool, then exit. Triggered by Docker/k8s stop, Ctrl+C,
// and deploys — without this you drop requests and leak DB connections.
async function shutdown(signal: string) {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(async () => {
    await pool.end();
    logger.info("HTTP server + DB pool closed. Bye.");
    process.exit(0);
  });

  // Safety net: if something hangs, force-exit after 10s.
  setTimeout(() => {
    logger.error("Could not close in time — forcing shutdown");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
