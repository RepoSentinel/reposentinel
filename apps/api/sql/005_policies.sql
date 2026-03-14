CREATE TABLE IF NOT EXISTS policies (
  id          TEXT PRIMARY KEY,
  owner       TEXT NOT NULL,
  name        TEXT NOT NULL,
  enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  rules       JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS policies_owner_idx ON policies(owner);

CREATE TABLE IF NOT EXISTS policy_violations (
  id          TEXT PRIMARY KEY,
  policy_id   TEXT NOT NULL,
  owner       TEXT NOT NULL,
  repo_id     TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  severity    TEXT NOT NULL,
  title       TEXT NOT NULL,
  details     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS policy_violations_fingerprint_uniq ON policy_violations(policy_id, repo_id, fingerprint);
CREATE INDEX IF NOT EXISTS policy_violations_owner_created_at_idx ON policy_violations(owner, created_at DESC);
CREATE INDEX IF NOT EXISTS policy_violations_repo_created_at_idx ON policy_violations(repo_id, created_at DESC);

