/**
 * response.ts
 *
 * This file defines the standard API response format used throughout the application.
 * All API endpoints should return responses in this format for consistency.
 *
 * WHY STANDARDIZE RESPONSES?
 * - Frontend can easily check response.success to determine if the request worked
 * - Consistent error format makes error handling easier on the client side
 * - Meta field allows pagination info, counts, etc. without polluting the main data
 * - traceId helps with debugging and support requests
 *
 * SUCCESS RESPONSE FORMAT:
 * {
 *   "success": true,
 *   "data": { ... },          // The actual response data
 *   "meta": { ... },          // Optional: pagination, counts, etc.
 *   "traceId": "abc-123"      // Optional: request trace ID
 * }
 *
 * ERROR RESPONSE FORMAT:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "NOT_FOUND",    // Machine-readable error code
 *     "message": "User not found",  // Human-readable message
 *     "details": { ... }      // Optional: additional error info
 *   },
 *   "traceId": "abc-123"
 * }
 */

/**
 * Type for successful API responses.
 * Generic type T represents the shape of the data being returned.
 *
 * @example
 * // A successful user response
 * const response: ApiOk<User> = {
 *   success: true,
 *   data: { id: 1, name: "John", email: "john@example.com" }
 * };
 *
 * @example
 * // A paginated list response
 * const response: ApiOk<User[]> = {
 *   success: true,
 *   data: [{ id: 1, name: "John" }, { id: 2, name: "Jane" }],
 *   meta: { page: 1, totalPages: 10, totalItems: 100 }
 * };
 */
export type ApiOk<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
  traceId?: string;
};

/**
 * Type for failed/error API responses.
 * Always includes an error object with code and message.
 */
export type ApiFail = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  traceId?: string;
};

/**
 * Creates a success response (HTTP 200 OK).
 * Use this for most successful requests (GET, PUT, PATCH).
 *
 * @param data - The data to return to the client
 * @param meta - Optional metadata (pagination info, counts, etc.)
 *
 * @example
 * app.get("/users/:id", asyncHandler(async (req, res) => {
 *   const user = await getUserById(req.params.id);
 *   res.json(ok(user));
 * }));
 *
 * @example
 * // With pagination metadata
 * app.get("/users", asyncHandler(async (req, res) => {
 *   const { users, total } = await getUsers(req.query.page);
 *   res.json(ok(users, { page: req.query.page, total }));
 * }));
 */
export function ok<T>(data: T, meta?: Record<string, unknown>): ApiOk<T> {
  return { success: true, data, meta };
}

/**
 * Creates a success response for resource creation (HTTP 201 Created).
 * Use this after successfully creating a new resource (POST requests).
 *
 * @param data - The newly created resource
 * @param meta - Optional metadata
 *
 * @example
 * app.post("/users", asyncHandler(async (req, res) => {
 *   const user = await createUser(req.body);
 *   res.status(201).json(created(user));
 * }));
 */
export function created<T>(data: T, meta?: Record<string, unknown>): ApiOk<T> {
  return { success: true, data, meta };
}

/**
 * Creates a success response with no content (HTTP 204 No Content).
 * Use this for successful DELETE requests or updates that don't return data.
 *
 * @example
 * app.delete("/users/:id", asyncHandler(async (req, res) => {
 *   await deleteUser(req.params.id);
 *   res.status(204).json(noContent());
 * }));
 */
export function noContent(): { success: true } {
  return { success: true };
}

/**
 * Creates an error response.
 * Usually you don't call this directly - use httpErrors instead,
 * and the errorHandler middleware will format the response.
 *
 * @param code - Machine-readable error code (e.g., "NOT_FOUND", "VALIDATION_FAILED")
 * @param message - Human-readable error message
 * @param details - Optional additional error information
 *
 * @example
 * // This is typically used internally by errorHandler
 * const errorResponse = fail("NOT_FOUND", "User not found", { userId: 123 });
 */
export function fail(
  code: string,
  message: string,
  details?: unknown
): ApiFail {
  return { success: false, error: { code, message, details } };
}
