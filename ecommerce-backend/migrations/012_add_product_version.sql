-- Optimistic locking: a version that bumps on every update. A stale write
-- (WHERE version = <what the client loaded>) then matches 0 rows and is rejected,
-- instead of silently overwriting someone else's change.
ALTER TABLE products ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;
