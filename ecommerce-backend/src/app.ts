import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { openapiDocument } from "./openapi";

dotenv.config();

// The Express app, WITHOUT app.listen(). Exported so tests (supertest) can use
// it directly, and index.ts can start it on a real port.
export const app = express();

// ---- Global middleware ----
app.use(cors());
app.use(express.json());

// ---- API docs (Swagger UI) ----
// openapiDocument = the hand-written openapi.yaml with the cart input schemas
// generated from Zod (see src/openapi.ts). Change a Zod schema → docs update.
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));

// ---- Routes ----
app.use("/", routes);

// ---- Central error handler (must come AFTER all routes) ----
app.use(errorHandler);
