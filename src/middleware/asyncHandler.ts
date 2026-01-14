/**
 * asyncHandler.ts
 *
 * This middleware wraps async route handlers to catch any errors they throw.
 * Without this, unhandled promise rejections in async routes would crash your app
 * or leave requests hanging without a response.
 *
 * WHY IS THIS NEEDED?
 * Express doesn't automatically catch errors from async functions.
 * If you have an async route like this:
 *
 *   app.get('/users', async (req, res) => {
 *     const users = await db.getUsers();  // If this throws, Express won't catch it!
 *     res.json(users);
 *   });
 *
 * If db.getUsers() throws an error, Express won't catch it, and the request
 * will hang forever or crash your server.
 *
 * HOW IT WORKS:
 * asyncHandler wraps your async function and catches any errors,
 * then passes them to Express's error handling middleware via next().
 */

import type { Request, Response, NextFunction } from "express";

/**
 * Wraps an async route handler to automatically catch errors.
 * Any errors thrown will be passed to Express's error handler.
 *
 * @param fn - Your async route handler function
 * @returns A wrapped function that catches errors
 *
 * @example
 * // Without asyncHandler (DANGEROUS - errors won't be caught!)
 * app.get('/users', async (req, res) => {
 *   const users = await db.getUsers();
 *   res.json(users);
 * });
 *
 * @example
 * // With asyncHandler (SAFE - errors are caught and handled)
 * app.get('/users', asyncHandler(async (req, res) => {
 *   const users = await db.getUsers();  // If this throws, error handler catches it
 *   res.json(users);
 * }));
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    // Promise.resolve() ensures we handle both sync and async functions
    // .catch(next) passes any errors to Express's error handling middleware
    Promise.resolve(fn(req, res, next)).catch(next);
  };
