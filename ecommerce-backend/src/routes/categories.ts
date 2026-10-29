import { Router } from "express";
import * as categoryController from "../controllers/categories";
import { validateCategoryBody } from "../middlewares/validateCategoryBody";
import { validateId } from "../middlewares/validateId";
import { authenticate } from "../middlewares/authenticate";
import { requireRoles } from "../middlewares/requireRoles";
const categoriesRouter = Router();

categoriesRouter.post(
  "/",
  authenticate,
  requireRoles("content_editor"),
  validateCategoryBody,
  categoryController.createCategory,
);

categoriesRouter.get("/", categoryController.getAllCategories);
categoriesRouter.get("/:id", validateId, categoryController.getCategoryById);
categoriesRouter.put(
  "/:id",
  authenticate,
  requireRoles("content_editor"),
  validateCategoryBody,
  validateId,
  categoryController.updateCategoryById,
);
categoriesRouter.delete(
  "/:id",
  authenticate,
  requireRoles("content_editor"),
  validateId,
  categoryController.deleteCategory,
);

export default categoriesRouter;
