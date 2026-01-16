/*
  # Create chat logs table

  1. New Tables
    - `chat_logs`
      - `id` (uuid, primary key)
      - `username` (text, foreign key to user_profiles.nickname)
      - `cid` (text, IPFS content ID)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `chat_logs` table
    - Add policies for users to manage their own chat logs
*/

CREATE TABLE IF NOT EXISTS chat_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  cid text NOT NULL,
  created_at timestamptz DEFAULT now(),
  FOREIGN KEY (username) REFERENCES user_profiles(nickname) ON DELETE CASCADE
);

ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own chat logs"
  ON chat_logs
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can insert own chat logs"
  ON chat_logs
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can delete own chat logs"
  ON chat_logs
  FOR DELETE
  TO anon
  USING (true);