# Database Setup Instructions

## Problem
The application is failing with 404 errors when trying to access the `chat_logs` table because it doesn't exist in your Supabase database yet.

## Solution
You need to run the migration SQL in your Supabase project dashboard:

### Steps:
1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** section (in the left sidebar)
3. Click **"New Query"**
4. Copy the entire content from `supabase/migrations/20250610102112_shrill_valley.sql`
5. Paste it into the SQL Editor
6. Click **"Run"** to execute the migration

### What this migration does:
- Creates the `user_profiles` table (if it doesn't exist)
- Creates the `chat_logs` table with proper foreign key relationships
- Sets up Row Level Security (RLS) policies
- Grants necessary permissions to the anonymous role
- Creates indexes for better performance

### After running the migration:
- The chat functionality will work properly
- Users can save conversations to the blockchain
- Chat history will be retrievable from the database

## Alternative: Manual Setup
If you prefer to run the commands individually, here are the key tables that need to be created:

```sql
-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname text UNIQUE NOT NULL,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now()
);

-- Chat logs table
CREATE TABLE IF NOT EXISTS chat_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  cid text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

The migration file contains all the necessary RLS policies and permissions.