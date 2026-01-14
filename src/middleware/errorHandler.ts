/**
 * errorHandler.ts
 *
 * This is the global error handling middleware for Express.
 * It catches ALL errors that occur in your app and returns a consistent JSON response.
 *
 * IMPORTANT: This middleware MUST be registered LAST (after all your routes).
 * Express only calls error handlers when next(error) is called or an error is thrown.
 *
 * HOW IT WORKS:
 * 1. If the error is an AppError (our custom error), it returns the appropriate status
 *    and message based on the error's expose flag.
 * 2. If the error is something unexpected (e.g., a bug), it returns a generic 500 error
 *    and hides the actual error details from the client for security.
 */

import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { fail } from "../responses/response";
import type { Logger } from "pino";

/**
 * Creates an error handling middleware for Express.
 * This should be the LAST middleware in your Express app.
 *
 * @param logger - Optional Pino logger for logging errors (recommended for production)
 * @returns Express error handling middleware
 *
 * @example
 * import express from "express";
 * import { errorHandler, createLogger } from "@eske/backend-flow";
 *
 * const app = express();
 * const logger = createLogger();
 *
 * // ... your routes here ...
 *
 * // Error handler MUST be last!
 * app.use(errorHandler(logger));
 */
export function errorHandler(logger?: Logger) {
  // Express error handlers have 4 parameters: (err, req, res, next)
  // The _next parameter is unused but required for Express to recognize this as an error handler
  return (err: unknown, req: Request, res: Response, _next: NextFunction) => {
    // Get the traceId from the request (added by traceId middleware)
    // This helps correlate errors with specific requests in logs
    const traceId = (req as any).traceId as string | undefined;

    // Check if this is a known error (AppError) that we threw intentionally
    if (err instanceof AppError) {
      // Log the error with all its details for debugging
      if (logger) {
        logger.warn(
          { traceId, code: err.code, status: err.status, details: err.details },
          err.message
        );
      }

      // Only show the actual message if expose=true
      // Otherwise, show a generic message to hide internal details
      const safeMessage = err.expose ? err.message : "Internal server error";

      // Return the error response with the appropriate status code
      return res
        .status(err.status)
        .json({
          ...fail(err.code, safeMessage, err.expose ? err.details : undefined),
          traceId,
        });
    }

    // If we get here, it's an UNKNOWN error (probably a bug in our code)
    // Log it as an error (more severe than warn) so we can investigate
    if (logger) logger.error({ traceId, err }, "Unhandled error");

    // NEVER expose unknown error details to the client - could leak sensitive info
    // Always return a generic 500 error
    return res
      .status(500)
      .json({ ...fail("INTERNAL_ERROR", "Internal server error"), traceId });
  };
}
