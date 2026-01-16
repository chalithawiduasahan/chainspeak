// Use a consistent encryption key from environment variables
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'chainspeak-secure-32-char-key-2024';

export interface ConversationExchange {
  userMessage: string;
  aiReply: string;
  timestamp: string;
}

export interface ConversationData {
  sessionId: string;
  username: string;
  userId?: string; // Optional for backward compatibility
  exchanges: ConversationExchange[];
  createdAt: string;
  totalExchanges: number;
}

export function encryptConversationData(data: ConversationData): string {
  // This function is kept for backward compatibility but should not be used
  // The Edge Function handles encryption
  throw new Error('Encryption should be handled by the Edge Function');
}

export async function decryptConversationData(encryptedData: string, encryptionKey?: string): Promise<ConversationData> {
  try {
    console.log('🔓 Starting Web Crypto API decryption process...');
    console.log('Decryption key available:', !!ENCRYPTION_KEY);
    
    // Log raw data retrieved from IPFS
    console.log('📥 DOWNLOAD: Raw data from IPFS:');
    console.log('- Type:', typeof encryptedData);
    console.log('- Length:', encryptedData?.length || 0);
    console.log('- Is null/undefined:', encryptedData == null);
    console.log('- Is empty string:', encryptedData === '');
    console.log('- Full data sample (first 200 chars):', encryptedData?.substring(0, 200) || 'undefined');

    // Validate inputs
    if (!encryptionKey) {
      throw new Error('encryptionKey is not provided for decryption');
    }

    if (!encryptedData) {
      console.error('❌ Encrypted data is undefined, null, or empty');
      throw new Error('Encrypted data is undefined or empty');
    }

    if (typeof encryptedData !== 'string') {
      console.error('❌ Expected string, got:', typeof encryptedData);
      throw new Error(`Expected string, got ${typeof encryptedData}`);
    }

    // Check if data is an error message or unexpected format
    if (encryptedData.toLowerCase().includes('error') || 
        encryptedData.toLowerCase().includes('not found') ||
        encryptedData.toLowerCase().includes('failed')) {
      console.error('❌ IPFS returned an error message:', encryptedData);
      throw new Error(`IPFS returned an error: ${encryptedData}`);
    }

    // Handle JSON-wrapped data from IPFS
    let processedData = encryptedData;
    
    // Check if the data is JSON-wrapped (starts and ends with quotes)
    if (encryptedData.startsWith('"') && encryptedData.endsWith('"')) {
      console.log('🔧 Data appears to be JSON-wrapped, unwrapping...');
      try {
        processedData = JSON.parse(encryptedData);
        console.log('✅ Successfully unwrapped JSON data');
      } catch (jsonError) {
        console.warn('⚠️ Failed to parse as JSON, using original data');
        processedData = encryptedData;
      }
    }

    // Additional check for escaped quotes or other JSON artifacts
    if (processedData.includes('\\"') || processedData.includes('\\n')) {
      console.log('🔧 Data contains escape characters, attempting to clean...');
      try {
        const cleaned = JSON.parse(`"${processedData}"`);
        if (cleaned && typeof cleaned === 'string') {
          processedData = cleaned;
          console.log('✅ Successfully cleaned escaped data');
        }
      } catch (cleanError) {
        console.warn('⚠️ Could not clean escaped data, proceeding with original');
      }
    }

    console.log('🔍 Final processed data for decryption:');
    console.log('- Length:', processedData.length);
    console.log('- Sample:', processedData.substring(0, 100));

    // Try to parse as JSON first (in case it's already decrypted)
    try {
      const parsed = JSON.parse(processedData);
      if (parsed && typeof parsed === 'object' && (parsed.sessionId || parsed.exchanges)) {
        console.log('✅ Data appears to be already decrypted JSON');
        
        // Transform the data to match expected structure if needed
        if (parsed.conversationExchanges && !parsed.exchanges) {
          parsed.exchanges = parsed.conversationExchanges;
          delete parsed.conversationExchanges;
        }
        
        return parsed as ConversationData;
      }
    } catch (jsonError) {
      // Not JSON, continue with decryption
    }

    console.log('🔑 Attempting Web Crypto API decryption...');
    
    // Decode base64 data
    const binaryString = atob(processedData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Extract IV (first 12 bytes) and ciphertext (remaining bytes)
    const iv = bytes.slice(0, 12);
    const ciphertext = bytes.slice(12);

    console.log('🔍 Decryption details:', {
      totalBytes: bytes.length,
      ivLength: iv.length,
      ciphertextLength: ciphertext.length
    });

    // Prepare encryption key (same as Edge Function)
   const encoder = new TextEncoder();
   const keyMaterial = await crypto.subtle.importKey(
     'raw',
     encoder.encode(encryptionKey.padEnd(32, '0').slice(0, 32)),
     { name: 'AES-GCM' },
     false,
     ['decrypt']
   );

    // Decrypt using AES-GCM
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      keyMaterial,
      ciphertext
    );

    // Convert decrypted buffer to string
    const decoder = new TextDecoder();
    const decryptedString = decoder.decode(decryptedBuffer);
    
    if (!decryptedString) {
      throw new Error('Decryption resulted in empty string - likely wrong key');
    }

    console.log('✅ Web Crypto API decryption successful, decrypted length:', decryptedString.length);

    // Parse the decrypted JSON
    const conversationData = JSON.parse(decryptedString) as ConversationData;
    
    // Validate the structure and transform if needed
    if (!conversationData.sessionId && !conversationData.username) {
      throw new Error('Decrypted data is missing required fields');
    }

    // Handle different data structures from Edge Function
    if (!conversationData.exchanges && (conversationData as any).conversationExchanges) {
      conversationData.exchanges = (conversationData as any).conversationExchanges;
      delete (conversationData as any).conversationExchanges;
    }

    if (!Array.isArray(conversationData.exchanges)) {
      throw new Error('Decrypted data does not contain valid conversation exchanges');
    }

    // Ensure totalExchanges is set
    if (!conversationData.totalExchanges) {
      conversationData.totalExchanges = conversationData.exchanges.length;
    }

    // Ensure createdAt is set
    if (!conversationData.createdAt) {
      conversationData.createdAt = new Date().toISOString();
    }

    console.log('✅ Decryption and validation successful:', {
      sessionId: conversationData.sessionId,
      username: conversationData.username,
      exchangeCount: conversationData.exchanges.length,
      totalExchanges: conversationData.totalExchanges
    });

    return conversationData;
  } catch (error) {
    console.error('❌ Web Crypto API decryption error:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      inputType: typeof encryptedData,
      inputLength: encryptedData?.length || 0,
      inputSample: encryptedData?.substring(0, 100) || 'undefined'
    });
    throw new Error(`Failed to decrypt conversation data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Utility function to validate encryption key
export function validateEncryptionKey(): boolean {
  return !!(ENCRYPTION_KEY && ENCRYPTION_KEY.length >= 16);
}

// Utility function to get encryption status
export function getEncryptionStatus(): { keyAvailable: boolean; keyLength: number } {
  return {
    keyAvailable: !!ENCRYPTION_KEY,
    keyLength: ENCRYPTION_KEY?.length || 0
  };
}