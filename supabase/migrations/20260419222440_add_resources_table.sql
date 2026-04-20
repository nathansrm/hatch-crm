CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'internal',
  storage_path text,
  file_name text,
  file_size bigint,
  file_type text,
  ext text,
  tags text[] DEFAULT '{}',
  starred boolean NOT NULL DEFAULT false,
  preview text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_own_resources ON resources
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

INSERT INTO storage.buckets (id, name, public)
  VALUES ('resources', 'resources', false)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY resources_storage_owner ON storage.objects
  FOR ALL USING (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1]);
