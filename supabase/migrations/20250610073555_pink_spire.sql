/*
  # Fix RLS policies for anonymous access

  1. Revoke overly broad grants that can interfere with RLS
  2. Create proper RLS policies for anonymous users
  3. Ensure clean permissions structure
*/

-- Revoke the overly broad grants that can interfere with RLS
REVOKE ALL ON user_profiles FROM anon;
REVOKE ALL ON chat_logs FROM anon;

-- Grant only the necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON chat_logs TO anon;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Allow anonymous to read profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow anonymous to insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow anonymous to update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow anonymous to read chat logs" ON chat_logs;
DROP POLICY IF EXISTS "Allow anonymous to insert chat logs" ON chat_logs;
DROP POLICY IF EXISTS "Allow anonymous to update chat logs" ON chat_logs;
DROP POLICY IF EXISTS "Allow anonymous to delete chat logs" ON chat_logs;

-- Create new policies for user_profiles
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

-- Create new policies for chat_logs
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