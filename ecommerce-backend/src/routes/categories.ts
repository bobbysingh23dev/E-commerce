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
categoriesRouter.get("/:id", categoryController.getCategoryById);
categoriesRouter.put(
  "/:id",
  validateCategoryBody,
  categoryController.updateCategoryById,
);
categoriesRouter.delete("/:id", categoryController.deleteCategory);

export default categoriesRouter;
