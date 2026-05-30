-- Vault OS D1 Schema
-- Run once after creating your D1 database:
--   npx wrangler d1 execute vault-os-db --file=worker/schema.sql --remote

CREATE TABLE IF NOT EXISTS vault_entries (
  user_id    TEXT    PRIMARY KEY,
  entries    TEXT    NOT NULL DEFAULT '[]',
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  ts       INTEGER NOT NULL,
  user_id  TEXT    NOT NULL,
  username TEXT    NOT NULL,
  action   TEXT    NOT NULL,
  meta     TEXT    NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS revoked_users (
  user_id       TEXT    PRIMARY KEY,
  revoked_until INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_ts      ON audit_log (ts DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_log (user_id);
