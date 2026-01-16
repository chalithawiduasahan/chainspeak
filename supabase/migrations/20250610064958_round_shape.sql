/*
  # Grant permissions to anonymous users for user_profiles

  1. Permissions
    - Grant INSERT permission on user_profiles to anon role
    - Grant SELECT permission on user_profiles to anon role
    - Grant DELETE permission on user_profiles to anon role
*/

GRANT SELECT ON user_profiles TO anon;
GRANT INSERT ON user_profiles TO anon;
GRANT DELETE ON user_profiles TO anon;