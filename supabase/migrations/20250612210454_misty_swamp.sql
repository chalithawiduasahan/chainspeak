/*
  # Create chat logs table for blockchain integration

  1. New Tables
    - `chat_logs`
      - `id` (uuid, primary key)
      - `username` (text, references user_profiles.nickname)
      - `cid` (text, IPFS content ID)
      - `algorand_tx_id` (text, Algorand transaction ID)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `chat_logs` table
    - Add policies for anonymous access
    
  3. Indexes
    - Add indexes for better performance
*/

-- Create chat_logs table
CREATE TABLE IF NOT EXISTS chat_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  cid text NOT NULL,
  algorand_tx_id text,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraint to user_profiles if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    ALTER TABLE chat_logs 
    ADD CONSTRAINT chat_logs_username_fkey 
    FOREIGN KEY (username) REFERENCES user_profiles(nickname) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- Grant permissions to anon role
GRANT SELECT, INSERT, UPDATE, DELETE ON chat_logs TO anon;

-- Create policies for anonymous access
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_logs_username ON chat_logs(username);
CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON chat_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_logs_cid ON chat_logs(cid);
CREATE INDEX IF NOT EXISTS idx_chat_logs_algorand_tx_id ON chat_logs(algorand_tx_id);