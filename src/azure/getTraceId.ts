import type { HttpRequest } from "@azure/functions";
import crypto from "node:crypto";

/**
 * Extracts or generates a trace ID from an Azure Function HTTP request.
 *
 * @param req - The Azure Function HTTP request
 * @param headerName - The header name to extract the trace ID from (default: "x-request-id")
 * @returns The trace ID from the request header, or a newly generated UUID
 *
 * @example
 * ```typescript
 * app.http("myFunction", {
 *   handler: async (req, context) => {
 *     const traceId = getTraceId(req);
 *     logger.info({ traceId }, "Processing request");
 *     // ...
 *   }
 * });
 * ```
 */
export function getTraceId(req: HttpRequest, headerName = "x-request-id"): string {
  const headerValue = req.headers.get(headerName.toLowerCase());
  return headerValue || crypto.randomUUID();
}
