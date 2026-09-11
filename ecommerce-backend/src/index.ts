import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productsRouter from "./routes/products";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/products", productsRouter);

// ---- Start the server ----
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
