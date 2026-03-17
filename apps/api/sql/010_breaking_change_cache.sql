CREATE TABLE breaking_change_cache (
  package_name TEXT NOT NULL,
  from_version TEXT NOT NULL,
  to_version TEXT NOT NULL,
  changes JSONB NOT NULL,
  source TEXT NOT NULL, -- 'changelog' | 'semver' | 'manual'
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days',
  PRIMARY KEY (package_name, from_version, to_version)
);

CREATE INDEX breaking_change_expires_idx ON breaking_change_cache(expires_at);
