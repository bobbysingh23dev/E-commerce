import { Router } from "express";
import * as authController from "../controllers/auth";
import {
  validateLoginBody,
  validateRegisterBody,
} from "../middlewares/validateRegisterBody";
import { validate } from "../middlewares/validate";
import { refreshSchema } from "../schemas/auth";

const authRouter = Router();

authRouter.post("/register", validateRegisterBody, authController.registerUser);

authRouter.post("/login", validateLoginBody, authController.loginUser);
authRouter.post(
  "/refresh",
  validate(refreshSchema),
  authController.refreshToken,
);

export default authRouter;
