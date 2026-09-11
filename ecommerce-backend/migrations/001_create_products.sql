-- Migration 001: create the products table
--
-- Apply it with:
--   psql -d "E-Commerce" -f migrations/001_create_products.sql

CREATE TABLE IF NOT EXISTS products (
    -- Auto-incrementing integer primary key. Postgres assigns 1, 2, 3, ...
    -- GENERATED ALWAYS AS IDENTITY is the modern SQL-standard spelling.
    -- (You'll also see the older Postgres shorthand `SERIAL` in tutorials.)
    id             INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    -- Product name. NOT NULL means a row can never be saved without one.
    name           TEXT NOT NULL,

    -- Optional longer text. No NOT NULL, so it may be left empty (NULL).
    description    TEXT,

    -- Money is NUMERIC, NEVER a float. NUMERIC(10, 2) = at most 10 total
    -- digits with 2 after the decimal point (max 99,999,999.99). Floats
    -- (REAL/DOUBLE) round money incorrectly, so we never use them for prices.
    -- CHECK is a rule the database itself enforces: price can't be negative.
    price          NUMERIC(10, 2) NOT NULL CHECK (price >= 0),

    -- Units in stock. DEFAULT 0 fills it in when the caller doesn't send one.
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),

    -- A soft on/off switch: hide a product from the store without deleting it.
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,

    -- TIMESTAMPTZ = timestamp WITH time zone (stored internally as UTC).
    -- now() auto-fills the current time when the row is inserted.
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
