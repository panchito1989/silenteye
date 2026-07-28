-- Chain of custody — tamper-evident, hash-linked ledger of evidence events.
--
-- Each row seals: who did what to which piece of evidence, when, plus the
-- SHA-256 of the evidence bytes (content_hash) and the previous row's
-- chain_hash. Editing or deleting any past row breaks the chain, which the
-- verification endpoint detects. Append-only by convention (the app never
-- UPDATEs/DELETEs these rows).
--
-- IMPORTANT: the chained columns (actor_id, incident_id, entity_id, ...) are
-- plain historical values with NO foreign keys. A cascading ON DELETE SET NULL
-- would silently mutate a sealed field and break verification falsely — so we
-- keep them FK-free on purpose. `details` is NOT part of the sealed hash; it is
-- non-authenticated annotation for display only.
CREATE TABLE IF NOT EXISTS custody_chain (
  seq          BIGSERIAL PRIMARY KEY,
  entity_type  VARCHAR(32) NOT NULL,   -- 'incident_media' | 'face_detection' | 'suspect' | 'incident' | 'export'
  entity_id    TEXT,                   -- the evidence row id (as text)
  action       VARCHAR(48) NOT NULL,   -- 'capture' | 'detect' | 'suspect.create' | 'status.change' | 'evidence.export'
  actor_id     UUID,                   -- who performed it (historical, no FK)
  actor_role   VARCHAR(24),
  incident_id  UUID,                   -- for per-incident filtering (historical, no FK)
  content_hash TEXT,                   -- SHA-256 hex of the evidence bytes, when applicable
  prev_hash    TEXT,                   -- chain_hash of the previous row (NULL for the first)
  chain_hash   TEXT NOT NULL,          -- SHA-256 hex over the canonical row + prev_hash
  details      JSONB,                  -- display-only context, NOT sealed
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custody_incident ON custody_chain(incident_id);
CREATE INDEX IF NOT EXISTS idx_custody_entity ON custody_chain(entity_type, entity_id);

-- Content fingerprints stored alongside the evidence itself, so a photo can be
-- independently re-hashed and matched against its custody entry.
ALTER TABLE incident_media  ADD COLUMN IF NOT EXISTS content_sha256 TEXT;
ALTER TABLE face_detections ADD COLUMN IF NOT EXISTS content_sha256 TEXT;
