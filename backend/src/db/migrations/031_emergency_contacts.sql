-- Emergency contacts — the people a user wants notified when THEY are in
-- danger (panic / SOS / crash). Each user manages their own list.
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         VARCHAR(100) NOT NULL,
  phone        VARCHAR(20),
  email        VARCHAR(255),
  relationship VARCHAR(40),                 -- e.g. 'esposa', 'hijo', 'madre'
  notify_email BOOLEAN NOT NULL DEFAULT TRUE,
  notify_sms   BOOLEAN NOT NULL DEFAULT TRUE,  -- honored once an SMS channel is wired
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user ON emergency_contacts(user_id);
