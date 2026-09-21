import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Only run the TypeScript tests under src/ — never compiled copies in dist/.
    include: ["src/**/*.{test,spec}.ts"],
    environment: "node",
    // Run tests one file at a time — they share a single Postgres database,
    // so parallel writes could interfere with each other.
    fileParallelism: false,
  },
});
