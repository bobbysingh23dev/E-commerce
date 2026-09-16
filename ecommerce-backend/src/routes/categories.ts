import { Router } from "express";
import * as categoryController from "../controllers/categories";
import { validateCategoryBody } from "../middlewares/validateCategoryBody";
import { validateId } from "../middlewares/validateId";
import { authenticate } from "../middlewares/authenticate";
const categoriesRouter = Router();

categoriesRouter.post(
  "/",
  authenticate,
  validateCategoryBody,
  categoryController.createCategory,
);

categoriesRouter.get("/", categoryController.getAllCategories);
categoriesRouter.get("/:id", validateId, categoryController.getCategoryById);
categoriesRouter.put(
  "/:id",
  validateCategoryBody,
  validateId,
  authenticate,
  categoryController.updateCategoryById,
);
categoriesRouter.delete(
  "/:id",
  validateId,
  authenticate,
  categoryController.deleteCategory,
);

export default categoriesRouter;
