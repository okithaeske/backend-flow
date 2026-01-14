/**
 * logger.ts
 *
 * This file provides a factory function to create a Pino logger instance.
 * Pino is a fast, low-overhead JSON logger perfect for production Node.js apps.
 *
 * WHY USE PINO?
 * - Super fast: Pino is one of the fastest Node.js loggers
 * - JSON output: Easy to parse and send to log aggregation services
 * - Low overhead: Won't slow down your app
 * - Great for production: Works well with tools like Elasticsearch, Datadog, etc.
 *
 * LOG LEVELS (from lowest to highest priority):
 * - trace: Very detailed debugging info (usually off in production)
 * - debug: Debugging information
 * - info: General information about app operation (default)
 * - warn: Warning messages (something unexpected but not critical)
 * - error: Error messages (something went wrong)
 * - fatal: Critical errors that cause the app to crash
 *
 * EXAMPLE LOG OUTPUT:
 * {"level":30,"time":1234567890,"name":"my-api","msg":"Server started on port 3000"}
 */

import pino, { type Logger } from "pino";

/**
 * Creates a configured Pino logger instance.
 *
 * @param opts - Optional configuration
 * @param opts.level - Log level: "trace", "debug", "info", "warn", "error", "fatal"
 *                     Defaults to LOG_LEVEL env variable, or "info" if not set
 * @param opts.name - Logger name (appears in log output), defaults to "backend-flow"
 * @returns A configured Pino Logger instance
 *
 * @example
 * // Basic usage with defaults
 * const logger = createLogger();
 * logger.info("Server started");
 * logger.error({ err }, "Database connection failed");
 *
 * @example
 * // Custom configuration
 * const logger = createLogger({
 *   name: "my-api",
 *   level: "debug"  // Show debug messages
 * });
 *
 * @example
 * // Use with environment variable
 * // Set LOG_LEVEL=debug in your .env file
 * const logger = createLogger({ name: "my-api" });
 *
 * @example
 * // Use with requestLogger middleware
 * import { createLogger, requestLogger } from "@eske/backend-flow";
 *
 * const logger = createLogger({ name: "api" });
 * app.use(requestLogger(logger));
 */
export function createLogger(opts?: { level?: string; name?: string }): Logger {
  return pino({
    // Log level priority: 1) explicit option, 2) env variable, 3) "info" default
    level: opts?.level ?? process.env.LOG_LEVEL ?? "info",
    // Logger name appears in output to identify which service/component logged
    name: opts?.name ?? "backend-flow",
  });
}
