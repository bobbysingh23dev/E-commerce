import { Request, Response, NextFunction } from "express";

export const validateRegisterBody = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password, name } = req.body ?? {};
  const errors: string[] = [];
  if (typeof email !== "string" || !email.includes("@"))
    errors.push("a valid email is required");
  if (typeof password !== "string" || password.length < 6)
    errors.push("a valid password is required");
  if (typeof name !== "string" || name.length < 2)
    errors.push("a valid name is required");

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

export const validateLoginBody = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body ?? {};
  const errors: string[] = [];

  if (typeof email !== "string" || !email.includes("@"))
    errors.push("a valid email is required");
  if (typeof password !== "string" || password.length < 6)
    errors.push("a valid password is required");

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};
