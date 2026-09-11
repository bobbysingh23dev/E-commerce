import { Router } from "express";
import { createProduct } from "../controllers/products";

// Pure wiring: map URL + method → controller function.
const productsRouter = Router();

productsRouter.post("/", createProduct);

export default productsRouter;
