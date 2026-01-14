/**
 * ErrorCode represents all possible error types in the application.
 * Each code maps to a specific HTTP status and error scenario:
 *
 * - BAD_REQUEST (400): Client sent invalid data or malformed request
 * - UNAUTHORIZED (401): User is not logged in or token is invalid
 * - FORBIDDEN (403): User is logged in but doesn't have permission
 * - NOT_FOUND (404): The requested resource doesn't exist
 * - CONFLICT (409): Action conflicts with current state (e.g., duplicate email)
 * - TOO_MANY_REQUESTS (429): Rate limit exceeded
 * - VALIDATION_FAILED (400): Request body failed schema validation
 * - INTERNAL_ERROR (500): Something went wrong on the server
 */
export type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "TOO_MANY_REQUESTS"
  | "VALIDATION_FAILED"
  | "INTERNAL_ERROR";

/**
 * AppError is a custom error class that extends the built-in Error.
 * It adds extra properties to make error handling more structured and secure.
 *
 * @example
 * // Throwing an AppError when a user is not found
 * throw new AppError({
 *   message: "User not found",
 *   status: 404,
 *   code: "NOT_FOUND",
 *   expose: true  // Safe to show this message to the client
 * });
 *
 * @example
 * // Throwing an internal error (message hidden from client)
 * throw new AppError({
 *   message: "Database connection failed",  // This won't be shown to client
 *   status: 500,
 *   code: "INTERNAL_ERROR",
 *   details: { dbError: err },  // For logging purposes only
 *   expose: false  // Hide the real message from client
 * });
 */
export class AppError extends Error {
  /** HTTP status code to return (e.g., 400, 401, 404, 500) */
  public readonly status: number;

  /** Error code for client-side error handling (e.g., "NOT_FOUND", "UNAUTHORIZED") */
  public readonly code: ErrorCode;

  /** Additional error details (useful for validation errors or debugging) */
  public readonly details?: unknown;

  /**
   * If true, the error message is safe to show to the client.
   * If false, a generic "Internal server error" message will be shown instead.
   * This prevents leaking sensitive information like database errors to users.
   */
  public readonly expose: boolean;

  /**
   * Creates a new AppError instance.
   *
   * @param opts - Configuration object for the error
   * @param opts.message - Human-readable error description
   * @param opts.status - HTTP status code (e.g., 400, 404, 500)
   * @param opts.code - Error code for programmatic handling
   * @param opts.details - Optional additional error information
   * @param opts.expose - Whether to show the message to clients (defaults to false for security)
   */
  constructor(opts: {
    message: string;
    status: number;
    code: ErrorCode;
    details?: unknown;
    expose?: boolean;
  }) {
    // Call the parent Error constructor with the message
    super(opts.message);

    // Set the error name for stack traces
    this.name = "AppError";

    // Store all the additional properties
    this.status = opts.status;
    this.code = opts.code;
    this.details = opts.details;

    // Default to false (safe) - don't expose error messages unless explicitly told to
    this.expose = opts.expose ?? false;
  }
}
