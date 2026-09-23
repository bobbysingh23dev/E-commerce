-- A link to the product's image (nullable). The frontend renders <img src=...>.
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;
