/**
 * Azure Functions utilities for backend-flow.
 *
 * These utilities provide the same error handling, validation, and response patterns
 * as the Express middleware, but adapted for Azure Functions' request/response model.
 *
 * @example
 * ```typescript
 * import { app } from "@azure/functions";
 * import {
 *   withHandler,
 *   validate,
 *   getTraceId,
 *   ok,
 *   created,
 *   notFound,
 *   createLogger
 * } from "@noteske/backend-flow";
 * import { z } from "zod";
 *
 * const logger = createLogger({ name: "my-api" });
 *
 * const CreateUserSchema = z.object({
 *   email: z.string().email(),
 *   name: z.string(),
 * });
 *
 * app.http("createUser", {
 *   methods: ["POST"],
 *   handler: withHandler(async (req, context) => {
 *     const body = await req.json();
 *     const data = validate(CreateUserSchema, body);
 *
 *     const user = await createUser(data);
 *     return { status: 201, jsonBody: created(user) };
 *   }, { logger })
 * });
 * ```
 */

// Types
export type { AzureFunctionHandler, WithHandlerOptions } from "./types";

// Utilities
export { getTraceId } from "./getTraceId";
export { validate } from "./validate";
export { withHandler } from "./withHandler";
