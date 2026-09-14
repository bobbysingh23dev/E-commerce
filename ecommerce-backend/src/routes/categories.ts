import { Router } from "express";
import * as categoryController from "../controllers/categories";
import { validateCategoryBody } from "../middlewares/validateCategoryBody";
import { validateId } from "../middlewares/validateId";

const categoriesRouter = Router();

categoriesRouter.post(
  "/",
  validateCategoryBody,
  categoryController.createCategory,
);

categoriesRouter.get("/", categoryController.getAllCategories);
categoriesRouter.get("/:id", validateId, categoryController.getCategoryById);
categoriesRouter.put(
  "/:id",
  validateCategoryBody,
  validateId,
  categoryController.updateCategoryById,
);
categoriesRouter.delete("/:id", validateId, categoryController.deleteCategory);

export default categoriesRouter;
