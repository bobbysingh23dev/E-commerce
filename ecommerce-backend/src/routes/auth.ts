import { Router } from "express";
import * as authController from "../controllers/auth";
import {
  validateLoginBody,
  validateRegisterBody,
} from "../middlewares/validateRegisterBody";
import { validate } from "../middlewares/validate";
import { refreshSchema } from "../schemas/auth";
import { authLimiter } from "../middlewares/rateLimit";

const authRouter = Router();

authRouter.post(
  "/register",
  authLimiter,
  validateRegisterBody,
  authController.registerUser,
);

authRouter.post(
  "/login",
  authLimiter,
  validateLoginBody,
  authController.loginUser,
);
authRouter.post(
  "/refresh",
  validate(refreshSchema),
  authController.refreshToken,
);
authRouter.post("/logout", validate(refreshSchema), authController.logout);

export default authRouter;
