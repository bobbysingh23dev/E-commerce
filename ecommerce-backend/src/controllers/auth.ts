import type { Request, Response } from "express";
import type { RegisterInput } from "../types/user";
import * as authService from "../services/auth";
import { UnauthorizedError } from "../errors/AppError";

// Duplicate-email (Postgres 23505) is mapped to 409 by the central errorHandler.

export async function registerUser(req: Request, res: Response) {
  const { email, password, name } = req.body;
  const newUser = await authService.registerUser({
    email,
    password,
    name,
  } as RegisterInput);
  res.status(201).json({ message: "User registered successfully", newUser });
}

export async function loginUser(req: Request, res: Response) {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);
  if (!result) throw new UnauthorizedError("Invalid email or password");
  res.status(200).json(result);
}
