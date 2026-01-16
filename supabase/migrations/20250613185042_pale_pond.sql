/*
  # Add missing exchange_order column to chat_logs table

  1. Changes
    - Add `exchange_order` column to track the order of exchanges within a session
    - Add indexes for better performance when querying by session_id and exchange_order
    - Update existing records to have proper session IDs for backward compatibility

  2. Table Structure After Migration
    - `id` (existing)
    - `cid` (existing) 
    - `created_at` (existing)
    - `username` (existing)
    - `algorand_tx_id` (existing)
    - `user_message` (existing)
    - `ai_reply` (existing)
    - `session_id` (existing)
    - `exchange_order` (new) - integer to track order of exchanges within a session

  3. Indexes
    - Index on session_id for better session queries
    - Composite index on session_id and exchange_order for ordering exchanges
*/

-- Add exchange_order column if it doesn't exist
ALTER TABLE chat_logs 
ADD COLUMN IF NOT EXISTS exchange_order integer;

-- Create index for better performance when querying by session_id (if not exists)
CREATE INDEX IF NOT EXISTS idx_chat_logs_session_id ON chat_logs(session_id);

-- Create index for ordering exchanges within a session (if not exists)
CREATE INDEX IF NOT EXISTS idx_chat_logs_session_order ON chat_logs(session_id, exchange_order);

-- Update existing records to have individual session IDs for backward compatibility
UPDATE chat_logs 
SET session_id = CONCAT('legacy-session-', id::text)
WHERE session_id IS NULL;

-- Update existing records to have exchange_order = 1 for backward compatibility
UPDATE chat_logs 
SET exchange_order = 1
WHERE exchange_order IS NULL;