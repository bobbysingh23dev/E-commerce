-- Migration 006: add indexes for columns we filter, sort, and join by.
-- (PRIMARY KEY columns and UNIQUE constraints are already indexed automatically;
--  these cover the foreign keys and the sort column, which are NOT auto-indexed.)

-- Filtering products by category:  GET /products?category_id=1
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products (category_id);

-- Sorting products by price:       GET /products?sort=price
CREATE INDEX IF NOT EXISTS idx_products_price ON products (price);

-- A user's own orders:             GET /orders  (WHERE user_id = ...)
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);

-- Joining line items to an order:  the receipt JOIN (WHERE order_id = ...)
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);
