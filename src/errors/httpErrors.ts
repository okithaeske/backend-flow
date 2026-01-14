/**
 * httpErrors.ts
 *
 * This file provides easy-to-use factory functions for creating common HTTP errors.
 * Instead of manually creating AppError instances, you can use these shortcuts.
 *
 * All errors created here (except internalError) have expose=true by default,
 * meaning their messages will be shown to the client.
 */

import { AppError, type ErrorCode } from "./AppError";

/**
 * Internal helper function that creates an AppError with the given parameters.
 * This is not exported - use the specific error functions below instead.
 *
 * @param status - HTTP status code
 * @param code - Error code for programmatic handling
 * @param message - Human-readable error message
 * @param details - Optional additional error information
 * @param expose - Whether to show message to client (default: true)
 */
function make(
  status: number,
  code: ErrorCode,
  message: string,
  details?: unknown,
  expose = true
) {
  return new AppError({ status, code, message, details, expose });
}

/**
 * Creates a 400 Bad Request error.
 * Use when the client sends invalid or malformed data.
 *
 * @example
 * throw badRequest("Invalid email format");
 * throw badRequest("Missing required field", { field: "username" });
 */
export const badRequest = (message = "Bad request", details?: unknown) =>
  make(400, "BAD_REQUEST", message, details);

/**
 * Creates a 401 Unauthorized error.
 * Use when the user is not authenticated (not logged in, invalid token, etc.).
 *
 * @example
 * throw unauthorized("Please log in to continue");
 * throw unauthorized("Invalid or expired token");
 */
export const unauthorized = (message = "Unauthorized", details?: unknown) =>
  make(401, "UNAUTHORIZED", message, details);

/**
 * Creates a 403 Forbidden error.
 * Use when the user is authenticated but doesn't have permission for this action.
 *
 * @example
 * throw forbidden("You don't have permission to delete this post");
 * throw forbidden("Admin access required");
 */
export const forbidden = (message = "Forbidden", details?: unknown) =>
  make(403, "FORBIDDEN", message, details);

/**
 * Creates a 404 Not Found error.
 * Use when the requested resource doesn't exist.
 *
 * @example
 * throw notFound("User not found");
 * throw notFound("Product not found", { productId: 123 });
 */
export const notFound = (message = "Not found", details?: unknown) =>
  make(404, "NOT_FOUND", message, details);

/**
 * Creates a 409 Conflict error.
 * Use when the action conflicts with the current state (e.g., duplicate entries).
 *
 * @example
 * throw conflict("Email already registered");
 * throw conflict("Username is already taken");
 */
export const conflict = (message = "Conflict", details?: unknown) =>
  make(409, "CONFLICT", message, details);

/**
 * Creates a 429 Too Many Requests error.
 * Use when the user has exceeded the rate limit.
 *
 * @example
 * throw tooManyRequests("Too many login attempts, try again later");
 * throw tooManyRequests("Rate limit exceeded", { retryAfter: 60 });
 */
export const tooManyRequests = (
  message = "Too many requests",
  details?: unknown
) => make(429, "TOO_MANY_REQUESTS", message, details);

/**
 * Creates a 500 Internal Server Error.
 * Use for unexpected server errors (database failures, etc.).
 *
 * IMPORTANT: This error has expose=false, so the actual message will NOT be
 * shown to the client. They will see "Internal server error" instead.
 * This is for security - we don't want to leak internal details.
 *
 * @example
 * throw internalError("Database connection failed");  // Client sees "Internal server error"
 * throw internalError("Failed to process payment", { orderId: 123 });
 */
export const internalError = (
  message = "Internal server error",
  details?: unknown
) =>
  // expose=false so we don't leak internal details to the client
  make(500, "INTERNAL_ERROR", message, details, false);
