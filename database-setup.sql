-- FilmMate Database Setup Script
-- Run this in your Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  username TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shot_logs table
CREATE TABLE IF NOT EXISTS shot_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  camera JSONB NOT NULL,
  lens JSONB NOT NULL,
  film_stock JSONB NOT NULL,
  lighting_condition JSONB NOT NULL,
  recommended_settings JSONB NOT NULL,
  alternative_settings JSONB NOT NULL,
  selected_settings JSONB NOT NULL,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shot_logs_username ON shot_logs(username);
CREATE INDEX IF NOT EXISTS idx_shot_logs_timestamp ON shot_logs(timestamp DESC);

-- Enable Row Level Security (RLS) for better security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shot_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since we're using username-based auth)
-- Note: In a production app, you'd want more restrictive policies
CREATE POLICY "Allow public access to users" ON users FOR ALL USING (true);
CREATE POLICY "Allow public access to shot_logs" ON shot_logs FOR ALL USING (true);

-- Verify tables were created
SELECT 'Users table created successfully' as status WHERE EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'users' AND table_schema = 'public'
);

SELECT 'Shot logs table created successfully' as status WHERE EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'shot_logs' AND table_schema = 'public'
); 