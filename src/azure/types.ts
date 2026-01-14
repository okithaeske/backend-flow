import type { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

/**
 * Handler function signature for Azure Functions with the withHandler wrapper.
 */
export type AzureFunctionHandler = (
  req: HttpRequest,
  context: InvocationContext
) => Promise<HttpResponseInit>;

/**
 * Options for the withHandler wrapper.
 */
export interface WithHandlerOptions {
  /**
   * Logger instance for error logging.
   * If provided, errors will be logged before returning the error response.
   */
  logger?: {
    error: (obj: object, msg: string) => void;
  };

  /**
   * Header name to extract the trace ID from.
   * @default "x-request-id"
   */
  traceIdHeader?: string;
}
