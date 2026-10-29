import type { Request, Response, NextFunction } from "express";
import { can } from "../authorization/can";
import type { Action, Resource } from "../authorization/permissions";

// Place after authenticate in a route. The can() helper owns CASL details;
// this middleware translates its decision into an HTTP response.
export function authorize(action: Action, resource: Resource) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }

    if (!can(req.user, action, resource)) {
      return res.status(403).json({ error: "Access denied for this action." });
    }

    next();
  };
}
