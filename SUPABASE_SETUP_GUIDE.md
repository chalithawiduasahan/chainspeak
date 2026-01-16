# ChainSpeak Supabase Setup Guide

This guide will help you set up your Supabase project with all required tables, edge functions, and secrets.

## 📋 Table of Contents
1. [Database Setup](#database-setup)
2. [Edge Functions](#edge-functions)
3. [Secrets Configuration](#secrets-configuration)
4. [Encryption Key](#encryption-key)

---

## 🗄️ Database Setup

### Step 1: Run SQL Schema
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase_setup.sql` from this repository
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run** to execute

This will create all required tables:
- `user_profiles` - User account information
- `chat_logs` - Encrypted chat conversations
- `marketplace_listings` - Chat listings for sale
- `marketplace_purchases` - Purchase records
- `user_activity` - User activity tracking
- `notifications` - User notifications

---

## ⚡ Edge Functions

You need to deploy 5 edge functions. Each function is located in `supabase/functions/[function-name]/index.ts`.

### Function 1: `chat-with-claude`
**Purpose:** Handles AI chat using Gemini API

**Deployment:**
```bash
supabase functions deploy chat-with-claude
```

**Code Location:** `supabase/functions/chat-with-claude/index.ts`

**Required Secrets:**
- `GEMINI_API_KEY` - Your Gemini API key

---

### Function 2: `save-conversation-to-blockchain`
**Purpose:** Saves encrypted conversations to IPFS (Pinata) and Algorand blockchain

**Deployment:**
```bash
supabase functions deploy save-conversation-to-blockchain
```

**Code Location:** `supabase/functions/save-conversation-to-blockchain/index.ts`

**Required Secrets:**
- `PINATA_API_KEY` - Pinata API key (or use JWT)
- `PINATA_SECRET_API_KEY` - Pinata secret API key (or use JWT)
- `PINATA_JWT` - Pinata JWT token (preferred, more secure)
- `ALGORAND_MNEMONIC` - Your 25-word Algorand mnemonic
- `ALGORAND_RPC_URL` - Algorand RPC URL (defaults to testnet)
- `ALGORAND_API_KEY` - Algorand API key (optional for testnet)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

---

### Function 3: `create-marketplace-listing`
**Purpose:** Creates a new marketplace listing for a chat session

**Deployment:**
```bash
supabase functions deploy create-marketplace-listing
```

**Code Location:** `supabase/functions/create-marketplace-listing/index.ts`

**Required Secrets:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

---

### Function 4: `purchase-chat`
**Purpose:** Handles the purchase of a chat listing

**Deployment:**
```bash
supabase functions deploy purchase-chat
```

**Code Location:** `supabase/functions/purchase-chat/index.ts`

**Required Secrets:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

---

### Function 5: `update-user-nickname`
**Purpose:** Updates user nickname across all related tables

**Deployment:**
```bash
supabase functions deploy update-user-nickname
```

**Code Location:** `supabase/functions/update-user-nickname/index.ts`

**Required Secrets:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

---

## 🔐 Secrets Configuration

### How to Add Secrets in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** → **Edge Functions** → **Secrets**
3. Click **Add new secret**
4. Enter the secret name and value
5. Click **Save**

### Required Secrets List

#### Supabase Configuration
- **SUPABASE_URL**: `https://hzukkzgfdmosztepvuyk.supabase.co`
- **SUPABASE_SERVICE_ROLE_KEY**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6dWtremdmZG1vc3p0ZXB2dXlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODE5MDc3MSwiZXhwIjoyMDgzNzY2NzcxfQ.CO3_0ReE4hJzSqpdsOlkrBIwhp0rEqKjs_e06DH5fA0`

#### Gemini AI
- **GEMINI_API_KEY**: `AIzaSyC54t9byG4qLfIY0TR4Ac2RN2_qN3ztgxU`

#### Pinata IPFS (Use JWT - Recommended)
- **PINATA_JWT**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjOTBkODE4Yi1lMjkyLTRjYTAtYjFjMy1mZjI3OWY3ZTYxMDgiLCJlbWFpbCI6ImNoYWxpdGhhd2lkdXNhaGFuQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI4NTg0NDM0OTY3ZWFmNTZiYjgxNSIsInNjb3BlZEtleVNlY3JldCI6ImIzN2RlZDA4OTE3YTQ4YTEzODJiYTkxNGE4OTNkYTQ3MjY0ZDA0OTA2YjkwY2Y0NTNkNGNjNGY5MzlhMjI4MDMiLCJleHAiOjE3OTk1ODAzNjZ9.ij3rGJWBxDvbn1VWbRbSA4raRPHu3Qz-CEviyOaQI`

#### Pinata IPFS (Alternative - API Keys)
If you prefer to use API keys instead of JWT:
- **PINATA_API_KEY**: `8584434967eaf56bb815`
- **PINATA_SECRET_API_KEY**: `b37ded08917a48a1382ba914a893da47264d04906b90cf453d4cc4f939a22803`

#### Algorand (Testnet - Free Tier)
- **ALGORAND_MNEMONIC**: `post, claim, try, romance, youth, film, van, apology, fringe, wood, unhappy, enough, bean, climb, spray, pond, worry, snow, foil, scrap, census, valve, limb, abandon, cart`
- **ALGORAND_RPC_URL**: `https://testnet-api.algonode.cloud` (default, can be omitted)
- **ALGORAND_API_KEY**: (optional for testnet, can be empty string)

---

## 🔑 Encryption Key

A default encryption key has been generated for your reference. **IMPORTANT:** In production, you should generate your own secure encryption key.

### Generated Encryption Key
```
chainspeak-secure-encryption-key-2024-32chars
```

### How to Generate Your Own Encryption Key

For security, generate a random 32-character encryption key:

**Option 1: Using OpenSSL (Command Line)**
```bash
openssl rand -base64 32
```

**Option 2: Using Node.js**
```javascript
const crypto = require('crypto');
const key = crypto.randomBytes(32).toString('base64');
console.log(key);
```

**Option 3: Using Online Generator**
Visit: https://www.random.org/strings/ and generate a 32-character alphanumeric string.

### Storing the Encryption Key

The encryption key is used client-side for encrypting conversations before they're sent to the blockchain. You can:

1. Store it in your `.env` file (for development)
2. Store it securely in your environment variables (for production)
3. Generate it per-session (most secure, but requires key management)

**Note:** The current implementation generates a unique encryption key per chat session, which is the most secure approach.

---

## 📝 Edge Function Code Snippets

### 1. chat-with-claude/index.ts
```typescript
// See: supabase/functions/chat-with-claude/index.ts
// This function uses Gemini API to handle AI chat
```

### 2. save-conversation-to-blockchain/index.ts
```typescript
// See: supabase/functions/save-conversation-to-blockchain/index.ts
// This function encrypts conversations, uploads to Pinata IPFS, and stores on Algorand
```

### 3. create-marketplace-listing/index.ts
```typescript
// See: supabase/functions/create-marketplace-listing/index.ts
// This function creates marketplace listings for chat sessions
```

### 4. purchase-chat/index.ts
```typescript
// See: supabase/functions/purchase-chat/index.ts
// This function handles chat purchase transactions
```

### 5. update-user-nickname/index.ts
```typescript
// See: supabase/functions/update-user-nickname/index.ts
// This function updates user nicknames across all tables
```

---

## 🚀 Deployment Steps Summary

1. **Run SQL Schema**
   - Copy `supabase_setup.sql` to Supabase SQL Editor
   - Execute the script

2. **Deploy Edge Functions**
   ```bash
   supabase functions deploy chat-with-claude
   supabase functions deploy save-conversation-to-blockchain
   supabase functions deploy create-marketplace-listing
   supabase functions deploy purchase-chat
   supabase functions deploy update-user-nickname
   ```

3. **Configure Secrets**
   - Add all required secrets in Supabase Dashboard
   - Use the values provided in this document

4. **Test the Setup**
   - Test AI chat functionality
   - Test conversation saving
   - Test marketplace features

---

## 🔍 Verification Checklist

- [ ] SQL schema executed successfully
- [ ] All 5 edge functions deployed
- [ ] All secrets configured in Supabase
- [ ] Gemini API key working
- [ ] Pinata IPFS uploads working
- [ ] Algorand testnet transactions working
- [ ] Frontend can call edge functions
- [ ] Conversations are being saved and encrypted

---

## 🆘 Troubleshooting

### Edge Function Errors
- Check that all secrets are properly set
- Verify secret names match exactly (case-sensitive)
- Check function logs in Supabase Dashboard

### Database Errors
- Ensure RLS policies are correctly set
- Verify foreign key constraints
- Check that auth.users table exists (created by Supabase Auth)

### Algorand Errors
- Verify mnemonic is correct (25 words)
- Check that you have testnet ALGOs in your wallet
- Ensure RPC URL is correct for testnet

### Pinata Errors
- Verify JWT token is valid and not expired
- Check API key permissions
- Ensure file size limits are not exceeded

---

## 📚 Additional Resources

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Pinata Documentation](https://docs.pinata.cloud/)
- [Algorand Testnet Documentation](https://developer.algorand.org/docs/get-details/algorand-networks/testnet/)

---

**Last Updated:** 2024
**Project:** ChainSpeak
**Database:** Supabase
**Blockchain:** Algorand Testnet
**Storage:** Pinata IPFS
**AI:** Google Gemini
