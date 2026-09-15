import { Request, Response } from "express";
import { RegisterInput } from "../types/user";
import * as authService from "../services/auth";

export async function registerUser(req: Request, res: Response) {
  try {
    const { email, password, name } = req.body;
    const newUser = await authService.registerUser({
      email,
      password,
      name,
    } as RegisterInput);
    res.status(201).json({
      message: "User registered successfully",
      newUser,
    });
  } catch (error: any) {
    if (error.code === "23505") {
      // duplicate email
      return res
        .status(409)
        .json({ error: "An account with that email already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function loginUser(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    if (!result) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
