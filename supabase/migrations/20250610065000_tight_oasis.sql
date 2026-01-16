/*
  # Grant permissions to anonymous users for chat_logs

  1. Permissions
    - Grant SELECT permission on chat_logs to anon role
    - Grant INSERT permission on chat_logs to anon role
    - Grant DELETE permission on chat_logs to anon role
*/

GRANT SELECT ON chat_logs TO anon;
GRANT INSERT ON chat_logs TO anon;
GRANT DELETE ON chat_logs TO anon;