import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/db";

dotenv.config();

const app = express();

// ---- Global middleware (runs on every request, in order) ----
app.use(cors());          // allow browsers on other origins to call this API
app.use(express.json());  // parse incoming JSON request bodies into req.body

// ---- Health check ----
// A tiny endpoint whose only job is to prove two things are alive:
//   1. the Express server is responding, and
//   2. we can actually reach the database.
// SELECT NOW() asks Postgres for its current time — a cheap round-trip.
app.get("/health", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "ok", db_time: result.rows[0].now });
  } catch (err) {
    console.error("Health check failed:", err);
    res.status(500).json({ status: "error", message: "database unreachable" });
  }
});

// ---- Start the server ----
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
