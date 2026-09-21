import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { app } from "../app";
import { pool } from "../config/db";

// Close the DB connection pool after all tests so the process exits cleanly.
afterAll(async () => {
  await pool.end();
});

describe("GET /products (public reads)", () => {
  it("returns 200 with a paginated list", async () => {
    const res = await request(app).get("/products");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty("pagination");
  });

  it("returns 404 for a product that doesn't exist", async () => {
    const res = await request(app).get("/products/999999");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Product not found");
  });

  it("returns 400 for an invalid (non-numeric) id", async () => {
    const res = await request(app).get("/products/abc");
    expect(res.status).toBe(400);
  });
});

describe("Auth", () => {
  it("rejects a wrong password with 401", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "alice@test.com", password: "definitely-wrong" });
    expect(res.status).toBe(401);
  });

  it("logs in with valid credentials and returns a token", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "alice@test.com", password: "secret123" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("jwtToken");
    expect(res.body.user).toHaveProperty("email", "alice@test.com");
  });
});

describe("Authorization", () => {
  it("blocks creating a product with no token (401)", async () => {
    const res = await request(app)
      .post("/products")
      .send({ name: "ShouldNotBeCreated", price: 9.99 });
    expect(res.status).toBe(401);
  });
});
