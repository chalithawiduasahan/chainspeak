/*
  # Fix user_activity table schema and trigger

  This migration ensures the user_activity table has the correct schema
  and that the updated_at trigger is properly configured.

  1. Add missing updated_at column if it doesn't exist
  2. Create or replace the update_updated_at_column function
  3. Ensure the trigger is properly set up
  4. Verify RLS policies and permissions
*/

-- Step 1: Add the 'updated_at' column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_activity' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE user_activity ADD COLUMN updated_at timestamptz DEFAULT now();
        -- Backfill existing records
        UPDATE user_activity SET updated_at = created_at WHERE updated_at IS NULL;
    END IF;
END $$;

-- Step 2: Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 3: Drop and recreate the trigger to ensure it's working
DROP TRIGGER IF EXISTS update_user_activity_updated_at ON user_activity;
CREATE TRIGGER update_user_activity_updated_at
    BEFORE UPDATE ON user_activity
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 4: Ensure RLS is enabled and policies are correct
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON user_activity TO anon;

-- Recreate policies to ensure they're correct
DROP POLICY IF EXISTS "Enable read access for anonymous users on user_activity" ON user_activity;
CREATE POLICY "Enable read access for anonymous users on user_activity"
  ON user_activity
  FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Enable insert access for anonymous users on user_activity" ON user_activity;
CREATE POLICY "Enable insert access for anonymous users on user_activity"
  ON user_activity
  FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for anonymous users on user_activity" ON user_activity;
CREATE POLICY "Enable update access for anonymous users on user_activity"
  ON user_activity
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Step 5: Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_date ON user_activity(date);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_date ON user_activity(user_id, date);