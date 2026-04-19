ALTER TABLE deals ADD COLUMN IF NOT EXISTS closed_at timestamptz;
UPDATE deals SET closed_at = updated_at WHERE stage IN ('won', 'lost') AND closed_at IS NULL;
ALTER TABLE agency_settings ADD COLUMN IF NOT EXISTS won_goal integer NOT NULL DEFAULT 10;
