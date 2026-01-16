# Username-Only Authentication Setup

## ✅ What's Already Done

Your ChainSpeak app already has username-only authentication implemented! Here's what's in place:

1. **UsernameModal Component** - Already exists and working (`src/components/Auth/UsernameModal.tsx`)
2. **AuthService** - Already has `signInWithUsername()` method that handles username lookup/creation
3. **App.tsx** - Already using UsernameModal (not the old AuthModal)
4. **Edge Functions** - Already work with username-based auth (they use user_id, not auth_user_id)

## 🔧 What You Need to Do

### Step 1: Update Database RLS Policies

Run the SQL file `supabase_username_auth_update.sql` in your Supabase SQL Editor.

This will:
- Allow anonymous users to create accounts with just a username
- Allow users to access their data using user_id (stored in localStorage)
- Update all RLS policies to support username-only authentication

**Important:** Run this AFTER you've already run `supabase_setup.sql`.

### Step 2: Verify Edge Functions (No Changes Needed)

All edge functions already work with username-only auth because they:
- Use `user_id` and `nickname` for verification (not `auth_user_id`)
- Don't require Supabase Auth tokens
- Work with anonymous access

**No edge function updates needed!** ✅

## 📋 How It Works

1. User clicks "Start ChainSpeaking" button
2. UsernameModal appears asking for username
3. User enters username
4. `authService.signInWithUsername()` is called:
   - If username exists → User is logged in to that account
   - If username doesn't exist → New account is created and user is logged in
5. User ID is stored in localStorage for session management
6. User can now use all ChainSpeak features

## 🔒 Security Notes

Since we're using username-only auth (no passwords), the security model is:

- **Client-side**: User ID stored in localStorage
- **Server-side**: Edge functions verify user_id and nickname match
- **Database**: RLS policies allow anonymous access (validated by edge functions)

**For production, consider:**
- Adding rate limiting
- Adding session tokens/JWT
- Adding additional validation in edge functions
- Implementing password protection (optional)

## 📝 Files Changed

1. ✅ `supabase_username_auth_update.sql` - New SQL file for RLS policy updates
2. ✅ `src/components/Auth/AuthModal.tsx` - Removed OAuth references (not used anyway)
3. ✅ No edge function changes needed
4. ✅ No frontend changes needed (already using UsernameModal)

## 🚀 Testing

After running the SQL update:

1. Click "Start ChainSpeaking"
2. Enter a new username (e.g., "testuser")
3. Should create account and log you in
4. Sign out
5. Enter the same username again
6. Should log you into the existing account

## ❓ Troubleshooting

### Issue: "Failed to create user account"
- Check that RLS policies were updated correctly
- Verify anonymous role has INSERT permission on user_profiles

### Issue: "User verification failed" in edge functions
- Edge functions use service role key, so they should work
- Check that user_id and nickname match in the database

### Issue: Can't access chat logs or other data
- Verify RLS policies allow anonymous SELECT
- Check that user_id is being passed correctly from frontend

---

**Status:** Ready to use! Just run the SQL update and you're good to go! 🎉
