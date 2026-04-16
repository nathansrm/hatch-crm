ALTER TABLE deals ADD COLUMN IF NOT EXISTS projected_hours numeric;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS project_status text CHECK (project_status IN ('on_track','at_risk','behind','complete') OR project_status IS NULL);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS project_progress_pct integer CHECK (project_progress_pct >= 0 AND project_progress_pct <= 100);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS project_started_at timestamptz;

CREATE TABLE IF NOT EXISTS agency_settings (
  id integer PRIMARY KEY DEFAULT 1,
  weekly_capacity_hours integer NOT NULL DEFAULT 40,
  updated_at timestamptz DEFAULT now(),
  CHECK (id = 1)
);
INSERT INTO agency_settings (id) VALUES (1) ON CONFLICT DO NOTHING;
