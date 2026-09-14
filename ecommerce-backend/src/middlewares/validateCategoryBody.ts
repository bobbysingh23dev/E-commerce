import { Request, Response, NextFunction } from "express";

export function validateCategoryBody(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { name, description } = req.body ?? {};
  const errors: string[] = [];

  if (typeof name !== "string" || name.trim() === "") {
    errors.push("name must be a non-empty string");
  }
  if (description != null && typeof description !== "string") {
    errors.push("description must be a string");
  }

  if (errors.length > 0) {
    return res
      .status(400)
      .json({ error: "Validation failed", details: errors });
  }
  next();
}
