/**
 * validateBody.ts
 *
 * This middleware validates the request body against a Zod schema.
 * If validation fails, it returns a 400 error with details about what went wrong.
 *
 * WHY USE ZOD VALIDATION?
 * - Type safety: Your route handler receives properly typed data
 * - Security: Rejects invalid/malicious input before it reaches your code
 * - Helpful errors: Users get clear messages about what's wrong with their input
 * - Data transformation: Zod can also transform data (trim strings, parse dates, etc.)
 *
 * EXAMPLE ERROR RESPONSE:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "VALIDATION_FAILED",
 *     "message": "Validation failed",
 *     "details": {
 *       "fieldErrors": {
 *         "email": ["Invalid email format"],
 *         "age": ["Expected number, received string"]
 *       }
 *     }
 *   }
 * }
 */

import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "../errors/AppError";

/**
 * Creates a middleware that validates req.body against a Zod schema.
 * If validation passes, req.body is replaced with the parsed (and typed) data.
 * If validation fails, a 400 VALIDATION_FAILED error is passed to the error handler.
 *
 * @param schema - A Zod schema to validate against
 * @returns Express middleware function
 *
 * @example
 * import express from "express";
 * import { z } from "zod";
 * import { validateBody, asyncHandler } from "@eske/backend-flow";
 *
 * const app = express();
 * app.use(express.json());  // Don't forget this!
 *
 * // Define your schema
 * const CreateUserSchema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8),
 *   name: z.string().optional(),
 * });
 *
 * // Use validateBody middleware before your route handler
 * app.post("/users",
 *   validateBody(CreateUserSchema),
 *   asyncHandler(async (req, res) => {
 *     // req.body is now typed as { email: string, password: string, name?: string }
 *     const user = await createUser(req.body);
 *     res.json({ success: true, data: user });
 *   })
 * );
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    // safeParse returns { success: true, data } or { success: false, error }
    // It never throws, so we can handle errors gracefully
    const result = schema.safeParse(req.body);

    // If validation failed, pass a VALIDATION_FAILED error to the error handler
    if (!result.success) {
      return next(
        new AppError({
          status: 400,
          code: "VALIDATION_FAILED",
          message: "Validation failed",
          // flatten() gives us a nice object with fieldErrors for each invalid field
          details: result.error.flatten(),
          // expose=true so the validation details are shown to the client
          expose: true,
        })
      );
    }

    // Validation passed! Replace req.body with the parsed data
    // This ensures we work with Zod's transformed/cleaned data,
    // not the raw input (e.g., trimmed strings, parsed dates, etc.)
    req.body = result.data as any;

    // Continue to the next middleware/route handler
    next();
  };
}
