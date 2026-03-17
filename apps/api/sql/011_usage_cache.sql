CREATE TABLE package_usage_cache (
  repo_id TEXT NOT NULL,
  package_name TEXT NOT NULL,
  version_range TEXT NOT NULL,
  usage_report JSONB NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  PRIMARY KEY (repo_id, package_name, version_range)
);

CREATE INDEX usage_cache_expires_idx ON package_usage_cache(expires_at);
