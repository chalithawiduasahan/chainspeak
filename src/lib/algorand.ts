import algosdk from 'algosdk';

export class AlgorandStorage {
  private algodClient: algosdk.Algodv2;
  private account: algosdk.Account | null = null;
  private isInitialized: boolean = false;

  constructor() {
    try {
      // Use Nodely Algorand endpoint
      const rpcUrl = import.meta.env.VITE_ALGORAND_RPC_URL || 'https://testnet-api.4160.nodely.dev';
      const apiToken = import.meta.env.VITE_ALGORAND_API_TOKEN || '';
      const mnemonic = import.meta.env.VITE_ALGORAND_MNEMONIC;
      
      console.log('Initializing Algorand with Nodely RPC URL:', rpcUrl);
      
      // Validate configuration
      if (!mnemonic || mnemonic === 'your_25_word_mnemonic_here' || mnemonic.split(' ').length !== 25) {
        console.warn('Algorand mnemonic not configured properly. Expected 25 words.');
        this.isInitialized = false;
        return;
      }

      // Parse the URL to get the base URL and port
      const url = new URL(rpcUrl);
      const baseServer = `${url.protocol}//${url.hostname}`;
      const port = url.port || (url.protocol === 'https:' ? '443' : '80');
      
      // Initialize client with Nodely API token
      this.algodClient = new algosdk.Algodv2(apiToken, baseServer, port);

      // Initialize account from mnemonic
      this.account = algosdk.mnemonicToSecretKey(mnemonic);
      this.isInitialized = true;
      
      console.log('Algorand storage initialized successfully with Nodely');
      console.log('Wallet address:', this.account.addr);
      
      // Test connection
      this.testConnection();
    } catch (error) {
      console.error('Failed to initialize Algorand storage:', error);
      this.isInitialized = false;
    }
  }

  private async testConnection(): Promise<void> {
    try {
      const status = await this.algodClient.status().do();
      console.log('Algorand connection test successful:', {
        lastRound: status['last-round'],
        timeSinceLastRound: status['time-since-last-round'],
        network: 'Nodely Testnet'
      });
    } catch (error) {
      console.warn('Algorand connection test failed:', error);
      // Don't fail initialization just because of connection test
    }
  }

  async storeCIDOnBlockchain(cid: string, username: string, sessionId: string): Promise<string> {
    if (!this.isInitialized || !this.account) {
      throw new Error('Algorand storage not initialized. Please check your mnemonic configuration.');
    }

    try {
      console.log('Storing CID on Algorand blockchain via Nodely:', { cid, username, sessionId });
      
      // Get suggested transaction parameters with retry logic
      let suggestedParams;
      try {
        suggestedParams = await this.algodClient.getTransactionParams().do();
      } catch (error) {
        console.error('Failed to get transaction parameters:', error);
        throw new Error(`Unable to connect to Algorand network via Nodely: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      // Create note with CID, username, and session info
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
      
      // Ensure note is not too large (max 1024 bytes)
      if (note.length > 1024) {
        throw new Error('Note data too large for Algorand transaction');
      }

      // Create transaction
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: this.account.addr,
        to: this.account.addr, // Send to self
        amount: 0, // 0 ALGO transaction
        note: note,
        suggestedParams: suggestedParams
      });

      // Sign transaction
      const signedTxn = txn.signTxn(this.account.sk);

      // Submit transaction with error handling
      let txId: string;
      try {
        const result = await this.algodClient.sendRawTransaction(signedTxn).do();
        txId = result.txId;
      } catch (error) {
        console.error('Failed to submit transaction to Nodely:', error);
        throw new Error(`Transaction submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      // Wait for confirmation with timeout
      try {
        await algosdk.waitForConfirmation(this.algodClient, txId, 10);
        console.log('CID stored on Algorand blockchain via Nodely successfully:', txId);
        return txId;
      } catch (error) {
        console.error('Transaction confirmation failed:', error);
        throw new Error(`Transaction confirmation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error storing CID on blockchain:', error);
      throw error;
    }
  }

  async getCIDFromBlockchain(txId: string): Promise<{ cid: string; username: string; sessionId: string; timestamp: string } | null> {
    if (!this.isInitialized) {
      throw new Error('Algorand storage not initialized');
    }

    try {
      // Get transaction information with proper error handling
      let txInfo;
      try {
        txInfo = await this.algodClient.pendingTransactionInformation(txId).do();
      } catch (error) {
        console.warn('Transaction not found in pending, trying confirmed transactions');
        return null;
      }
      
      if (txInfo && txInfo.note) {
        try {
          const noteBytes = new Uint8Array(Buffer.from(txInfo.note, 'base64'));
          const noteString = new TextDecoder().decode(noteBytes);
          const noteData = JSON.parse(noteString);
          
          if (noteData.type === 'chainspeak_chat_session') {
            return {
              cid: noteData.cid,
              username: noteData.username,
              sessionId: noteData.sessionId,
              timestamp: noteData.timestamp
            };
          }
        } catch (parseError) {
          console.error('Error parsing transaction note:', parseError);
          return null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error retrieving CID from blockchain:', error);
      return null;
    }
  }

  async getUserTransactions(username: string): Promise<string[]> {
    if (!this.isInitialized || !this.account) {
      throw new Error('Algorand storage not initialized');
    }

    try {
      // Get account information
      const accountInfo = await this.algodClient.accountInformation(this.account.addr).do();
      
      console.log('Account info retrieved from Nodely:', {
        address: this.account.addr,
        balance: accountInfo.amount,
        minBalance: accountInfo['min-balance']
      });
      
      // This is a simplified version - in production, you'd want to use an indexer
      // to efficiently search through transactions
      const transactions: string[] = [];
      
      // For now, return empty array as we'd need an indexer for efficient searching
      return transactions;
    } catch (error) {
      console.error('Error getting user transactions:', error);
      return [];
    }
  }

  async getAccountBalance(): Promise<number> {
    if (!this.isInitialized || !this.account) {
      throw new Error('Algorand storage not initialized');
    }

    try {
      const accountInfo = await this.algodClient.accountInformation(this.account.addr).do();
      return accountInfo.amount / 1000000; // Convert microAlgos to Algos
    } catch (error) {
      console.error('Error getting account balance:', error);
      return 0;
    }
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  getWalletAddress(): string | null {
    return this.account?.addr || null;
  }

  getNetworkInfo(): { rpcUrl: string; isInitialized: boolean; network: string } {
    return {
      rpcUrl: import.meta.env.VITE_ALGORAND_RPC_URL || 'https://testnet-api.4160.nodely.dev',
      isInitialized: this.isInitialized,
      network: 'Nodely Algorand Testnet'
    };
  }
}

// Export singleton instance
export const algorandStorage = new AlgorandStorage();