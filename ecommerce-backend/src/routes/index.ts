import { Router } from "express";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import authRouter from "./auth";
import orderRouter from "./orders";
import cartRouter from "./carts";

const router = Router();

router.use("/products", productsRouter);
router.use("/categories", categoriesRouter);
router.use("/auth", authRouter);
router.use("/orders", orderRouter);
router.use("/cart", cartRouter);

export default router;
