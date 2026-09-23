#!/usr/bin/env bash
# Apply pending SQL migrations from migrations/ to the DB in .env.
# A schema_migrations table records what's been applied, so each file runs
# exactly ONCE and re-running ("npm run migrate") is always safe.
set -euo pipefail

# Load DB connection from .env.
set -a
[ -f .env ] && . ./.env
set +a

export PGPASSWORD="${DB_PASSWORD:-}"
HOST="${DB_HOST:-localhost}"
PORT="${DB_PORT:-5432}"
DBUSER="${DB_USER:-$(whoami)}"
DBNAME="${DB_NAME:?DB_NAME is not set (check your .env)}"

# Small helper so we don't repeat the connection flags.
q() { psql -h "$HOST" -p "$PORT" -U "$DBUSER" -d "$DBNAME" -v ON_ERROR_STOP=1 "$@"; }

echo "Migrating '$DBNAME' @ $HOST:$PORT"

# Is the tracker brand new? (decide before we create it)
TRACKER_MISSING=$(q -tAc "SELECT to_regclass('public.schema_migrations') IS NULL")

q -q -c "CREATE TABLE IF NOT EXISTS schema_migrations (
  name TEXT PRIMARY KEY,
  applied_at TIMESTAMP NOT NULL DEFAULT now()
);"

# One-time baseline: if the tracker is new BUT the DB already has our tables
# (this existing dev DB), record current migrations as applied instead of
# re-running them. A fresh DB (no products table) skips this and applies all.
if [ "$TRACKER_MISSING" = "t" ] && \
   [ "$(q -tAc "SELECT to_regclass('public.products') IS NOT NULL")" = "t" ]; then
  echo "Existing database detected — baselining current migrations as applied."
  for f in migrations/*.sql; do
    q -q -c "INSERT INTO schema_migrations (name) VALUES ('$(basename "$f")')
             ON CONFLICT DO NOTHING;"
  done
fi

# Apply any migration not yet recorded (each in its own transaction).
applied=0
for f in migrations/*.sql; do
  name="$(basename "$f")"
  if [ "$(q -tAc "SELECT 1 FROM schema_migrations WHERE name = '$name'")" = "1" ]; then
    echo "• $name (already applied)"
  else
    echo "→ $name (applying)"
    q -1 -f "$f"
    q -q -c "INSERT INTO schema_migrations (name) VALUES ('$name');"
    applied=$((applied + 1))
  fi
done
echo "✅ Done — $applied new migration(s) applied."
