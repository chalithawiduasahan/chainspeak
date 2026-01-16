/*
  # Add conversation message fields to chat_logs table

  1. New Columns
    - `user_message` (text, stores the user's message)
    - `ai_reply` (text, stores the AI's reply)

  2. Update existing records
    - Set default values for existing records
*/

-- Add the missing columns to store actual conversation data
ALTER TABLE chat_logs 
ADD COLUMN IF NOT EXISTS user_message text,
ADD COLUMN IF NOT EXISTS ai_reply text;

-- Update any existing records with placeholder data
UPDATE chat_logs 
SET 
  user_message = COALESCE(user_message, 'Previous conversation data'),
  ai_reply = COALESCE(ai_reply, 'This conversation was saved before message storage was implemented')
WHERE user_message IS NULL OR ai_reply IS NULL;