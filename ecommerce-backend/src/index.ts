import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

const app = express();

// ---- Global middleware ----
app.use(cors());
app.use(express.json());

// ---- API docs (Swagger UI) ----
// Interactive documentation for the frontend team at http://localhost:4000/docs
const swaggerDocument = YAML.load(path.join(__dirname, "..", "openapi.yaml"));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/", routes);
app.use(errorHandler); // ← must come AFTER all routes

// ---- Start the server ----
const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
