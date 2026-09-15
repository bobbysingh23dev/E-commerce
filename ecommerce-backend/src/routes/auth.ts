import { Router } from "express";
import * as authController from "../controllers/auth";
import { validateRegisterBody } from "../middlewares/validateRegisterBody";

const authRouter = Router();

authRouter.post("/register", validateRegisterBody, authController.registerUser);

export default authRouter;
