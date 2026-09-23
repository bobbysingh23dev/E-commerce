import type { Request, Response, NextFunction } from "express";

export function validateProductBody(strict: boolean) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { name, description, price, stock_quantity, category_id, image_url } =
      req.body ?? {};
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

    // category_id — optional (a product may be uncategorized); if present, positive integer.
    if (
      category_id !== undefined &&
      category_id !== null &&
      (!Number.isInteger(category_id) || category_id <= 0)
    ) {
      errors.push("category_id must be a positive integer");
    }

    // image_url — optional; if present, must be a string (a URL).
    if (
      image_url !== undefined &&
      image_url !== null &&
      typeof image_url !== "string"
    ) {
      errors.push("image_url must be a string URL");
    }

    if (errors.length > 0) {
      return res
        .status(400)
        .json({ error: "Validation failed", details: errors });
    }

    next();
  };
}
