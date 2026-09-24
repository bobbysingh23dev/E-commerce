import express from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { openapiDocument } from "./openapi";
import { pinoHttp } from "pino-http";
import { logger } from "./config/logger";
dotenv.config();

// The Express app, WITHOUT app.listen(). Exported so tests (supertest) can use
// it directly, and index.ts can start it on a real port.
export const app = express();

// ---- Global middleware ----
// Security headers first. CSP is disabled so Swagger UI (/docs) still works;
// it mainly protects HTML pages, and this is a JSON API.
app.use(helmet({ contentSecurityPolicy: false }));
// Only allow the frontend origin to call this API from a browser.
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());
app.use(pinoHttp({ logger }));

// ---- API docs (Swagger UI) ----
// openapiDocument = the hand-written openapi.yaml with the cart input schemas
// generated from Zod (see src/openapi.ts). Change a Zod schema → docs update.
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));

// ---- Routes ----
app.use("/", routes);

// ---- Central error handler (must come AFTER all routes) ----
app.use(errorHandler);
