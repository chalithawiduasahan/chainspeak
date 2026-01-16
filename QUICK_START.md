# ChainSpeak Quick Start Guide

## 🚀 Quick Setup Steps

### 1. Database Setup (5 minutes)
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the entire contents of `supabase_setup.sql`
3. Click **Run**

### 2. Deploy Edge Functions (10 minutes)

Deploy each function using the Supabase CLI:

```bash
# Function 1: AI Chat (Gemini)
supabase functions deploy chat-with-claude

# Function 2: Save to Blockchain
supabase functions deploy save-conversation-to-blockchain

# Function 3: Create Listing
supabase functions deploy create-marketplace-listing

# Function 4: Purchase Chat
supabase functions deploy purchase-chat

# Function 5: Update Nickname
supabase functions deploy update-user-nickname
```

**OR** deploy via Supabase Dashboard:
1. Go to **Edge Functions** → **Create Function**
2. For each function, create a new function with the name and copy-paste the code from `supabase/functions/[function-name]/index.ts`

### 3. Configure Secrets (5 minutes)

Go to **Project Settings** → **Edge Functions** → **Secrets** and add:

#### Required for All Functions:
```
SUPABASE_URL = https://hzukkzgfdmosztepvuyk.supabase.co
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6dWtremdmZG1vc3p0ZXB2dXlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODE5MDc3MSwiZXhwIjoyMDgzNzY2NzcxfQ.CO3_0ReE4hJzSqpdsOlkrBIwhp0rEqKjs_e06DH5fA0
```

#### For chat-with-claude:
```
GEMINI_API_KEY = AIzaSyC54t9byG4qLfIY0TR4Ac2RN2_qN3ztgxU
```

#### For save-conversation-to-blockchain:
```
PINATA_JWT = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjOTBkODE4Yi1lMjkyLTRjYTAtYjFjMy1mZjI3OWY3ZTYxMDgiLCJlbWFpbCI6ImNoYWxpdGhhd2lkdXNhaGFuQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI4NTg0NDM0OTY3ZWFmNTZiYjgxNSIsInNjb3BlZEtleVNlY3JldCI6ImIzN2RlZDA4OTE3YTQ4YTEzODJiYTkxNGE4OTNkYTQ3MjY0ZDA0OTA2YjkwY2Y0NTNkNGNjNGY5MzlhMjI4MDMiLCJleHAiOjE3OTk1ODAzNjZ9.ij3rGJWBxDvbn1VWbRbSA4raRPHu3Qz-CEviyOaQI

ALGORAND_MNEMONIC = post, claim, try, romance, youth, film, van, apology, fringe, wood, unhappy, enough, bean, climb, spray, pond, worry, snow, foil, scrap, census, valve, limb, abandon, cart

ALGORAND_RPC_URL = https://testnet-api.algonode.cloud
```

**Optional (if JWT doesn't work):**
```
PINATA_API_KEY = 8584434967eaf56bb815
PINATA_SECRET_API_KEY = b37ded08917a48a1382ba914a893da47264d04906b90cf453d4cc4f939a22803
```

---

## 📁 Edge Function Locations

All edge functions are already in your codebase. Here's where to find them:

1. **chat-with-claude** → `supabase/functions/chat-with-claude/index.ts`
2. **save-conversation-to-blockchain** → `supabase/functions/save-conversation-to-blockchain/index.ts`
3. **create-marketplace-listing** → `supabase/functions/create-marketplace-listing/index.ts`
4. **purchase-chat** → `supabase/functions/purchase-chat/index.ts`
5. **update-user-nickname** → `supabase/functions/update-user-nickname/index.ts`

---

## ✅ Verification

After setup, verify:

1. ✅ Database tables created (check SQL Editor → Table Editor)
2. ✅ All 5 edge functions deployed (check Edge Functions dashboard)
3. ✅ All secrets configured (check Edge Functions → Secrets)
4. ✅ Test AI chat works
5. ✅ Test conversation saving works

---

## 🔑 Encryption Key

**Default Key (for reference):**
```
chainspeak-secure-encryption-key-2024-32chars
```

**Note:** The app generates a unique encryption key per chat session automatically, which is the most secure approach. You don't need to configure this separately.

---

## 📝 What Changed

### AI Chat Integration
- ✅ Replaced rule-based AI with Gemini API
- ✅ Updated `chat-with-claude` edge function to use Gemini
- ✅ Updated frontend to call Gemini edge function
- ✅ Removed old rule-based assistant code

### Algorand Configuration
- ✅ Updated to use Algorand Testnet (free tier)
- ✅ Changed RPC URL to testnet endpoint
- ✅ Configured for testnet transactions

### Pinata Integration
- ✅ Added JWT support (preferred method)
- ✅ Maintained API key support as fallback

---

## 🆘 Need Help?

See `SUPABASE_SETUP_GUIDE.md` for detailed documentation.

---

**Setup Time:** ~20 minutes
**Difficulty:** Easy
**Status:** Ready to deploy! 🚀
