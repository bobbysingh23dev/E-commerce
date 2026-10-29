import { Router } from "express";
import * as userController from "../controllers/users";
import { authenticate } from "../middlewares/authenticate";
import { requireAdmin } from "../middlewares/requireAdmin";
import { validateId } from "../middlewares/validateId";
import {
  validateRoleBody,
  validateStaffBody,
} from "../middlewares/validateRoleBody";

const userRouter = Router();

// User management is admin-only.
userRouter.use(authenticate, requireAdmin);

userRouter.get("/", userController.listUsers);
userRouter.post("/", validateStaffBody, userController.createStaffUser);
userRouter.patch(
  "/:id/role",
  validateId,
  validateRoleBody,
  userController.changeUserRole,
);

export default userRouter;
