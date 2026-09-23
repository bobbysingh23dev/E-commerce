ALTER TABLE products
ADD COLUMN IF NOT EXISTS search_vector tsvector
GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
)STORED;

CREATE INDEX IF NOT EXISTS idx_products_search_vector
ON products USING GIN(search_vector)