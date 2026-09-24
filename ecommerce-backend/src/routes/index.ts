import { Router } from "express";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import authRouter from "./auth";
import orderRouter from "./orders";
import cartRouter from "./carts";
import reportRouter from "./reports";

const router = Router();

router.use("/products", productsRouter);
router.use("/categories", categoriesRouter);
router.use("/auth", authRouter);
router.use("/orders", orderRouter);
router.use("/cart", cartRouter);
router.use("/reports", reportRouter);

export default router;
