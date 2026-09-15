import { Router } from "express";
import * as authController from "../controllers/auth";
import {
  validateLoginBody,
  validateRegisterBody,
} from "../middlewares/validateRegisterBody";

const authRouter = Router();

authRouter.post("/register", validateRegisterBody, authController.registerUser);

authRouter.post("/login", validateLoginBody, authController.loginUser);

export default authRouter;
