/*
  # Add authentication system to ChainSpeak

  1. Modify user_profiles table to work with Supabase Auth
    - Add email column
    - Add auth_user_id column to link with auth.users
    - Keep nickname for display purposes
    - Add profile completion tracking

  2. Create auth trigger function
    - Automatically create user profile when user signs up

  3. Update RLS policies for proper auth
    - Use auth.uid() for security
    - Maintain backward compatibility

  4. Add indexes for performance
*/

-- Add new columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS full_name text;

-- Make email unique
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_email_unique UNIQUE (email);

-- Make auth_user_id unique
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_auth_user_id_unique UNIQUE (auth_user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (auth_user_id, email, nickname, profile_completed, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1)),
    false,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies for user_profiles
DROP POLICY IF EXISTS "Enable read access for anonymous users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert access for anonymous users" ON user_profiles;
DROP POLICY IF EXISTS "Enable update access for anonymous users" ON user_profiles;

-- New RLS policies using auth
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- Allow service role to insert (for the trigger)
CREATE POLICY "Service role can insert profiles"
  ON user_profiles FOR INSERT
  WITH CHECK (true);

-- Update chat_logs table to use auth_user_id
ALTER TABLE chat_logs 
ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies for chat_logs
DROP POLICY IF EXISTS "Enable read access for anonymous users on chat_logs" ON chat_logs;
DROP POLICY IF EXISTS "Enable insert access for anonymous users on chat_logs" ON chat_logs;
DROP POLICY IF EXISTS "Enable update access for anonymous users on chat_logs" ON chat_logs;
DROP POLICY IF EXISTS "Enable delete access for anonymous users on chat_logs" ON chat_logs;

-- New RLS policies for chat_logs using auth
CREATE POLICY "Users can view own chat logs"
  ON chat_logs FOR SELECT
  USING (auth.uid() = auth_user_id OR auth.uid() = user_id::uuid);

CREATE POLICY "Users can insert own chat logs"
  ON chat_logs FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id OR auth.uid() = user_id::uuid);

CREATE POLICY "Users can update own chat logs"
  ON chat_logs FOR UPDATE
  USING (auth.uid() = auth_user_id OR auth.uid() = user_id::uuid);

CREATE POLICY "Users can delete own chat logs"
  ON chat_logs FOR DELETE
  USING (auth.uid() = auth_user_id OR auth.uid() = user_id::uuid);

-- Update marketplace tables
ALTER TABLE marketplace_listings 
ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE marketplace_purchases 
ADD COLUMN IF NOT EXISTS buyer_auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS seller_auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update user_activity table
ALTER TABLE user_activity 
ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies for user_activity
DROP POLICY IF EXISTS "Enable read access for anonymous users on user_activity" ON user_activity;
DROP POLICY IF EXISTS "Enable insert access for anonymous users on user_activity" ON user_activity;
DROP POLICY IF EXISTS "Enable update access for anonymous users on user_activity" ON user_activity;

CREATE POLICY "Users can view own activity"
  ON user_activity FOR SELECT
  USING (auth.uid() = auth_user_id OR auth.uid() = user_id::uuid);

CREATE POLICY "Users can insert own activity"
  ON user_activity FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id OR auth.uid() = user_id::uuid);

CREATE POLICY "Users can update own activity"
  ON user_activity FOR UPDATE
  USING (auth.uid() = auth_user_id OR auth.uid() = user_id::uuid);

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('sale', 'purchase', 'listing', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON chat_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_listings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_purchases TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_activity TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_user_id ON user_profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_chat_logs_auth_user_id ON chat_logs(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_auth_user_id ON marketplace_listings(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_buyer_auth_user_id ON marketplace_purchases(buyer_auth_user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_seller_auth_user_id ON marketplace_purchases(seller_auth_user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_auth_user_id ON user_activity(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_auth_user_id ON notifications(auth_user_id);