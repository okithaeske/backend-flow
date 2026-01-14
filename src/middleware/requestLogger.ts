/**
 * requestLogger.ts
 *
 * This middleware logs every HTTP request to your Express app.
 * It captures the method, path, status code, and how long the request took.
 *
 * WHY IS THIS USEFUL?
 * - Debug slow endpoints by checking durationMs
 * - Monitor traffic patterns (which endpoints are hit most)
 * - Track down issues using the traceId
 * - See error rates by status code
 *
 * EXAMPLE LOG OUTPUT (JSON format from Pino):
 * {
 *   "level": "info",
 *   "traceId": "abc-123-xyz",
 *   "method": "GET",
 *   "path": "/api/users",
 *   "status": 200,
 *   "durationMs": 45,
 *   "msg": "request"
 * }
 */

import type { Request, Response, NextFunction } from "express";
import type { Logger } from "pino";

/**
 * Creates a middleware that logs HTTP request details.
 * Should be used AFTER traceId middleware so the trace ID is available.
 *
 * @param logger - A Pino logger instance (use createLogger() to create one)
 * @returns Express middleware function
 *
 * @example
 * import express from "express";
 * import { traceId, requestLogger, createLogger } from "@eske/backend-flow";
 *
 * const app = express();
 * const logger = createLogger({ name: "my-api" });
 *
 * // Order matters! traceId should come first
 * app.use(traceId());
 * app.use(requestLogger(logger));
 *
 * // Now every request will be logged with timing info
 */
export function requestLogger(logger: Logger) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Record the start time so we can calculate request duration
    const start = Date.now();

    // Get the traceId (added by traceId middleware) for log correlation
    const traceId = (req as any).traceId as string | undefined;

    // Listen for the response to finish, then log the request details
    // "finish" event fires when the response has been fully sent to the client
    res.on("finish", () => {
      // Calculate how long the request took
      const ms = Date.now() - start;

      // Log the request with all relevant details
      logger.info(
        {
          traceId,                    // For correlating with other logs
          method: req.method,          // GET, POST, PUT, DELETE, etc.
          path: req.originalUrl,       // The full URL path (including query string)
          status: res.statusCode,      // HTTP status code (200, 404, 500, etc.)
          durationMs: ms,              // How long the request took in milliseconds
        },
        "request"
      );
    });

    // Continue to the next middleware (don't block the request)
    next();
  };
}
