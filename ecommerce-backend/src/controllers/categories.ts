import * as CategoryService from "../services/categories";
import { Request, Response } from "express";
import { Category } from "../types/category";

export async function createCategory(req: Request, res: Response) {
  try {
    const input: Omit<Category, "id"> = req.body;
    const category = await CategoryService.createCategory(input);
    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Category already exists" });
    }
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getAllCategories(_req: Request, res: Response) {
  try {
    const categories = await CategoryService.getAllCategories();
    if (!categories || categories.length === 0) {
      return res.status(404).json({ error: "No categories found" });
    }
    res.status(200).json(categories);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
