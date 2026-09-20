import * as CategoryService from "../services/categories";
import { Request, Response } from "express";
import { Category } from "../types/category";
import { NotFoundError } from "../errors/AppError";

// Duplicate-name (Postgres 23505) is mapped to 409 by the central errorHandler.

export async function createCategory(req: Request, res: Response) {
  const input: Omit<Category, "id"> = req.body;
  const category = await CategoryService.createCategory(input);
  res.status(201).json({ message: "Category created successfully", category });
}

export async function getAllCategories(_req: Request, res: Response) {
  const categories = await CategoryService.getAllCategories();
  res.status(200).json(categories);
}

export async function getCategoryById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const category = await CategoryService.getCategoryById(id);
  if (!category) throw new NotFoundError("Category not found");
  res.status(200).json(category);
}

export async function updateCategoryById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const input: Omit<Category, "id"> = req.body;
  const category = await CategoryService.updateCategory(id, input);
  if (!category) throw new NotFoundError("Category not found");
  res.status(200).json(category);
}

export async function deleteCategory(req: Request, res: Response) {
  const id = Number(req.params.id);
  const category = await CategoryService.deleteCategory(id);
  if (!category) throw new NotFoundError("Category not found");
  res.status(200).json(category);
}
