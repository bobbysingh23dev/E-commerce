// The shape we sign into the JWT (see services/auth.ts → jwt.sign).
export interface AuthUser {
  userId: number;
  email: string;
  role: "customer" | "admin";
}

// Declaration merging: add `user` to Express's built-in Request interface,
// so req.user is known & typed everywhere — no more (req as any).
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
