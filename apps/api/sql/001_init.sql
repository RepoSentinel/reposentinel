CREATE TYPE scan_status AS ENUM ('queued', 'running', 'done', 'failed');

CREATE TABLE scans (
  id            TEXT PRIMARY KEY,
  repo_id       TEXT NOT NULL,
  status        scan_status NOT NULL DEFAULT 'queued',
  result        JSONB,
  error         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX scans_repo_id_idx ON scans(repo_id);
CREATE INDEX scans_status_idx ON scans(status);