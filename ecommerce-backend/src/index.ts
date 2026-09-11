import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes";

dotenv.config();

const app = express();

// ---- Global middleware ----
app.use(cors());
app.use(express.json());

app.use("/", routes);

// ---- Start the server ----
const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
