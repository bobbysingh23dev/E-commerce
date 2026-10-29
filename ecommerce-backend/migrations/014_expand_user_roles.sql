-- Widen the role CHECK so the new CASL roles can be stored.
-- (Postgres auto-named the old constraint users_role_check.)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (
    role IN ('customer', 'admin', 'support', 'inventory_manager',
             'order_manager', 'finance', 'content_editor')
);
