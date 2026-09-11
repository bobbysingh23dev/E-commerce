import { Pool } from "pg";
import dotenv from "dotenv";

// Load variables from the .env file into process.env
dotenv.config();

/**
 * A connection Pool, not a single connection.
 *
 * Opening a brand-new TCP connection to Postgres for every request is slow.
 * A Pool keeps a set of connections open and hands them out as requests come
 * in, then takes them back when the query finishes. You never manage this by
 * hand — you just call `pool.query(...)` and the pool lends you a connection.
 */
export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  // If DB_PASSWORD is blank (local trust auth), send undefined instead of "".
  password: process.env.DB_PASSWORD || undefined,
  database: process.env.DB_NAME,
});

/**
 * A thin wrapper around pool.query so the rest of the app imports one helper
 * instead of the raw pool. `text` is the SQL string; `params` are the values
 * that get safely substituted for $1, $2, ... (this is how we avoid SQL
 * injection — never build SQL by string-concatenating user input).
 */
export const query = (text: string, params?: unknown[]) =>
  pool.query(text, params);
