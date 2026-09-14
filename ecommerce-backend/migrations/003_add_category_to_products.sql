-- Migration 003: link products to a category (foreign key)
ALTER TABLE products
ADD COLUMN  category_id INTEGER REFERENCES  categories(id) ON DELETE SET NULL;