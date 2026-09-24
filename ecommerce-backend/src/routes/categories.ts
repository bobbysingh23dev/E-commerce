import { Router } from "express";
import * as categoryController from "../controllers/categories";
import { validateCategoryBody } from "../middlewares/validateCategoryBody";
import { validateId } from "../middlewares/validateId";
import { authenticate } from "../middlewares/authenticate";
import { requireAdmin } from "../middlewares/requireAdmin";
const categoriesRouter = Router();

categoriesRouter.post(
  "/",
  authenticate,
  requireAdmin,
  validateCategoryBody,
  categoryController.createCategory,
);

categoriesRouter.get("/", categoryController.getAllCategories);
categoriesRouter.get("/:id", validateId, categoryController.getCategoryById);
categoriesRouter.put(
  "/:id",
  authenticate,
  requireAdmin,
  validateCategoryBody,
  validateId,
  categoryController.updateCategoryById,
);
categoriesRouter.delete(
  "/:id",
  authenticate,
  requireAdmin,
  validateId,
  categoryController.deleteCategory,
);

export default categoriesRouter;
