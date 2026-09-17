import { Router } from "express";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import authRouter from "./auth";
import orderRouter from "./orders";

const router = Router();

router.use("/products", productsRouter);
router.use("/categories", categoriesRouter);
router.use("/auth", authRouter);
router.use("/orders", orderRouter);

export default router;
