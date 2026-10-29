import type { Request, Response, NextFunction } from "express";
import type { Role } from "../types/user";

// Admins can access every staff endpoint. Other staff roles are granted only
// the capabilities listed on the route that uses this middleware.
export function requireRoles(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role || (role !== "admin" && !roles.includes(role))) {
      return res.status(403).json({ error: "Access denied for this role." });
    }
    next();
  };
}
