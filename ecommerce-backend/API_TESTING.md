# API Testing Reference

Quick copy-paste reference for testing the ecommerce backend in Thunder Client / curl.
**Local dev only — these are throwaway credentials, not real secrets.**

Base URL: `http://localhost:4000`

---

## 👤 Test users

| Email | Password | Role | Use for |
|-------|----------|------|---------|
| `alice@test.com` | `secret123` | **admin** | creating/updating/deleting products & categories |
| `bobby@test.com` | `secret123` | customer | testing that non-admins get `403` |

> To promote a user to admin (trusted channel — never via the API):
> ```bash
> psql -d "E-Commerce" -c "UPDATE users SET role='admin' WHERE email='alice@test.com';"
> ```
> After promoting, the user must **log in again** to get a fresh token with the new role.

---

## 🔑 Auth flow

1. **Log in** (below) → copy the `jwtToken` from the response.
2. On protected requests, add a header:
   - Thunder Client: **Auth** tab → **Bearer** → paste the token (no need to type "Bearer ").
   - Or **Headers** tab: `Authorization` = `Bearer <token>`

Tokens expire in **7 days** — if you get `401 Invalid or expired token`, just log in again.

---

## 📦 Request bodies

### Register — `POST /auth/register`  (public)
```json
{
  "email": "charlie@test.com",
  "password": "secret123",
  "name": "Charlie"
}
```

### Login — `POST /auth/login`  (public)
```json
{
  "email": "alice@test.com",
  "password": "secret123"
}
```

### Create product — `POST /products`  (admin token required)
```json
{
  "name": "Ceramic Bowl",
  "description": "Handmade soup bowl, 500ml",
  "price": 14.99,
  "stock_quantity": 80,
  "category_id": 2
}
```
> `price` must be a **number** (not `"14.99"`). `category_id` must exist (see below) or be omitted.

### Update product — `PUT /products/:id`  (admin token required)
```json
{
  "name": "Ceramic Bowl",
  "description": "Handmade soup bowl, 500ml",
  "price": 16.50,
  "stock_quantity": 60,
  "category_id": 2
}
```
> PUT is a full replace — send **all** fields.

### Create category — `POST /categories`  (currently public — will be admin-locked later)
```json
{
  "name": "Electronics",
  "description": "Gadgets and devices"
}
```

---

## 🗂️ Reference data

**Categories** (id → name):
| id | name |
|----|------|
| 1 | Apparel |
| 2 | Kitchenware |

(Run `GET /categories` for the live list.)

---

## 🛣️ Endpoints & access

| Method | Path | Access |
|--------|------|--------|
| POST | `/auth/register` | public |
| POST | `/auth/login` | public |
| GET  | `/auth/me` | any logged-in user (Bearer token) |
| GET  | `/products` | public |
| GET  | `/products/:id` | public |
| POST | `/products` | **admin** |
| PUT  | `/products/:id` | **admin** |
| DELETE | `/products/:id` | **admin** |
| GET  | `/categories` | public |
| GET  | `/categories/:id` | public |
| POST | `/categories` | public (→ admin later) |
| PUT  | `/categories/:id` | public (→ admin later) |
| DELETE | `/categories/:id` | public (→ admin later) |

---

## 🧪 Expected status codes

| Situation | Status |
|-----------|--------|
| Success (create) | `201` |
| Success (read/update/delete) | `200` |
| Bad/missing input | `400` |
| No / invalid token on a protected route | `401` |
| Valid token but not admin | `403` |
| Resource not found | `404` |
| Duplicate (email / category name) | `409` |
| Server error | `500` |
