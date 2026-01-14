# @eske/backend-flow

An opinionated backend toolkit for Node.js/Express applications. Provides standardized patterns for error handling, API responses, request validation, request tracing, and logging.

## Why Use This?

Building a backend API? You'll need to handle:
- **Errors** - What format should error responses be? How do you hide internal errors?
- **Responses** - How do you ensure all API responses are consistent?
- **Validation** - How do you validate request bodies and return helpful errors?
- **Tracing** - How do you track a request through your logs for debugging?
- **Logging** - How do you log requests and errors in a structured way?

This package provides battle-tested solutions for all of these, so you can focus on building features.

## Installation

```bash
npm install @eske/backend-flow
```

## Quick Start

Here's a complete Express app using all the features:

```typescript
import express from "express";
import { z } from "zod";
import {
  // Middleware
  traceId,
  requestLogger,
  validateBody,
  asyncHandler,
  notFoundHandler,
  errorHandler,
  // Errors
  notFound,
  unauthorized,
  // Responses
  ok,
  created,
  // Logger
  createLogger,
} from "@eske/backend-flow";

const app = express();
const logger = createLogger({ name: "my-api" });

// Parse JSON bodies
app.use(express.json());

// Add tracing and logging (order matters!)
app.use(traceId());
app.use(requestLogger(logger));

// Define a validation schema
const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

// Routes
app.get("/users/:id", asyncHandler(async (req, res) => {
  const user = await findUser(req.params.id);
  if (!user) {
    throw notFound("User not found");
  }
  res.json(ok(user));
}));

app.post("/users", validateBody(CreateUserSchema), asyncHandler(async (req, res) => {
  // req.body is now typed and validated!
  const user = await createUser(req.body);
  res.status(201).json(created(user));
}));

// Handle 404s for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last!)
app.use(errorHandler(logger));

app.listen(3000, () => {
  logger.info("Server running on port 3000");
});
```

## Features

### Error Handling

Create consistent, secure errors with one line:

```typescript
import { badRequest, unauthorized, forbidden, notFound, conflict, tooManyRequests, internalError } from "@eske/backend-flow";

// 400 Bad Request
throw badRequest("Invalid email format");

// 401 Unauthorized
throw unauthorized("Please log in");

// 403 Forbidden
throw forbidden("Admin access required");

// 404 Not Found
throw notFound("User not found");

// 409 Conflict
throw conflict("Email already registered");

// 429 Too Many Requests
throw tooManyRequests("Rate limit exceeded");

// 500 Internal Server Error (message hidden from client!)
throw internalError("Database connection failed");
```

All errors support optional details:
```typescript
throw badRequest("Validation failed", { field: "email", issue: "invalid format" });
```

### Custom Errors

For more control, create AppError instances directly:

```typescript
import { AppError } from "@eske/backend-flow";

throw new AppError({
  status: 402,
  code: "PAYMENT_REQUIRED",
  message: "Subscription expired",
  details: { plan: "pro", expiredAt: "2024-01-01" },
  expose: true,  // Show message to client
});
```

### API Responses

All responses follow a consistent format:

```typescript
import { ok, created, noContent, fail } from "@eske/backend-flow";

// Success response
res.json(ok({ id: 1, name: "John" }));
// { "success": true, "data": { "id": 1, "name": "John" } }

// Success with metadata (pagination, etc.)
res.json(ok(users, { page: 1, total: 100 }));
// { "success": true, "data": [...], "meta": { "page": 1, "total": 100 } }

// Created response (201)
res.status(201).json(created(newUser));

// No content response (204)
res.status(204).json(noContent());

// Error response (usually handled by errorHandler)
res.status(404).json(fail("NOT_FOUND", "User not found"));
// { "success": false, "error": { "code": "NOT_FOUND", "message": "User not found" } }
```

### Request Validation

Validate request bodies with Zod schemas:

```typescript
import { z } from "zod";
import { validateBody } from "@eske/backend-flow";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  rememberMe: z.boolean().optional(),
});

app.post("/login", validateBody(LoginSchema), (req, res) => {
  // req.body is typed as { email: string, password: string, rememberMe?: boolean }
  // If validation fails, client gets a 400 with detailed errors
});
```

