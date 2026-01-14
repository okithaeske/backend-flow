/**
 * traceId.ts
 *
 * This middleware adds request tracing to your Express app.
 * Each request gets a unique ID that follows it through the entire lifecycle.
 *
 * WHY IS THIS USEFUL?
 * When debugging issues in production, you need to track a specific request
 * through your logs. The traceId lets you filter logs to see everything that
 * happened during one user's request.
 *
 * HOW IT WORKS:
 * 1. If the client sends an "x-request-id" header, we use that ID (useful for
 *    tracking requests across multiple services/microservices)
 * 2. If no header is provided, we generate a new UUID
 * 3. The ID is attached to req.traceId and sent back in "x-trace-id" response header
 */

import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";

/**
 * TypeScript declaration to add traceId to Express Request type.
 * This allows you to access req.traceId in your route handlers with full type safety.
 */
declare global {
  namespace Express {
    interface Request {
      traceId?: string;
    }
  }
}

/**
 * Creates a middleware that adds a unique trace ID to each request.
 * The trace ID can be used to track requests through logs and error messages.
 *
 * @param headerName - The header to check for an existing trace ID (default: "x-request-id")
 * @returns Express middleware function
 *
 * @example
 * import express from "express";
 * import { traceId } from "@eske/backend-flow";
 *
 * const app = express();
 *
 * // Add traceId middleware FIRST (before other middleware)
 * app.use(traceId());
 *
 * // Now req.traceId is available in all routes
 * app.get("/users", (req, res) => {
 *   console.log("Processing request:", req.traceId);
 *   res.json({ users: [] });
 * });
 *
 * @example
 * // Client can send their own trace ID for cross-service tracking
 * // Request: GET /api/users with header "x-request-id: my-custom-id"
 * // Response will include header "x-trace-id: my-custom-id"
 */
export function traceId(headerName = "x-request-id") {
  // Normalize header name to lowercase (HTTP headers are case-insensitive)
  const normalized = headerName.toLowerCase();

  return (req: Request, res: Response, next: NextFunction) => {
    // Check if the client sent a trace ID in the request headers
    const incoming = req.headers[normalized];

    // Use the incoming ID if it exists and is a non-empty string,
    // otherwise generate a new UUID
    const id =
      (typeof incoming === "string" && incoming.trim()) || crypto.randomUUID();

    // Attach the trace ID to the request object so other middleware/routes can use it
    req.traceId = id;

    // Send the trace ID back in the response headers so the client knows it
    res.setHeader("x-trace-id", id);

    // Continue to the next middleware
    next();
  };
}
