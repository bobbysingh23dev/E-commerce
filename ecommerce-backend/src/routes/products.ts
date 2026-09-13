import { Router } from "express";
import {
  createProduct,
  getProductById,
  getAllProducts,
  putProductById,
} from "../controllers/products";
import { validateId } from "../middlewares/validateId";
import { validateProductBody } from "../middlewares/validateProductBody";

// Pure wiring: map URL + method → [middlewares...] → controller.
// Requests flow left to right; any middleware can stop them before the controller.
const productsRouter = Router();

productsRouter.post("/", validateProductBody(false), createProduct);
productsRouter.get("/", getAllProducts);
productsRouter.get("/:id", validateId, getProductById);
productsRouter.put("/:id", validateId, validateProductBody(true), putProductById);

export default productsRouter;
