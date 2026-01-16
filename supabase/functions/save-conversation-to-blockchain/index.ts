import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import algosdk from 'https://esm.sh/algosdk@2.7.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// --- CHANGED: Accept encryptionKey as argument ---
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
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt conversation data');
  }
}

async function uploadToPinata(encryptedData, filename) {
  const pinataApiKey = Deno.env.get('PINATA_API_KEY');
  const pinataSecretApiKey = Deno.env.get('PINATA_SECRET_API_KEY');
  const pinataJWT = Deno.env.get('PINATA_JWT');
  
  // Prefer JWT if available (more modern and secure)
  if (pinataJWT) {
    console.log('📤 Uploading to Pinata IPFS using JWT...');
    try {
      const formData = new FormData();
      const blob = new Blob([encryptedData], { type: 'application/json' });
      formData.append('file', blob, filename);
      const metadata = JSON.stringify({
        name: filename,
        keyvalues: {
          platform: 'chainspeak',
          type: 'conversation_session',
          encrypted: 'true'
        }
      });
      formData.append('pinataMetadata', metadata);
      const options = JSON.stringify({ cidVersion: 1 });
      formData.append('pinataOptions', options);
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pinataJWT}`
        },
        body: formData
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Pinata upload error:', response.status, errorText);
        throw new Error(`Pinata upload failed: ${response.status} - ${errorText}`);
      }
      const result = await response.json();
      console.log('✅ Successfully uploaded to Pinata IPFS:', result.IpfsHash);
      return result.IpfsHash;
    } catch (error) {
      console.error('Pinata upload error:', error);
      throw new Error(`Failed to upload to Pinata: ${error.message}`);
    }
  }
  
  // Fallback to API key method
  if (!pinataApiKey || !pinataSecretApiKey) {
    throw new Error('Pinata API credentials missing. Please set PINATA_JWT or PINATA_API_KEY and PINATA_SECRET_API_KEY environment variables.');
  }
  console.log('📤 Uploading to Pinata IPFS using API keys...');
  try {
    const formData = new FormData();
    const blob = new Blob([encryptedData], { type: 'application/json' });
    formData.append('file', blob, filename);
    const metadata = JSON.stringify({
      name: filename,
      keyvalues: {
        platform: 'chainspeak',
        type: 'conversation_session',
        encrypted: 'true'
      }
    });
    formData.append('pinataMetadata', metadata);
    const options = JSON.stringify({ cidVersion: 1 });
    formData.append('pinataOptions', options);
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretApiKey
      },
      body: formData
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pinata upload error:', response.status, errorText);
      throw new Error(`Pinata upload failed: ${response.status} - ${errorText}`);
    }
    const result = await response.json();
    console.log('✅ Successfully uploaded to Pinata IPFS:', result.IpfsHash);
    return result.IpfsHash;
  } catch (error) {
    console.error('Pinata upload error:', error);
    throw new Error(`Failed to upload to Pinata: ${error.message}`);
  }
}

async function storeOnAlgorand(cid, username, sessionId) {
  // Use Algorand Testnet (free tier)
  const rpcUrl = Deno.env.get('ALGORAND_RPC_URL') || 'https://testnet-api.algonode.cloud';
  const mnemonic = Deno.env.get('ALGORAND_MNEMONIC');
  if (!mnemonic || mnemonic === 'your_25_word_mnemonic_here' || mnemonic.split(' ').length !== 25) {
    throw new Error('Algorand mnemonic not configured properly. Expected 25 words.');
  }
  try {
    const url = new URL(rpcUrl);
    const baseServer = `${url.protocol}//${url.hostname}`;
    const port = url.port || (url.protocol === 'https:' ? '443' : '80');
    // For testnet, API key is usually empty or optional
    const apiKey = Deno.env.get('ALGORAND_API_KEY') || '';
    const algodClient = new algosdk.Algodv2(apiKey, baseServer, port);
    const account = algosdk.mnemonicToSecretKey(mnemonic);
    const suggestedParams = await algodClient.getTransactionParams().do();
    const noteData = {
      type: 'chainspeak_chat_session',
      cid: cid,
      username: username,
      sessionId: sessionId,
      timestamp: new Date().toISOString(),
      version: '2.0',
      platform: 'chainspeak'
    };
    const note = new TextEncoder().encode(JSON.stringify(noteData));
    if (note.length > 1024) {
      throw new Error('Note data too large for Algorand transaction');
    }
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: account.addr,
      to: account.addr,
      amount: 0,
      note: note,
      suggestedParams: suggestedParams
    });
    const signedTxn = txn.signTxn(account.sk);
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
    await algosdk.waitForConfirmation(algodClient, txId, 10);
    console.log('✅ Successfully stored on Algorand testnet:', txId);
    return txId;
  } catch (error) {
    console.error('Algorand storage error:', error);
    throw new Error(`Failed to store on Algorand: ${error.message}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    // --- CHANGED: Also get encryption_key from request body ---
    const { sessionId, username, conversationExchanges, encryption_key } = await req.json();
    if (!sessionId || !username || !conversationExchanges || conversationExchanges.length === 0) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: sessionId, username, and conversationExchanges'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    console.log('🔐 Processing session save request:', {
      sessionId,
      username,
      exchangeCount: conversationExchanges.length
    });
    const conversationData = {
      username,
      sessionId,
      exchanges: conversationExchanges,
      createdAt: new Date().toISOString(),
      totalExchanges: conversationExchanges.length
    };
    // --- CHANGED: Pass encryption_key to encryption function ---
    console.log('🔒 Encrypting conversation data...');
    const encryptedData = await encryptConversationData(conversationData, encryption_key);
    console.log('✅ Conversation data encrypted successfully');
    console.log('📤 Uploading to Pinata IPFS...');
    const filename = `chainspeak-session-${sessionId}-${Date.now()}.json`;
    const cid = await uploadToPinata(encryptedData, filename);
    console.log('✅ Successfully uploaded to Pinata IPFS:', cid);
    console.log('⛓️ Storing CID on Algorand blockchain...');
    const txId = await storeOnAlgorand(cid, username, sessionId);
    console.log('✅ Successfully stored on Algorand blockchain:', txId);
    console.log('💾 Updating Supabase records...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    // --- CHANGED: Save encryption_key in chat_logs table ---
    const { error: dbError } = await supabase.from('chat_logs').update({
      cid: cid,
      algorand_tx_id: txId,
      encryption_key: encryption_key
    }).eq('session_id', sessionId).eq('username', username);
    if (dbError) {
      console.error('Failed to update Supabase records:', dbError);
    } else {
      console.log('✅ Successfully updated Supabase records');
    }
    console.log('🎉 Session successfully saved to blockchain via Pinata!', {
      sessionId,
      cid,
      txId,
      totalExchanges: conversationData.totalExchanges
    });
    return new Response(JSON.stringify({
      success: true,
      cid: cid,
      txId: txId,
      sessionId: sessionId,
      totalExchanges: conversationData.totalExchanges
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('❌ Edge function error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to save conversation session to blockchain',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
