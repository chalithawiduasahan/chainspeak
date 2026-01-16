/*
  # Create user activity table for tracking time spent

  1. New Tables
    - `user_activity`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles.id)
      - `date` (date, the date of activity)
      - `seconds_spent` (integer, total seconds spent on that date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_activity` table
    - Add policies for anonymous access

  3. Performance
    - Add unique constraint on user_id + date
    - Add indexes for better performance
    - Add trigger for updated_at column
*/

-- Create user_activity table
CREATE TABLE IF NOT EXISTS user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL,
  seconds_spent integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  UNIQUE (user_id, date) -- Ensures only one activity entry per user per day
);

-- Enable RLS
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Grant permissions to anon role
GRANT SELECT, INSERT, UPDATE ON user_activity TO anon;

-- Create policies for anonymous access
CREATE POLICY "Enable read access for anonymous users on user_activity"
  ON user_activity
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Enable insert access for anonymous users on user_activity"
  ON user_activity
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Enable update access for anonymous users on user_activity"
  ON user_activity
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_date ON user_activity(date);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_date ON user_activity(user_id, date);

-- Create trigger for updated_at column (reuse existing function)
CREATE TRIGGER update_user_activity_updated_at
    BEFORE UPDATE ON user_activity
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();