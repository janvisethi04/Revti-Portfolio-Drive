-- Run this in Supabase SQL Editor
-- Go to: supabase.com → Your Project → SQL Editor → New Query

CREATE TABLE links (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project     TEXT NOT NULL,
  name        TEXT NOT NULL,
  url         TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Allow all operations (public access — since login is handled in frontend)
CREATE POLICY "Allow all" ON links
  FOR ALL
  USING (true)
  WITH CHECK (true);
