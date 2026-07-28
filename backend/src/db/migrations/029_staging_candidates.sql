-- Cargo-theft staging candidates — the SAR + jamming fusion output.
--
-- Each row is a terrain anomaly (fresh bare soil / vegetation loss detected by
-- analyzeTerrainChange) found near a jammer hotspot, scored by how likely it is
-- to be a cargo unloading yard. These are INVESTIGATIVE LEADS, not proof: a
-- terrain change can also be construction or agriculture. The fusion score and
-- SAR confirmation only narrow the search.
CREATE TABLE IF NOT EXISTS staging_candidates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude      DOUBLE PRECISION NOT NULL,
  longitude     DOUBLE PRECISION NOT NULL,
  fusion_score  INTEGER NOT NULL,               -- 0-100 combined score
  anomaly_type  VARCHAR(20) NOT NULL,           -- vegetation_loss | soil_exposure | both
  anomaly_severity INTEGER NOT NULL,
  area_m2       DOUBLE PRECISION,
  confidence    VARCHAR(16) NOT NULL,           -- optical_only | sar_confirmed
  ndvi_change   DOUBLE PRECISION,
  bsi_change    DOUBLE PRECISION,
  vv_change     DOUBLE PRECISION,               -- SAR VV delta (dB)
  vh_change     DOUBLE PRECISION,               -- SAR VH delta (dB)
  distance_m    DOUBLE PRECISION,               -- from the jammer hotspot
  jammer_lat    DOUBLE PRECISION,               -- the hotspot this was scanned from
  jammer_lng    DOUBLE PRECISION,
  jammer_severity INTEGER,
  event_date    DATE,                           -- jamming event date used as baseline pivot
  source_sensor VARCHAR(24),                    -- Sentinel-2 | Landsat 8 | ...
  status        VARCHAR(16) NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'investigating', 'confirmed', 'dismissed')),
  notes         TEXT,
  created_by    UUID,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staging_status ON staging_candidates(status);
CREATE INDEX IF NOT EXISTS idx_staging_score ON staging_candidates(fusion_score DESC);
CREATE INDEX IF NOT EXISTS idx_staging_hotspot ON staging_candidates(jammer_lat, jammer_lng);
