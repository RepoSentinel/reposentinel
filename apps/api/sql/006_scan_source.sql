ALTER TABLE scans
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual';

CREATE INDEX IF NOT EXISTS scans_source_created_at_idx ON scans(source, created_at DESC);

