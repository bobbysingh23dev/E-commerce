import { apiFetch } from "./client";
import type { LoginResponse, PublicUser } from "../types";

// POST /auth/login — returns { jwtToken, user }.
export function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// The register endpoint returns the created user but NOT a token.
interface RegisterResponse {
  message: string;
  newUser: PublicUser;
}

// POST /auth/register — always creates a "customer" (per the backend).
export function register(
  name: string,
  email: string,
  password: string,
): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}
