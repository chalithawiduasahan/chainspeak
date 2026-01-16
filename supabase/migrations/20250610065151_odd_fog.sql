/*
  # Fix chat logs RLS policies for anonymous access

  1. Drop existing policies
  2. Create new policies that allow anonymous users full access
  3. Ensure proper permissions
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own chat logs" ON chat_logs;
DROP POLICY IF EXISTS "Users can insert own chat logs" ON chat_logs;
DROP POLICY IF EXISTS "Users can delete own chat logs" ON chat_logs;

-- Create new policies that work with anonymous users
CREATE POLICY "Allow anonymous to read chat logs"
  ON chat_logs
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous to insert chat logs"
  ON chat_logs
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous to update chat logs"
  ON chat_logs
  FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous to delete chat logs"
  ON chat_logs
  FOR DELETE
  TO anon
  USING (true);