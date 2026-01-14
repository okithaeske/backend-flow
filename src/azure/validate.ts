import type { ZodSchema } from "zod";
import { AppError } from "../errors/AppError";

/**
 * Validates data against a Zod schema.
 * Returns the parsed data if valid, or throws an AppError if validation fails.
 *
 * This is the Azure Functions equivalent of the Express `validateBody` middleware.
 * The error format matches exactly, so you get consistent validation errors
 * across Express and Azure Functions.
 *
 * @param schema - A Zod schema to validate against
 * @param data - The data to validate (typically from req.json())
 * @returns The parsed and typed data
 * @throws AppError with code "VALIDATION_FAILED" if validation fails
 *
 * @example
 * ```typescript
 * import { z } from "zod";
 * import { validate, withHandler, created } from "@noteske/backend-flow";
 *
 * const CreateUserSchema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8),
 * });
 *
 * app.http("createUser", {
 *   methods: ["POST"],
 *   handler: withHandler(async (req, context) => {
 *     const body = await req.json();
 *     const data = validate(CreateUserSchema, body);
 *     // data is typed as { email: string, password: string }
 *
 *     const user = await createUser(data);
 *     return { status: 201, jsonBody: created(user) };
 *   })
 * });
 * ```
 *
 * @example Error response format
 * ```json
 * {
 *   "success": false,
 *   "error": {
 *     "code": "VALIDATION_FAILED",
 *     "message": "Validation failed",
 *     "details": {
 *       "fieldErrors": {
 *         "email": ["Invalid email"],
 *         "password": ["String must contain at least 8 character(s)"]
 *       }
 *     }
 *   }
 * }
 * ```
 */
export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new AppError({
      status: 400,
      code: "VALIDATION_FAILED",
      message: "Validation failed",
      details: result.error.flatten(),
      expose: true,
    });
  }

  return result.data;
}
