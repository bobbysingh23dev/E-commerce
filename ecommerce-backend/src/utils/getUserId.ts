import type { Request } from "express";
import { UnauthorizedError } from "../errors/AppError";

// Pull the authenticated user's id off the request. Throws a clean 401 if the
// route wasn't behind `authenticate` (defensive — shouldn't happen), so we
// never need a `!` non-null assertion in the controllers.
export function getUserId(req: Request): number {
  if (!req.user) throw new UnauthorizedError("Not authenticated");
  return req.user.userId;
}
