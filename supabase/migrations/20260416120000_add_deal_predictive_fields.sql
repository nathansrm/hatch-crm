ALTER TABLE deals ADD COLUMN IF NOT EXISTS primary_bottleneck text;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS software_stack text[];
ALTER TABLE deals ADD COLUMN IF NOT EXISTS dm_present boolean;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS hours_wasted_per_week numeric;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS response_time_hours numeric;
