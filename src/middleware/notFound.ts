/**
 * notFound.ts
 *
 * This middleware handles requests to routes that don't exist in your app.
 * It returns a consistent 404 JSON response instead of Express's default HTML error.
 *
 * IMPORTANT: This should be placed AFTER all your routes but BEFORE the error handler.
 * If a request doesn't match any route, this middleware will catch it.
 */

import type { Request, Response } from "express";
import { fail } from "../responses/response";

/**
 * Middleware that handles 404 Not Found errors for undefined routes.
 * Returns a JSON response with a consistent error format.
 *
 * @example
 * import express from "express";
 * import { notFoundHandler, errorHandler } from "@eske/backend-flow";
 *
 * const app = express();
 *
 * // Your routes
 * app.get("/users", (req, res) => { ... });
 * app.get("/products", (req, res) => { ... });
 *
 * // 404 handler - catches requests that don't match any route
 * app.use(notFoundHandler);
 *
 * // Error handler - must be last
 * app.use(errorHandler());
 *
 * @example
 * // When a user requests GET /nonexistent, they get:
 * // {
 * //   "success": false,
 * //   "error": {
 * //     "code": "NOT_FOUND",
 * //     "message": "Route not found"
 * //   },
 * //   "traceId": "abc-123-xyz"
 * // }
 */
export function notFoundHandler(req: Request, res: Response) {
  // Get the traceId from the request (added by traceId middleware)
  const traceId = (req as any).traceId as string | undefined;

  // Return a 404 response with our standard error format
  res.status(404).json({ ...fail("NOT_FOUND", "Route not found"), traceId });
}
