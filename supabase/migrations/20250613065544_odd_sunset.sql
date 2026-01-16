-- Add session_id column to chat_logs table for grouping conversations
ALTER TABLE chat_logs 
ADD COLUMN IF NOT EXISTS session_id text,
ADD COLUMN IF NOT EXISTS exchange_order integer;

-- Create index for better performance when querying by session_id
CREATE INDEX IF NOT EXISTS idx_chat_logs_session_id ON chat_logs(session_id);

-- Create index for ordering exchanges within a session
CREATE INDEX IF NOT EXISTS idx_chat_logs_session_order ON chat_logs(session_id, exchange_order);

-- Update existing records to have individual session IDs (for backward compatibility)
UPDATE chat_logs 
SET session_id = CONCAT('legacy-session-', id::text)
WHERE session_id IS NULL;