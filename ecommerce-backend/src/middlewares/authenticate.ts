import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  // 1. Read the Authorization header: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
  // 2. Strip "Bearer " to get just the token
  const token = authHeader.split(" ")[1];

  try {
    // 3. Verify signature + decode payload (throws if invalid/expired)

    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    (req as any).user = payload;

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
