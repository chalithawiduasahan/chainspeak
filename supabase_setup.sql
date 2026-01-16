-- ============================================
-- ChainSpeak Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. USER PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname text UNIQUE NOT NULL,
  email text UNIQUE,
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_completed boolean DEFAULT false,
  avatar_url text,
  full_name text,
  bio text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

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

-- RLS policies for user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Service role can insert profiles" ON user_profiles;
CREATE POLICY "Service role can insert profiles"
  ON user_profiles FOR INSERT
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ============================================
-- 2. CHAT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  session_id text NOT NULL,
  exchange_order integer,
  user_message text,
  ai_reply text,
  cid text,
  algorand_tx_id text,
  encryption_key text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on chat_logs
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_logs
DROP POLICY IF EXISTS "Users can view own chat logs" ON chat_logs;
CREATE POLICY "Users can view own chat logs"
  ON chat_logs FOR SELECT
  USING (auth.uid() = auth_user_id OR auth.uid() = user_id::uuid);

DROP POLICY IF EXISTS "Users can insert own chat logs" ON chat_logs;
CREATE POLICY "Users can insert own chat logs"
  ON chat_logs FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id OR auth.uid() = user_id::uuid);

DROP POLICY IF EXISTS "Users can update own chat logs" ON chat_logs;
CREATE POLICY "Users can update own chat logs"
  ON chat_logs FOR UPDATE
  USING (auth.uid() = auth_user_id OR auth.uid() = user_id::uuid);

DROP POLICY IF EXISTS "Users can delete own chat logs" ON chat_logs;
CREATE POLICY "Users can delete own chat logs"
  ON chat_logs FOR DELETE
  USING (auth.uid() = auth_user_id OR auth.uid() = user_id::uuid);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON chat_logs TO authenticated;

-- Indexes for chat_logs
CREATE INDEX IF NOT EXISTS idx_chat_logs_username ON chat_logs(username);
CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON chat_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_logs_cid ON chat_logs(cid);
CREATE INDEX IF NOT EXISTS idx_chat_logs_algorand_tx_id ON chat_logs(algorand_tx_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_session_id ON chat_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_session_order ON chat_logs(session_id, exchange_order);
CREATE INDEX IF NOT EXISTS idx_chat_logs_auth_user_id ON chat_logs(auth_user_id);

-- ============================================
-- 3. MARKETPLACE LISTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_username text NOT NULL,
  chat_session_id text NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  price decimal(10,2) NOT NULL DEFAULT 0.00,
  tags text[] DEFAULT '{}',
  is_anonymous boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on marketplace_listings
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;

-- RLS policies for marketplace_listings
DROP POLICY IF EXISTS "Enable read access for marketplace listings" ON marketplace_listings;
CREATE POLICY "Enable read access for marketplace listings"
  ON marketplace_listings FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Enable insert access for marketplace listings" ON marketplace_listings;
CREATE POLICY "Enable insert access for marketplace listings"
  ON marketplace_listings FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for marketplace listings" ON marketplace_listings;
CREATE POLICY "Enable update access for marketplace listings"
  ON marketplace_listings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable delete access for marketplace listings" ON marketplace_listings;
CREATE POLICY "Enable delete access for marketplace listings"
  ON marketplace_listings FOR DELETE
  TO authenticated
  USING (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_listings TO authenticated;

-- Indexes for marketplace_listings
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller_user_id ON marketplace_listings(seller_user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller_username ON marketplace_listings(seller_username);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_chat_session_id ON marketplace_listings(chat_session_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_is_active ON marketplace_listings(is_active);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_price ON marketplace_listings(price);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_tags ON marketplace_listings USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_created_at ON marketplace_listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_auth_user_id ON marketplace_listings(auth_user_id);

-- ============================================
-- 4. MARKETPLACE PURCHASES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS marketplace_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  buyer_auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_username text NOT NULL,
  listing_id uuid NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  seller_user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  seller_auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_username text NOT NULL,
  chat_session_id text NOT NULL,
  encryption_key text NOT NULL,
  purchase_price decimal(10,2) NOT NULL DEFAULT 0.00,
  purchased_at timestamptz DEFAULT now()
);

-- Enable RLS on marketplace_purchases
ALTER TABLE marketplace_purchases ENABLE ROW LEVEL SECURITY;

-- RLS policies for marketplace_purchases
DROP POLICY IF EXISTS "Enable read access for marketplace purchases" ON marketplace_purchases;
CREATE POLICY "Enable read access for marketplace purchases"
  ON marketplace_purchases FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Enable insert access for marketplace purchases" ON marketplace_purchases;
CREATE POLICY "Enable insert access for marketplace purchases"
  ON marketplace_purchases FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for marketplace purchases" ON marketplace_purchases;
CREATE POLICY "Enable update access for marketplace purchases"
  ON marketplace_purchases FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_purchases TO authenticated;

-- Indexes for marketplace_purchases
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_buyer_user_id ON marketplace_purchases(buyer_user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_buyer_username ON marketplace_purchases(buyer_username);
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_listing_id ON marketplace_purchases(listing_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_seller_user_id ON marketplace_purchases(seller_user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_seller_username ON marketplace_purchases(seller_username);
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_chat_session_id ON marketplace_purchases(chat_session_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_purchased_at ON marketplace_purchases(purchased_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_buyer_auth_user_id ON marketplace_purchases(buyer_auth_user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_seller_auth_user_id ON marketplace_purchases(seller_auth_user_id);

-- ============================================
-- 5. USER ACTIVITY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  seconds_spent integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, date)
);

-- Enable RLS on user_activity
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_activity
DROP POLICY IF EXISTS "Users can view own activity" ON user_activity;
CREATE POLICY "Users can view own activity"
  ON user_activity FOR SELECT
  USING (auth.uid() = auth_user_id OR auth.uid() = user_id::uuid);

DROP POLICY IF EXISTS "Users can insert own activity" ON user_activity;
CREATE POLICY "Users can insert own activity"
  ON user_activity FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id OR auth.uid() = user_id::uuid);

DROP POLICY IF EXISTS "Users can update own activity" ON user_activity;
CREATE POLICY "Users can update own activity"
  ON user_activity FOR UPDATE
  USING (auth.uid() = auth_user_id OR auth.uid() = user_id::uuid);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON user_activity TO authenticated;

-- Indexes for user_activity
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_date ON user_activity(date);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_date ON user_activity(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_activity_auth_user_id ON user_activity(auth_user_id);

-- ============================================
-- 6. NOTIFICATIONS TABLE
-- ============================================
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
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_auth_user_id ON notifications(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- 7. HELPER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for marketplace_listings updated_at
DROP TRIGGER IF EXISTS update_marketplace_listings_updated_at ON marketplace_listings;
CREATE TRIGGER update_marketplace_listings_updated_at 
    BEFORE UPDATE ON marketplace_listings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_activity updated_at
DROP TRIGGER IF EXISTS update_user_activity_updated_at ON user_activity;
CREATE TRIGGER update_user_activity_updated_at
    BEFORE UPDATE ON user_activity
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE user_profiles IS 'Stores user profile information linked to Supabase Auth';
COMMENT ON TABLE chat_logs IS 'Stores encrypted chat conversations with IPFS CIDs and Algorand transaction IDs';
COMMENT ON TABLE marketplace_listings IS 'Stores chat listings for the marketplace';
COMMENT ON TABLE marketplace_purchases IS 'Tracks purchases of chat listings';
COMMENT ON TABLE user_activity IS 'Tracks user activity time spent on the platform';
COMMENT ON TABLE notifications IS 'Stores user notifications for sales, purchases, and system events';
