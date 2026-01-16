/*
  # Create marketplace tables for ChainSpeak Vault Exchange

  1. New Tables
    - `marketplace_listings`
      - `id` (uuid, primary key)
      - `seller_user_id` (uuid, references user_profiles.id)
      - `seller_username` (text, display only, no foreign key)
      - `chat_session_id` (text, references chat_logs.session_id)
      - `title` (text)
      - `description` (text)
      - `price` (decimal)
      - `tags` (text array)
      - `is_anonymous` (boolean)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `marketplace_purchases`
      - `id` (uuid, primary key)
      - `buyer_user_id` (uuid, references user_profiles.id)
      - `buyer_username` (text, display only, no foreign key)
      - `listing_id` (uuid, references marketplace_listings.id)
      - `seller_user_id` (uuid, references user_profiles.id)
      - `seller_username` (text, display only, no foreign key)
      - `chat_session_id` (text)
      - `encryption_key` (text)
      - `purchase_price` (decimal)
      - `purchased_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for anonymous access (demo purposes)

  3. Performance
    - Add useful indexes
    - Add trigger for updated_at column
*/

-- Drop existing tables if they exist (for clean recreation)
DROP TABLE IF EXISTS marketplace_purchases CASCADE;
DROP TABLE IF EXISTS marketplace_listings CASCADE;

-- Create marketplace_listings table
CREATE TABLE marketplace_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_user_id uuid NOT NULL,
  seller_username text NOT NULL,
  chat_session_id text NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  price decimal(10,2) NOT NULL DEFAULT 0.00,
  tags text[] DEFAULT '{}',
  is_anonymous boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Foreign key constraints (only for IDs, not usernames)
  FOREIGN KEY (seller_user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Create marketplace_purchases table
CREATE TABLE marketplace_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_user_id uuid NOT NULL,
  buyer_username text NOT NULL,
  listing_id uuid NOT NULL,
  seller_user_id uuid NOT NULL,
  seller_username text NOT NULL,
  chat_session_id text NOT NULL,
  encryption_key text NOT NULL,
  purchase_price decimal(10,2) NOT NULL DEFAULT 0.00,
  purchased_at timestamptz DEFAULT now(),
  
  -- Foreign key constraints (only for IDs, not usernames)
  FOREIGN KEY (buyer_user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_purchases ENABLE ROW LEVEL SECURITY;

-- Grant permissions to anon role (for demo purposes)
GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_purchases TO anon;

-- Create RLS policies for marketplace_listings
CREATE POLICY "Enable read access for marketplace listings"
  ON marketplace_listings
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Enable insert access for marketplace listings"
  ON marketplace_listings
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Enable update access for marketplace listings"
  ON marketplace_listings
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for marketplace listings"
  ON marketplace_listings
  FOR DELETE
  TO anon
  USING (true);

-- Create RLS policies for marketplace_purchases
CREATE POLICY "Enable read access for marketplace purchases"
  ON marketplace_purchases
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Enable insert access for marketplace purchases"
  ON marketplace_purchases
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Enable update access for marketplace purchases"
  ON marketplace_purchases
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create performance indexes
CREATE INDEX idx_marketplace_listings_seller_user_id ON marketplace_listings(seller_user_id);
CREATE INDEX idx_marketplace_listings_seller_username ON marketplace_listings(seller_username);
CREATE INDEX idx_marketplace_listings_chat_session_id ON marketplace_listings(chat_session_id);
CREATE INDEX idx_marketplace_listings_is_active ON marketplace_listings(is_active);
CREATE INDEX idx_marketplace_listings_price ON marketplace_listings(price);
CREATE INDEX idx_marketplace_listings_tags ON marketplace_listings USING GIN(tags);
CREATE INDEX idx_marketplace_listings_created_at ON marketplace_listings(created_at DESC);

CREATE INDEX idx_marketplace_purchases_buyer_user_id ON marketplace_purchases(buyer_user_id);
CREATE INDEX idx_marketplace_purchases_buyer_username ON marketplace_purchases(buyer_username);
CREATE INDEX idx_marketplace_purchases_listing_id ON marketplace_purchases(listing_id);
CREATE INDEX idx_marketplace_purchases_seller_user_id ON marketplace_purchases(seller_user_id);
CREATE INDEX idx_marketplace_purchases_seller_username ON marketplace_purchases(seller_username);
CREATE INDEX idx_marketplace_purchases_chat_session_id ON marketplace_purchases(chat_session_id);
CREATE INDEX idx_marketplace_purchases_purchased_at ON marketplace_purchases(purchased_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for marketplace_listings updated_at
CREATE TRIGGER update_marketplace_listings_updated_at 
    BEFORE UPDATE ON marketplace_listings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE marketplace_listings IS 'Stores chat listings for the marketplace';
COMMENT ON TABLE marketplace_purchases IS 'Tracks purchases of chat listings';
COMMENT ON COLUMN marketplace_listings.seller_username IS 'Display name only, no foreign key constraint';
COMMENT ON COLUMN marketplace_purchases.buyer_username IS 'Display name only, no foreign key constraint';
COMMENT ON COLUMN marketplace_purchases.seller_username IS 'Display name only, no foreign key constraint';
COMMENT ON COLUMN marketplace_purchases.encryption_key IS 'Encryption key for accessing purchased chat content';