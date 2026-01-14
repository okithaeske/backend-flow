import type { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { AppError } from "../errors/AppError";
import { fail } from "../responses/response";
import { getTraceId } from "./getTraceId";
import type { AzureFunctionHandler, WithHandlerOptions } from "./types";

/**
 * Wraps an Azure Function handler with error handling, logging, and tracing.
 *
 * This is the Azure Functions equivalent of combining Express's asyncHandler + errorHandler.
 * It provides:
 * - Automatic error catching and conversion to HTTP responses
 * - AppError detection with proper status code mapping
 * - Internal error hiding (respects the `expose` flag for security)
 * - Optional logger integration for error logging
 * - Trace ID extraction from request headers
 *
 * @param handler - The Azure Function handler to wrap
 * @param options - Optional configuration (logger, trace ID header name)
 * @returns A wrapped handler with error handling
 *
 * @example
 * ```typescript
 * import { app } from "@azure/functions";
 * import { withHandler, ok, notFound, createLogger } from "@noteske/backend-flow";
 *
 * const logger = createLogger({ name: "my-function" });
 *
 * app.http("getUser", {
 *   methods: ["GET"],
 *   handler: withHandler(async (req, context) => {
 *     const userId = req.params.id;
 *     const user = await findUser(userId);
 *
 *     if (!user) {
 *       throw notFound("User not found");
 *     }
 *
 *     return { status: 200, jsonBody: ok(user) };
 *   }, { logger })
 * });
 * ```
 *
 * @example Error response format (AppError with expose=true)
 * ```json
 * {
 *   "success": false,
 *   "error": {
 *     "code": "NOT_FOUND",
 *     "message": "User not found"
 *   },
 *   "traceId": "abc-123"
 * }
 * ```
 *
 * @example Error response format (unknown error or expose=false)
 * ```json
 * {
 *   "success": false,
 *   "error": {
 *     "code": "INTERNAL_ERROR",
 *     "message": "Internal server error"
 *   },
 *   "traceId": "abc-123"
 * }
 * ```
 */
export function withHandler(
  handler: AzureFunctionHandler,
  options?: WithHandlerOptions
): (req: HttpRequest, context: InvocationContext) => Promise<HttpResponseInit> {
  const { logger, traceIdHeader = "x-request-id" } = options ?? {};

  return async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const traceId = getTraceId(req, traceIdHeader);

    try {
      const response = await handler(req, context);

      // Add trace ID header to successful responses
      return {
        ...response,
        headers: {
          ...response.headers,
          "x-trace-id": traceId,
        },
      };
    } catch (err) {
      // Handle known AppError errors
      if (err instanceof AppError) {
        if (logger) {
          logger.error(
            { traceId, code: err.code, status: err.status, details: err.details },
            err.message
          );
        }

        const safeMessage = err.expose ? err.message : "Internal server error";

        return {
          status: err.status,
          headers: { "x-trace-id": traceId },
          jsonBody: {
            ...fail(err.code, safeMessage, err.expose ? err.details : undefined),
            traceId,
          },
        };
      }

      // Unknown error - log and return generic 500
      if (logger) {
        logger.error({ traceId, err }, "Unhandled error");
      }

      return {
        status: 500,
        headers: { "x-trace-id": traceId },
        jsonBody: {
          ...fail("INTERNAL_ERROR", "Internal server error"),
          traceId,
        },
      };
    }
  };
}
