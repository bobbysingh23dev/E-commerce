import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

// A factory: give it a Zod schema, get back a middleware that validates req.body.
export function validate(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: result.error.issues.map(
          (issue) => `${issue.path.join(".")}: ${issue.message}`,
        ),
      });
    }
    req.body = result.data; // parsed + stripped of unknown keys
    next();
  };
}