Validation error response:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Validation failed",
    "details": {
      "fieldErrors": {
        "email": ["Invalid email"],
        "password": ["String must contain at least 8 character(s)"]
      }
    }
  }
}
```

### Request Tracing

Track requests through your system for debugging:

```typescript
import { traceId } from "@eske/backend-flow";

app.use(traceId());

// Now every request has req.traceId
// Response includes x-trace-id header
// All errors include traceId in the response
```

Clients can send their own trace ID for cross-service tracking:
```bash
curl -H "x-request-id: my-trace-123" http://localhost:3000/api/users
```

### Request Logging

Log every request with timing information:

```typescript
import { createLogger, requestLogger } from "@eske/backend-flow";

const logger = createLogger({ name: "my-api" });
app.use(requestLogger(logger));
```

Log output:
```json
{
  "level": "info",
  "time": 1234567890,
  "name": "my-api",
  "traceId": "abc-123",
  "method": "GET",
  "path": "/api/users",
  "status": 200,
  "durationMs": 45,
  "msg": "request"
}
```

### Async Handler

Wrap async routes to catch errors automatically:

```typescript
import { asyncHandler } from "@eske/backend-flow";

// Without asyncHandler (dangerous!)
app.get("/users", async (req, res) => {
  const users = await db.getUsers(); // If this throws, request hangs!
  res.json(users);
});

// With asyncHandler (safe!)
app.get("/users", asyncHandler(async (req, res) => {
  const users = await db.getUsers(); // Errors are caught and passed to errorHandler
  res.json(ok(users));
}));
```

### Logger

Create a configured Pino logger:

```typescript
import { createLogger } from "@eske/backend-flow";

// Basic usage
const logger = createLogger();

// With options
const logger = createLogger({
  name: "my-api",
  level: "debug",  // or use LOG_LEVEL env variable
});

// Usage
logger.info("Server started");
logger.warn({ userId: 123 }, "Login failed");
logger.error({ err }, "Database error");
```

## Middleware Order

The order of middleware matters! Here's the recommended setup:

```typescript
const app = express();

// 1. Body parsing
app.use(express.json());

// 2. Tracing (should be first to track the whole request)
app.use(traceId());

// 3. Request logging
app.use(requestLogger(logger));

// 4. Your routes with validation
app.post("/users", validateBody(schema), asyncHandler(handler));

// 5. 404 handler (after all routes)
app.use(notFoundHandler);

// 6. Error handler (must be last!)
app.use(errorHandler(logger));
```

## API Reference

### Errors

| Function | Status | Description |
|----------|--------|-------------|
| `badRequest(message?, details?)` | 400 | Invalid request data |
| `unauthorized(message?, details?)` | 401 | Not authenticated |
| `forbidden(message?, details?)` | 403 | Not authorized |
| `notFound(message?, details?)` | 404 | Resource not found |
| `conflict(message?, details?)` | 409 | Conflicting state |
| `tooManyRequests(message?, details?)` | 429 | Rate limited |
| `internalError(message?, details?)` | 500 | Server error (hidden) |

### Responses

| Function | Description |
|----------|-------------|
| `ok(data, meta?)` | Success response |
| `created(data, meta?)` | Resource created |
| `noContent()` | Success with no body |
| `fail(code, message, details?)` | Error response |

### Middleware

| Function | Description |
|----------|-------------|
| `traceId(headerName?)` | Adds request tracing |
| `requestLogger(logger)` | Logs requests |
| `validateBody(schema)` | Validates req.body |
| `asyncHandler(fn)` | Catches async errors |
| `notFoundHandler` | 404 for undefined routes |
| `errorHandler(logger?)` | Global error handler |

### Logger

| Function | Description |
|----------|-------------|
| `createLogger(opts?)` | Creates Pino logger |

## TypeScript Support

This package is written in TypeScript and includes full type definitions. The `validateBody` middleware provides type inference from your Zod schemas:

```typescript
const UserSchema = z.object({
  email: z.string().email(),
  name: z.string(),
});

app.post("/users", validateBody(UserSchema), (req, res) => {
  // TypeScript knows: req.body: { email: string, name: string }
  const { email, name } = req.body;
});
```

## License

MIT
