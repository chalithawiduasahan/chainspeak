/*
  # Manual Database Setup for Chat Logs
  
  This file contains all the SQL commands needed to set up the chat_logs table
  and related permissions. Run this in your Supabase SQL Editor.
  
  1. Creates user_profiles table (if not exists)
  2. Creates chat_logs table with proper foreign key
  3. Sets up Row Level Security (RLS)
  4. Creates policies for anonymous access
*/

-- First, ensure user_profiles table exists
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname text UNIQUE NOT NULL,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on user_profiles if not already enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create chat_logs table
CREATE TABLE IF NOT EXISTS chat_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  cid text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'chat_logs_username_fkey' 
    AND table_name = 'chat_logs'
  ) THEN
    ALTER TABLE chat_logs 
    ADD CONSTRAINT chat_logs_username_fkey 
    FOREIGN KEY (username) REFERENCES user_profiles(nickname) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS on chat_logs
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON chat_logs TO anon;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can read own data" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own data" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own data" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own chat logs" ON chat_logs;
DROP POLICY IF EXISTS "Users can insert own chat logs" ON chat_logs;
DROP POLICY IF EXISTS "Users can delete own chat logs" ON chat_logs;
DROP POLICY IF EXISTS "Enable read access for anonymous users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert access for anonymous users" ON user_profiles;
DROP POLICY IF EXISTS "Enable update access for anonymous users" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for anonymous users on chat_logs" ON chat_logs;
DROP POLICY IF EXISTS "Enable insert access for anonymous users on chat_logs" ON chat_logs;
DROP POLICY IF EXISTS "Enable update access for anonymous users on chat_logs" ON chat_logs;
DROP POLICY IF EXISTS "Enable delete access for anonymous users on chat_logs" ON chat_logs;

-- Create policies for user_profiles
CREATE POLICY "Enable read access for anonymous users"
  ON user_profiles
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Enable insert access for anonymous users"
  ON user_profiles
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Enable update access for anonymous users"
  ON user_profiles
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create policies for chat_logs
CREATE POLICY "Enable read access for anonymous users on chat_logs"
  ON chat_logs
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Enable insert access for anonymous users on chat_logs"
  ON chat_logs
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Enable update access for anonymous users on chat_logs"
  ON chat_logs
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for anonymous users on chat_logs"
  ON chat_logs
  FOR DELETE
  TO anon
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_logs_username ON chat_logs(username);
CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON chat_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_nickname ON user_profiles(nickname);