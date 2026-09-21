import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Run tests one file at a time — they share a single Postgres database,
    // so parallel writes could interfere with each other.
    fileParallelism: false,
  },
});
