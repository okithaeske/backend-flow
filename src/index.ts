/**
 * @noteske/backend-flow
 *
 * An opinionated backend toolkit for Node.js applications.
 * Provides standardized patterns for error handling, responses, validation, tracing, and logging.
 * Works with both Express and Azure Functions.
 *
 * This is the main entry point - all exports are re-exported from here
 * so you can import everything from a single package:
 *
 * @example Express
 * import {
 *   // Error handling
 *   AppError,
 *   badRequest,
 *   unauthorized,
 *   forbidden,
 *   notFound,
 *   conflict,
 *   tooManyRequests,
 *   internalError,
 *
 *   // Response helpers
 *   ok,
 *   created,
 *   noContent,
 *   fail,
 *
 *   // Express Middleware
 *   asyncHandler,
 *   traceId,
 *   validateBody,
 *   notFoundHandler,
 *   errorHandler,
 *   requestLogger,
 *
 *   // Logger
 *   createLogger,
 * } from "@noteske/backend-flow";
 *
 * @example Azure Functions
 * import {
 *   // Error handling
 *   AppError,
 *   notFound,
 *   badRequest,
 *
 *   // Response helpers
 *   ok,
 *   created,
 *   fail,
 *
 *   // Azure Functions utilities
 *   withHandler,
 *   validate,
 *   getTraceId,
 *
 *   // Logger
 *   createLogger,
 * } from "@noteske/backend-flow";
 */

// ============================================================================
// ERROR HANDLING
// ============================================================================
// AppError: Custom error class with status codes and error codes
// httpErrors: Factory functions (badRequest, notFound, etc.) for common errors
export * from "./errors/AppError";
export * from "./errors/httpErrors";

// ============================================================================
// RESPONSE HELPERS
// ============================================================================
// ok, created, noContent, fail: Functions to create standardized API responses
export * from "./responses/response";

// ============================================================================
// MIDDLEWARE
// ============================================================================
// asyncHandler: Wraps async route handlers to catch errors
export * from "./middleware/asyncHandler";

// traceId: Adds unique request IDs for tracking/debugging
export * from "./middleware/traceId";

// validateBody: Validates request body against Zod schemas
export * from "./middleware/validateBody";

// notFoundHandler: Returns 404 for undefined routes
export * from "./middleware/notFound";

// errorHandler: Global error handling middleware (use last!)
export * from "./middleware/errorHandler";

// requestLogger: Logs HTTP requests with timing info
export * from "./middleware/requestLogger";

// ============================================================================
// LOGGER
// ============================================================================
// createLogger: Creates a configured Pino logger instance
export * from "./logger/logger";

// ============================================================================
// AZURE FUNCTIONS
// ============================================================================
// withHandler: Wraps Azure Function handlers with error handling and tracing
// validate: Validates data against Zod schemas (throws AppError on failure)
// getTraceId: Extracts or generates trace ID from Azure Function requests
export * from "./azure";
