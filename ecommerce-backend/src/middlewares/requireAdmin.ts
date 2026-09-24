import type { Request, Response, NextFunction } from "express";

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user;
  if (user?.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
  next();
};
