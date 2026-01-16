/*
  # Create marketplace tables for Vault Exchange

  1. New Tables
    - `marketplace_listings`
      - `id` (uuid, primary key)
      - `seller_user_id` (uuid, references user_profiles.id)
      - `seller_username` (text, references user_profiles.nickname)
      - `chat_session_id` (text, references chat_logs.session_id)
      - `title` (text, listing title)
      - `description` (text, listing description)
      - `price` (decimal, price in USD)
      - `tags` (text array, searchable tags)
      - `is_anonymous` (boolean, whether seller wants to be anonymous)
      - `is_active` (boolean, whether listing is active)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `marketplace_purchases`
      - `id` (uuid, primary key)
      - `buyer_user_id` (uuid, references user_profiles.id)
      - `buyer_username` (text, references user_profiles.nickname)
      - `listing_id` (uuid, references marketplace_listings.id)
      - `seller_user_id` (uuid, references user_profiles.id)
      - `seller_username` (text)
      - `chat_session_id` (text)
      - `encryption_key` (text, for buyer to decrypt the chat)
      - `purchase_price` (decimal, price paid)
      - `purchased_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for anonymous access

  3. Indexes
    - Add indexes for better performance
*/

-- Create marketplace_listings table
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_user_id uuid NOT NULL,
  seller_username text NOT NULL,
  chat_session_id text NOT NULL,
  title text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL DEFAULT 0.00,
  tags text[] DEFAULT '{}',
  is_anonymous boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  FOREIGN KEY (seller_user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_username) REFERENCES user_profiles(nickname) ON DELETE CASCADE
);

-- Create marketplace_purchases table
CREATE TABLE IF NOT EXISTS marketplace_purchases (
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
  FOREIGN KEY (buyer_user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (buyer_username) REFERENCES user_profiles(nickname) ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_purchases ENABLE ROW LEVEL SECURITY;

-- Grant permissions to anon role
GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON marketplace_purchases TO anon;

-- Create policies for marketplace_listings
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

-- Create policies for marketplace_purchases
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller ON marketplace_listings(seller_user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_active ON marketplace_listings(is_active);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_price ON marketplace_listings(price);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_tags ON marketplace_listings USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_created ON marketplace_listings(created_at);

CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_buyer ON marketplace_purchases(buyer_user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_seller ON marketplace_purchases(seller_user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_listing ON marketplace_purchases(listing_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_session ON marketplace_purchases(chat_session_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_date ON marketplace_purchases(purchased_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for marketplace_listings
CREATE TRIGGER update_marketplace_listings_updated_at 
    BEFORE UPDATE ON marketplace_listings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();