
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import algosdk from 'https://esm.sh/algosdk@2.7.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// --- Encryption: Stays the same ---
async function encryptConversationData(data, encryptionKey) {
  encryptionKey = encryptionKey || 'default-32-character-key-for-dev';
  try {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(encryptionKey.padEnd(32, '0').slice(0, 32)),
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = encoder.encode(JSON.stringify(data));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      keyMaterial,
      encodedData
    );
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt conversation data');
  }
}

// --- Pinata Upload: Reads keys from env ---
async function uploadToPinata(encryptedData, filename) {
  console.log('📤 Initializing Pinata upload...');
  const pinataJWT = Deno.env.get('PINATA_JWT');

  let headers;
  if (pinataJWT) {
    console.log('Using Pinata JWT for authentication.');
    headers = { 'Authorization': `Bearer ${pinataJWT}` };
  } else {
    const pinataApiKey = Deno.env.get('PINATA_API_KEY');
    const pinataSecretApiKey = Deno.env.get('PINATA_SECRET_API_KEY');
    if (!pinataApiKey || !pinataSecretApiKey) {
      throw new Error('Pinata credentials not found. Set PINATA_JWT or both PINATA_API_KEY and PINATA_SECRET_API_KEY.');
    }
    console.log('Using Pinata API Keys for authentication.');
    headers = {
      'pinata_api_key': pinataApiKey,
      'pinata_secret_api_key': pinataSecretApiKey,
    };
  }

  const formData = new FormData();
  const blob = new Blob([encryptedData], { type: 'application/json' });
  formData.append('file', blob, filename);
  const metadata = JSON.stringify({
    name: filename,
    keyvalues: { platform: 'chainspeak', type: 'conversation_session', encrypted: 'true' },
  });
  formData.append('pinataMetadata', metadata);
  formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pinata upload failed: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ Successfully uploaded to Pinata IPFS:', result.IpfsHash);
  return result.IpfsHash;
}

// --- Algorand Storage: Uses Base64 secret key ---
async function storeOnAlgorand(cid, username, sessionId) {
  console.log('⛓️ Initializing Algorand transaction...');
  const rpcUrl = Deno.env.get('ALGORAND_RPC_URL') || 'https://testnet-api.algonode.cloud';
  const skB64 = Deno.env.get('ALGORAND_SECRET_KEY_BASE64');

if (!skB64) {
  throw new Error('ALGORAND_SECRET_KEY_BASE64 is not set in environment variables.');
}

// Decode Base64 secret key to Uint8Array (trim/remove whitespace just in case)
const cleaned = skB64.trim().replace(/\s+/g, '');
const sk = Uint8Array.from(atob(cleaned), (c) => c.charCodeAt(0));

// Algorand secret keys should be 64 bytes (ed25519 secret key)
if (sk.length !== 64) {
  throw new Error(`Invalid Algorand secret key length: ${sk.length}. Expected 64 bytes.`);
}

const account = algosdk.secretKeyToAccount(sk);

const url = new URL(rpcUrl);
const baseServer = `${url.protocol}//${url.hostname}`;
const port = url.port ? Number(url.port) : (url.protocol === 'https:' ? 443 : 80);

// Algonode usually needs no API key. If you use a provider that requires one,
// set ALGORAND_API_KEY and we pass it as a header.
const apiKey = Deno.env.get('ALGORAND_API_KEY');
const token = apiKey ? { 'X-API-Key': apiKey } : '';

const algodClient = new algosdk.Algodv2(token as any, baseServer, port);

  const suggestedParams = await algodClient.getTransactionParams().do();
  const noteData = {
    type: 'chainspeak_chat_session',
    cid,
    username,
    sessionId,
    timestamp: new Date().toISOString(),
    version: '2.0',
    platform: 'chainspeak',
  };

  const note = new TextEncoder().encode(JSON.stringify(noteData));
  if (note.length > 1024) {
    throw new Error('Note data too large for Algorand transaction (max 1024 bytes)');
  }

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: account.addr,
    to: account.addr, // Self-transaction
    amount: 0,
    note: note,
    suggestedParams: suggestedParams,
  });

  const signedTxn = txn.signTxn(account.sk);
  const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
  await algosdk.waitForConfirmation(algodClient, txId, 10);

  console.log('✅ Successfully stored on Algorand testnet:', txId);
  return txId;
}

// --- Main Server Handler ---
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ ok: true, fn: 'save-conversations-to-blockchain' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }  

  const isDebug = Deno.env.get('DEBUG') === 'true';
  let stage = 'initialization';

  try {
    const { sessionId, username, conversationExchanges, encryption_key } = await req.json();
    if (!sessionId || !username || !conversationExchanges || !Array.isArray(conversationExchanges) || conversationExchanges.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing or invalid required fields: sessionId, username, conversationExchanges' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const conversationData = {
      username,
      sessionId,
      exchanges: conversationExchanges,
      createdAt: new Date().toISOString(),
      totalExchanges: conversationExchanges.length,
    };

    // 1. Encrypt Data
    stage = 'encryption';
    console.log(`🔒 Encrypting conversation data for session: ${sessionId}`);
    const encryptedData = await encryptConversationData(conversationData, encryption_key);
    console.log('✅ Encryption successful.');

    // 2. Upload to Pinata
    stage = 'pinata_upload';
    const filename = `chainspeak-session-${sessionId}-${Date.now()}.json`;
    const cid = await uploadToPinata(encryptedData, filename);

    // 3. Anchor on Algorand
    stage = 'algorand_storage';
    const txId = await storeOnAlgorand(cid, username, sessionId);

    // 4. Update Supabase Database
    stage = 'database_update';
    console.log('💾 Updating Supabase records...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials for database update not found.');
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // TODO: For enhanced security, avoid storing the raw encryption key.
    // A better approach would be to derive a key ID or use a Key Management System (KMS).
    // For this iteration, we store the key as provided, but this is not recommended for production.
    const { error: dbError } = await supabase.from('chat_logs').update({
      cid: cid,
      algorand_tx_id: txId,
      encryption_key: encryption_key, // Storing key for retrieval; see TODO above.
    }).eq('session_id', sessionId).eq('username', username);

    if (dbError) throw dbError;
    console.log('✅ Successfully updated Supabase records.');

    return new Response(JSON.stringify({
      success: true,
      cid,
      txId,
      sessionId,
      totalExchanges: conversationData.totalExchanges,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`❌ Error during stage: ${stage}`, error);
    const errorBody = isDebug
      ? { error: true, stage, details: error.message }
      : { error: 'Failed to save conversation session to blockchain' };
    
    return new Response(JSON.stringify(errorBody), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
