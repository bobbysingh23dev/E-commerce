import type { Request, Response, NextFunction } from "express";
import { ROLES } from "../types/user";

// For PATCH /users/:id/role — body is just { role }.
export function validateRoleBody(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { role } = req.body ?? {};
  if (!ROLES.includes(role)) {
    return res
      .status(400)
      .json({ error: `role must be one of: ${ROLES.join(", ")}` });
  }
  next();
}

// For POST /users — same rules as register, plus a valid role.
export function validateStaffBody(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { email, password, name, role } = req.body ?? {};
  const errors: string[] = [];
  if (typeof email !== "string" || !email.includes("@"))
    errors.push("a valid email is required");
  if (typeof password !== "string" || password.length < 6)
    errors.push("password must be at least 6 characters");
  if (typeof name !== "string" || name.length < 2)
    errors.push("a valid name is required");
  if (!ROLES.includes(role))
    errors.push(`role must be one of: ${ROLES.join(", ")}`);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
}
