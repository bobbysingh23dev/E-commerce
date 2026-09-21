-- Minimal seed data for CI so the integration tests that require a login can run.
-- The password_hash below is bcrypt("secret123") — the same credentials the
-- tests in src/__tests__/api.test.ts log in with. ON CONFLICT keeps it idempotent
-- (safe to run more than once).
INSERT INTO users (email, password_hash, name, role)
VALUES (
  'alice@test.com',
  '$2b$10$t5MQFQNoJSFH4P6GWW1I3u6VfSprJieG206SzFrsRbtYNxHVMuBIa',
  'Alice Admin',
  'admin'
)
ON CONFLICT (email) DO NOTHING;
