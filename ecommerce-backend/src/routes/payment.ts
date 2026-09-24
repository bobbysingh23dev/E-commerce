import { Router } from "express";
import * as paymentController from "../controllers/payment";
import { authenticate } from "../middlewares/authenticate";
import { validateId } from "../middlewares/validateId";

const paymentRouter = Router();

paymentRouter.use(authenticate);
paymentRouter.post("/:id/intent", validateId, paymentController.createIntent);

export default paymentRouter;
