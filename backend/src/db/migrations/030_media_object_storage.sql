-- Move full incident photos out of Postgres into private object storage.
--
-- incident_media.image_data held base64 JPEGs up to ~500KB per row, bloating
-- the DB on a single VM with no CDN. New rows store the object key in
-- storage_key (bucket keeps the bytes) and leave image_data NULL. Existing
-- rows keep their base64 — reads handle both. Face crops stay in the DB (small
-- and rendered inline everywhere).
ALTER TABLE incident_media ADD COLUMN IF NOT EXISTS storage_key TEXT;
ALTER TABLE incident_media ALTER COLUMN image_data DROP NOT NULL;
