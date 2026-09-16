import { Router } from "express";
import {
  createProduct,
  getProductById,
  getAllProducts,
  putProductById,
  deleteProductById,
} from "../controllers/products";
import { validateId } from "../middlewares/validateId";
import { validateProductBody } from "../middlewares/validateProductBody";
import { requireAdmin } from "../middlewares/requireAdmin";
import { authenticate } from "../middlewares/authenticate";

// Pure wiring: map URL + method → [middlewares...] → controller.
// Requests flow left to right; any middleware can stop them before the controller.
const productsRouter = Router();

productsRouter.post(
  "/",
  authenticate,
  requireAdmin,
  validateProductBody(false),
  createProduct,
);
productsRouter.get("/", getAllProducts);
productsRouter.get("/:id", validateId, getProductById);

productsRouter.put(
  "/:id",
  authenticate,
  validateId,
  requireAdmin,

  validateProductBody(true),
  putProductById,
);
productsRouter.delete(
  "/:id",
  authenticate,
  requireAdmin,
  validateId,
  deleteProductById,
);

export default productsRouter;
