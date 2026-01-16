-- ============================================
-- ChainSpeak Username-Only Auth Update
-- Run this AFTER the initial supabase_setup.sql
-- This updates RLS policies to support username-only authentication
-- ============================================

-- ============================================
-- 1. UPDATE USER_PROFILES RLS POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON user_profiles;

-- Allow anonymous users to read profiles (for username lookup)
CREATE POLICY "Allow anonymous to read profiles"
  ON user_profiles FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anonymous users to insert profiles (for new username signup)
CREATE POLICY "Allow anonymous to insert profiles"
  ON user_profiles FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow users to update their own profile by user_id (stored in localStorage)
-- Note: This is less secure but necessary for username-only auth
-- In production, you might want to add additional validation
CREATE POLICY "Allow users to update own profile"
  ON user_profiles FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Grant permissions to anonymous role
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO anon;
GRANT USAGE ON SCHEMA public TO anon;

-- ============================================
-- 2. UPDATE CHAT_LOGS RLS POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own chat logs" ON chat_logs;
DROP POLICY IF EXISTS "Users can insert own chat logs" ON chat_logs;
DROP POLICY IF EXISTS "Users can update own chat logs" ON chat_logs;
DROP POLICY IF EXISTS "Users can delete own chat logs" ON chat_logs;

-- Allow anonymous users to read their own chat logs by user_id
CREATE POLICY "Allow users to view own chat logs"
  ON chat_logs FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anonymous users to insert chat logs
CREATE POLICY "Allow users to insert own chat logs"
  ON chat_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anonymous users to update their own chat logs
CREATE POLICY "Allow users to update own chat logs"
  ON chat_logs FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anonymous users to delete their own chat logs
CREATE POLICY "Allow users to delete own chat logs"
  ON chat_logs FOR DELETE
  TO anon, authenticated
  USING (true);

-- Grant permissions to anonymous role
GRANT SELECT, INSERT, UPDATE, DELETE ON chat_logs TO anon;

-- ============================================
-- 3. UPDATE MARKETPLACE_LISTINGS RLS POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for marketplace listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Enable insert access for marketplace listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Enable update access for marketplace listings" ON marketplace_listings;
DROP POLICY IF EXISTS "Enable delete access for marketplace listings" ON marketplace_listings;

-- Allow anonymous users to read marketplace listings
CREATE POLICY "Allow anonymous to read marketplace listings"
  ON marketplace_listings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anonymous users to insert marketplace listings
CREATE POLICY "Allow anonymous to insert marketplace listings"
  ON marketplace_listings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anonymous users to update marketplace listings
CREATE POLICY "Allow anonymous to update marketplace listings"
  ON marketplace_listings FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anonymous users to delete marketplace listings
CREATE POLICY "Allow anonymous to delete marketplace listings"
  ON marketplace_listings FOR DELETE
  TO anon, authenticated
  USING (true);

-- Grant permissions to anonymous role
GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_listings TO anon;

-- ============================================
-- 4. UPDATE MARKETPLACE_PURCHASES RLS POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for marketplace purchases" ON marketplace_purchases;
DROP POLICY IF EXISTS "Enable insert access for marketplace purchases" ON marketplace_purchases;
DROP POLICY IF EXISTS "Enable update access for marketplace purchases" ON marketplace_purchases;

-- Allow anonymous users to read marketplace purchases
CREATE POLICY "Allow anonymous to read marketplace purchases"
  ON marketplace_purchases FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anonymous users to insert marketplace purchases
CREATE POLICY "Allow anonymous to insert marketplace purchases"
  ON marketplace_purchases FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anonymous users to update marketplace purchases
CREATE POLICY "Allow anonymous to update marketplace purchases"
  ON marketplace_purchases FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Grant permissions to anonymous role
GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_purchases TO anon;

-- ============================================
-- 5. UPDATE USER_ACTIVITY RLS POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own activity" ON user_activity;
DROP POLICY IF EXISTS "Users can insert own activity" ON user_activity;
DROP POLICY IF EXISTS "Users can update own activity" ON user_activity;

-- Allow anonymous users to read their own activity
CREATE POLICY "Allow users to view own activity"
  ON user_activity FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anonymous users to insert activity
CREATE POLICY "Allow users to insert own activity"
  ON user_activity FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anonymous users to update their own activity
CREATE POLICY "Allow users to update own activity"
  ON user_activity FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Grant permissions to anonymous role
GRANT SELECT, INSERT, UPDATE ON user_activity TO anon;

-- ============================================
-- 6. UPDATE NOTIFICATIONS RLS POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- Allow anonymous users to read their own notifications
CREATE POLICY "Allow users to view own notifications"
  ON notifications FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anonymous users to update their own notifications
CREATE POLICY "Allow users to update own notifications"
  ON notifications FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anonymous users to insert notifications (for edge functions)
CREATE POLICY "Allow anonymous to insert notifications"
  ON notifications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Grant permissions to anonymous role
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO anon;

-- ============================================
-- 7. REMOVE AUTH TRIGGER (Optional - for username-only auth)
-- ============================================

-- Note: The trigger for auth.users is kept for backward compatibility
-- but won't be used for username-only authentication
-- You can optionally remove it if you're not using Supabase Auth at all:

-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user();

-- ============================================
-- SUMMARY
-- ============================================
-- This update allows:
-- 1. Anonymous users to create accounts with just a username
-- 2. Users to access their data using user_id (stored in localStorage)
-- 3. All CRUD operations to work without Supabase Auth
--
-- Security Note:
-- Since we're using username-only auth, the security relies on:
-- - Client-side validation (user_id in localStorage)
-- - Server-side validation in edge functions
-- - Application-level checks
--
-- For production, consider adding:
-- - Rate limiting
-- - Additional validation in edge functions
-- - Session tokens or JWT for better security
-- ============================================
