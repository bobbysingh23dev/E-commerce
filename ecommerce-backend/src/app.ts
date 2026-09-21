import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

// The Express app, WITHOUT app.listen(). Exported so tests (supertest) can use
// it directly, and index.ts can start it on a real port.
export const app = express();

// ---- Global middleware ----
app.use(cors());
app.use(express.json());

// ---- API docs (Swagger UI) ----
// Loaded relative to the working directory so it works under `npm run dev`,
// the compiled build, AND the test runner.
const swaggerDocument = YAML.load(path.join(process.cwd(), "openapi.yaml"));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ---- Routes ----
app.use("/", routes);

// ---- Central error handler (must come AFTER all routes) ----
app.use(errorHandler);
