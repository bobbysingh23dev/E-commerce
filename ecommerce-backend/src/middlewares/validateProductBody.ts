import { Request, Response, NextFunction } from "express";

export function validateProductBody(strict: boolean) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { name, description, price, stock_quantity } = req.body ?? {};
    const errors: string[] = [];

    // name — always required; must be a non-empty string.
    if (typeof name !== "string" || name.trim() === "") {
      errors.push("name must be a non-empty string");
    }

    if (typeof price !== "number" || Number.isNaN(price) || price < 0) {
      errors.push("price must be a number >= 0");
    }

    if (strict && (description === undefined || description === null)) {
      errors.push("description is required");
    } else if (description != null && typeof description !== "string") {
      errors.push("description must be a string");
    }

    if (strict && stock_quantity === undefined) {
      errors.push("stock_quantity is required");
    } else if (
      stock_quantity !== undefined &&
      (!Number.isInteger(stock_quantity) || stock_quantity < 0)
    ) {
      errors.push("stock_quantity must be an integer >= 0");
    }

    if (errors.length > 0) {
      return res
        .status(400)
        .json({ error: "Validation failed", details: errors });
    }

    next();
  };
}
