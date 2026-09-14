import { Router } from "express";
import * as categoryController from "../controllers/categories";
import { validateCategoryBody } from "../middlewares/validateCategoryBody";

const categoriesRouter = Router();

categoriesRouter.post(
  "/",
  validateCategoryBody,
  categoryController.createCategory,
);

categoriesRouter.get("/", categoryController.getAllCategories);

export default categoriesRouter;
