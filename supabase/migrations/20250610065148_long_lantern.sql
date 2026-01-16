/*
  # Fix user profiles RLS policies for anonymous access

  1. Drop existing policies
  2. Create new policies that allow anonymous users to insert and read profiles
  3. Grant proper permissions to anonymous role
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Grant table permissions to anonymous role
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON user_profiles TO anon;
GRANT ALL ON chat_logs TO anon;

-- Create new policies that work with anonymous users
CREATE POLICY "Allow anonymous to read profiles"
  ON user_profiles
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous to insert profiles"
  ON user_profiles
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous to update profiles"
  ON user_profiles
  FOR UPDATE
  TO anon
  USING (true);