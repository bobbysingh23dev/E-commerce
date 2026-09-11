import { Router } from "express";
import {
  createProduct,
  getProductById,
  getAllProducts,
} from "../controllers/products";

// Pure wiring: map URL + method → controller function.
const productsRouter = Router();

productsRouter.post("/", createProduct);
productsRouter.get("/", getAllProducts);
productsRouter.get("/:id", getProductById);

export default productsRouter;
