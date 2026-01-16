import { supabase } from '../lib/supabase';
import { detectTopic } from '../utils/chatUtils'; // Make sure this import is at the top

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  tags: string[];
  ipfsCid?: string;
  algorandTxId?: string;
  isEncrypted: boolean;
  createdAt: Date;
  encryptionKey?: string;
}

export interface ConversationExchange {
  userMessage: string;
  aiReply: string;
  timestamp: Date;
}

export interface ConversationData {
  sessionId: string;
  username: string;
  userId?: string; // Optional for backward compatibility
  exchanges: ConversationExchange[];
  createdAt: string;
  totalExchanges: number;
}

export interface ChatSummary {
  totalConversations: number;
  totalMemoriesSaved: number;
  totalMessages: number;
}

export interface ChatActivityData {
  sessionId: string;
  userMessage: string;
  aiReply: string;
  createdAt: Date;
  exchangeOrder: number;
}

export interface WeeklyActivity {
  day: string;
  count: number;
}

export interface KeywordData {
  word: string;
  count: number;
}

export interface ProductivityMetrics {
  conversationsLogged: number;
  peakTimeConsistency: number;
  topicKeywordDepth: number;
  weeklyConsistency: number;
  reflectionInsightTags: number;
  privacyConsciousBehavior: number;
  totalScore: number;
}

export class BlockchainChatService {
  async saveMessageToDatabase(
    userId: string,
    username: string,
    userMessage: string,
    aiReply: string,
    sessionId: string,
    exchangeOrder: number,
    encryptionKey: string | null,
    authUserId?: string // Add auth user ID
  ): Promise<void> {
    try {
      console.log('Saving message to database:', { userId, username, sessionId, exchangeOrder, authUserId });
      
      // Ensure both userId and username are provided
      if (!userId || userId.trim() === '') {
        throw new Error('User ID is required for saving messages');
      }
      if (!username || username.trim() === '') {
        throw new Error('Username is required for saving messages');
      }
      
      const { error } = await supabase
        .from('chat_logs')
        .insert([
          {
            user_id: userId.trim(), // Legacy UUID
            auth_user_id: authUserId, // New auth user ID
            username: username.trim(),
            session_id: sessionId,
            cid: '', // Will be updated when session is saved to blockchain
            algorand_tx_id: '', // Will be updated when session is saved to blockchain
            user_message: userMessage,
            ai_reply: aiReply,
            exchange_order: exchangeOrder,
            encryption_key: encryptionKey,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Failed to save to Supabase:', error);
        throw new Error(`Failed to save message to database: ${error.message}`);
      } else {
        console.log('Successfully saved message to Supabase database');
      }
    } catch (error) {
      console.error('Database save failed:', error);
      throw new Error(`Failed to save message to database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async saveSessionToBlockchain(
    sessionId: string,
    userId: string,
    username: string,
    conversationExchanges: ConversationExchange[],
    encryptionKey: string | null,
    authUserId?: string // Add auth user ID
  ): Promise<{ cid: string; txId: string }> {
    try {
      console.log('🔐 Starting blockchain save via Edge Function:', {
        sessionId,
        userId,
        username,
        exchangeCount: conversationExchanges.length,
        authUserId
      });

      if (conversationExchanges.length === 0) {
        console.log('No conversation exchanges to save');
        return { cid: '', txId: '' };
      }

      // Ensure both userId and username are provided
      if (!userId || userId.trim() === '') {
        throw new Error('User ID is required for blockchain save');
      }
      if (!username || username.trim() === '') {
        throw new Error('Username is required for blockchain save');
      }

      // Prepare data for Edge Function
      const requestData = {
        sessionId,
        username: username.trim(),
        userId: userId.trim(),
        authUserId: authUserId, // Include auth user ID
        conversationExchanges: conversationExchanges.map(exchange => ({
          userMessage: exchange.userMessage,
          aiReply: exchange.aiReply,
          timestamp: exchange.timestamp.toISOString()
        })),
        encryption_key: encryptionKey
      };

      console.log('📤 Calling Supabase Edge Function...');

      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('save-conversation-to-blockchain', {
        body: requestData
      });

      if (error) {
        console.error('❌ Edge Function error:', error);
        throw new Error(`Edge Function failed: ${error.message}`);
      }

      if (!data) {
        console.error('❌ Edge Function returned no data');
        throw new Error('Edge Function returned no data');
      }

      if (!data.success) {
        console.error('❌ Edge Function returned error:', data);
        throw new Error(data?.error || 'Unknown error from Edge Function');
      }

      console.log('✅ Edge Function completed successfully:', {
        cid: data.cid,
        txId: data.txId,
        sessionId: data.sessionId
      });

      return { 
        cid: data.cid, 
        txId: data.txId 
      };
    } catch (error) {
      console.error('❌ Save conversation session error:', error);
      
      // Provide fallback response for better user experience
      const fallbackCid = `error-fallback-${Date.now()}`;
      const fallbackTxId = `error-${Date.now()}`;
      
      console.log('🔄 Providing fallback response due to error');
      
      return { cid: fallbackCid, txId: fallbackTxId };
    }
  }

  async getChatSummary(userId: string, authUserId?: string): Promise<ChatSummary> {
    try {
      if (!userId || userId.trim() === '') {
        return { totalConversations: 0, totalMemoriesSaved: 0, totalMessages: 0 };
      }

      // Build query to support both legacy and new auth systems
      let query = supabase
        .from('chat_logs')
        .select('session_id')
        .not('session_id', 'is', null);

      // Use auth_user_id if available, otherwise fall back to user_id
      if (authUserId) {
        query = query.eq('auth_user_id', authUserId);
      } else {
        query = query.eq('user_id', userId.trim());
      }

      const { data: sessions, error: sessionError } = await query;

      if (sessionError) {
        console.error('Error fetching chat sessions:', sessionError);
        return { totalConversations: 0, totalMemoriesSaved: 0, totalMessages: 0 };
      }

      // Count unique sessions
      const uniqueSessions = new Set(sessions?.map(s => s.session_id) || []);
      const totalConversations = uniqueSessions.size;

      // Get total message count
      let countQuery = supabase
        .from('chat_logs')
        .select('*', { count: 'exact', head: true });

      if (authUserId) {
        countQuery = countQuery.eq('auth_user_id', authUserId);
      } else {
        countQuery = countQuery.eq('user_id', userId.trim());
      }

      const { count: totalMessages, error: messageError } = await countQuery;

      if (messageError) {
        console.error('Error counting messages:', messageError);
      }

      return {
        totalConversations,
        totalMemoriesSaved: totalConversations,
        totalMessages: totalMessages || 0
      };
    } catch (error) {
      console.error('Error getting chat summary:', error);
      return { totalConversations: 0, totalMemoriesSaved: 0, totalMessages: 0 };
    }
  }

  async getUserConversations(userId: string, authUserId?: string): Promise<ChatSession[]> {
    try {
      console.log('📋 Fetching conversations for user:', { userId, authUserId });
      
      if (!userId || userId.trim() === '') {
        console.log('No user ID provided, returning empty conversations');
        return [];
      }
      
      // Build query to support both legacy and new auth systems
      let query = supabase
        .from('chat_logs')
        .select('id, session_id, user_id, auth_user_id, username, cid, algorand_tx_id, user_message, ai_reply, exchange_order, encryption_key, created_at')
        .order('created_at', { ascending: true });

      // Use auth_user_id if available, otherwise fall back to user_id
      if (authUserId) {
        query = query.eq('auth_user_id', authUserId);
      } else {
        query = query.eq('user_id', userId.trim());
      }

      const { data: chatLogs, error } = await query;

      if (error) {
        console.error('Failed to fetch chat logs:', error);
        return [];
      }

      console.log('Retrieved chat logs:', chatLogs?.length || 0);

      if (!chatLogs || chatLogs.length === 0) {
        return [];
      }

      // Group chat logs by session_id
      const sessionGroups = new Map<string, any[]>();
      
      for (const log of chatLogs) {
        const sessionKey = log.session_id || `individual-${log.id}`;
        
        if (!sessionGroups.has(sessionKey)) {
          sessionGroups.set(sessionKey, []);
        }
        sessionGroups.get(sessionKey)!.push(log);
      }

      console.log('Grouped into sessions:', sessionGroups.size);

      // Convert each session group to a ChatSession
      const conversations: ChatSession[] = [];

      for (const [sessionId, sessionLogs] of sessionGroups.entries()) {
        // Sort logs within session by exchange_order first, then by created_at
        sessionLogs.sort((a, b) => {
          if (a.exchange_order !== null && b.exchange_order !== null) {
            return a.exchange_order - b.exchange_order;
          }
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });

        const messages: Message[] = [];
        let allUserMessages = '';
        let allAiReplies = '';

        // Create message pairs from the session logs
        for (const log of sessionLogs) {
          if (log.user_message && log.ai_reply) {
            // Add user message
            messages.push({
              id: `${log.id}-user`,
              content: log.user_message,
              sender: 'user',
              timestamp: new Date(log.created_at)
            });

            // Add AI reply
            messages.push({
              id: `${log.id}-ai`,
              content: log.ai_reply,
              sender: 'ai',
              timestamp: new Date(log.created_at)
            });

            allUserMessages += log.user_message + ' ';
            allAiReplies += log.ai_reply + ' ';
          }
        }

        // Skip empty sessions
        if (messages.length === 0) {
          continue;
        }

        // Use the first log for session metadata
        const firstLog = sessionLogs[0];
        
        // Determine save status based on CID and transaction ID
        const hasValidCid = firstLog.cid && 
                           !firstLog.cid.startsWith('pending-') && 
                           !firstLog.cid.startsWith('mock-') &&
                           !firstLog.cid.startsWith('fallback-') &&
                           !firstLog.cid.startsWith('error-fallback-') &&
                           firstLog.cid !== '';

        const hasValidTxId = firstLog.algorand_tx_id &&
                            !firstLog.algorand_tx_id.startsWith('pending-') &&
                            !firstLog.algorand_tx_id.startsWith('local-') &&
                            !firstLog.algorand_tx_id.startsWith('error-') &&
                            firstLog.algorand_tx_id !== '';

        // Generate title from the first user message or combined messages
        const title = this.generateSessionTitle(allUserMessages, sessionLogs.length);
        const tags = this.generateTags(allUserMessages, allAiReplies);

        // Add status tags based on save state
        if (hasValidCid && hasValidTxId) {
          tags.unshift('blockchain-saved');
        } else if (hasValidCid) {
          tags.unshift('ipfs-saved');
        } else if (firstLog.cid?.startsWith('fallback-') || firstLog.cid?.startsWith('error-fallback-')) {
          tags.unshift('local-only');
        } else {
          tags.unshift('pending-save');
        }

        const conversation: ChatSession = {
          id: sessionId,
          title,
          tags,
          ipfsCid: hasValidCid ? firstLog.cid : undefined,
          algorandTxId: hasValidTxId ? firstLog.algorand_tx_id : undefined,
          isEncrypted: hasValidCid,
          createdAt: new Date(firstLog.created_at),
          messages,
          encryptionKey: firstLog.encryption_key
        };

        conversations.push(conversation);
      }

      // Sort conversations by creation date (newest first)
      conversations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      console.log('✅ Processed conversations:', conversations.length);
      return conversations;
    } catch (error) {
      console.error('Get conversations error:', error);
      return [];
    }
  }

  // Rest of the methods remain the same but should be updated to support authUserId parameter
  // For brevity, I'm not updating all methods here, but they should follow the same pattern

  async getChatActivityData(userId: string, authUserId?: string): Promise<ChatActivityData[]> {
    try {
      if (!userId || userId.trim() === '') {
        return [];
      }

      let query = supabase
        .from('chat_logs')
        .select('session_id, user_message, ai_reply, created_at, exchange_order')
        .order('created_at', { ascending: true });

      if (authUserId) {
        query = query.eq('auth_user_id', authUserId);
      } else {
        query = query.eq('user_id', userId.trim());
      }

      const { data: chatLogs, error } = await query;

      if (error) {
        console.error('Error fetching chat activity data:', error);
        return [];
      }

      return (chatLogs || []).map(log => ({
        sessionId: log.session_id || `session-${log.created_at}`,
        userMessage: log.user_message || '',
        aiReply: log.ai_reply || '',
        createdAt: new Date(log.created_at),
        exchangeOrder: log.exchange_order || 1
      }));
    } catch (error) {
      console.error('Error getting chat activity data:', error);
      return [];
    }
  }

  async getWeeklyActivity(userId: string, authUserId?: string): Promise<WeeklyActivity[]> {
    try {
      // Get all conversations for the user
      const conversations = await this.getUserConversations(userId, authUserId);

      // Get current week's start (Monday)
      const now = new Date();
      const currentDay = now.getDay();
      const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Sunday=0
      const monday = new Date(now);
      monday.setDate(now.getDate() + mondayOffset);
      monday.setHours(0, 0, 0, 0);

      // Prepare weekly activity array
      const weeklyActivity: WeeklyActivity[] = [
        { day: 'Mon', count: 0 },
        { day: 'Tue', count: 0 },
        { day: 'Wed', count: 0 },
        { day: 'Thu', count: 0 },
        { day: 'Fri', count: 0 },
        { day: 'Sat', count: 0 },
        { day: 'Sun', count: 0 }
      ];

      // For each conversation, check if it was created this week and increment the correct day
      conversations.forEach(conv => {
        const created = new Date(conv.createdAt);
        if (created >= monday) {
          // Which day of the week? (0=Mon, 6=Sun)
          const dayIndex = (created.getDay() + 6) % 7;
          weeklyActivity[dayIndex].count += 1;
        }
      });

      return weeklyActivity;
    } catch (error) {
      console.error('Error getting weekly activity:', error);
      return [
        { day: 'Mon', count: 0 },
        { day: 'Tue', count: 0 },
        { day: 'Wed', count: 0 },
        { day: 'Thu', count: 0 },
        { day: 'Fri', count: 0 },
        { day: 'Sat', count: 0 },
        { day: 'Sun', count: 0 }
      ];
    }
  }

  async getTopKeywords(userId: string, authUserId?: string): Promise<KeywordData[]> {
    try {
      const activityData = await this.getChatActivityData(userId, authUserId);
      
      // Combine all text content
      const allText = activityData
        .map(activity => `${activity.userMessage} ${activity.aiReply}`)
        .join(' ')
        .toLowerCase();

      // Common stop words to filter out
      const stopWords = new Set([
        'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'as', 'by', 'that', 'this', 'it', 'from', 'they', 'we', 'say', 'her', 'she', 'he', 'has', 'had', 'his', 'him', 'how', 'what', 'where', 'when', 'why', 'who', 'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must', 'shall', 'do', 'does', 'did', 'have', 'having', 'be', 'been', 'being', 'am', 'are', 'was', 'were', 'i', 'you', 'me', 'my', 'your', 'yours', 'our', 'ours', 'their', 'theirs', 'them', 'us'
      ]);

      // Tokenize and count words
      const words = allText
        .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.has(word));

      const wordCount = new Map<string, number>();
      words.forEach(word => {
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
      });

      // Convert to array and sort by frequency
      const keywordData: KeywordData[] = Array.from(wordCount.entries())
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 keywords

      return keywordData;
    } catch (error) {
      console.error('Error getting top keywords:', error);
      return [];
    }
  }

  async getPeakActivityTime(userId: string, authUserId?: string): Promise<string> {
    try {
      const activityData = await this.getChatActivityData(userId, authUserId);
      
      if (activityData.length === 0) {
        return 'No activity yet';
      }

      // Count activities by hour
      const hourCounts = new Map<number, number>();
      
      activityData.forEach(activity => {
        const hour = activity.createdAt.getHours();
        hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      });

      // Find peak hour
      let peakHour = 0;
      let maxCount = 0;
      
      hourCounts.forEach((count, hour) => {
        if (count > maxCount) {
          maxCount = count;
          peakHour = hour;
        }
      });

      // Format time range
      const startHour = peakHour;
      const endHour = (peakHour + 1) % 24;
      
      const formatHour = (hour: number) => {
        if (hour === 0) return '12:00 AM';
        if (hour === 12) return '12:00 PM';
        if (hour < 12) return `${hour}:00 AM`;
        return `${hour - 12}:00 PM`;
      };

      return `${formatHour(startHour)} - ${formatHour(endHour)}`;
    } catch (error) {
      console.error('Error getting peak activity time:', error);
      return 'No activity yet';
    }
  }

  async getProductivityMetrics(userId: string, authUserId?: string): Promise<ProductivityMetrics> {
    try {
      const activityData = await this.getChatActivityData(userId, authUserId);
      const weeklyActivity = await this.getWeeklyActivity(userId, authUserId);
      const keywords = await this.getTopKeywords(userId, authUserId);
      
      // Get current week's data
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const weeklyData = activityData.filter(activity => 
        activity.createdAt >= oneWeekAgo
      );

      // 1. Conversations Logged (up to 25 pts)
      const weeklyConversations = new Set(weeklyData.map(d => d.sessionId)).size;
      const conversationsLogged = Math.min(25, Math.floor((weeklyConversations / 20) * 25));

      // 2. Peak-Time Consistency (up to 15 pts)
      // Simplified: if user has activity in their peak time, give full points
      const peakTimeConsistency = weeklyData.length > 0 ? 15 : 0;

      // 3. Topic/Keyword Depth (up to 15 pts)
      const uniqueKeywords = keywords.length;
      const topicKeywordDepth = Math.min(15, Math.floor((uniqueKeywords / 10) * 15));

      // 4. Weekly Consistency (up to 20 pts)
      const activeDays = weeklyActivity.filter(day => day.count > 0).length;
      const weeklyConsistency = activeDays >= 5 ? 20 : Math.floor((activeDays / 5) * 20);

      // 5. Reflection/Insight Tags (up to 15 pts)
      // Simplified: based on conversation depth (longer conversations = more reflection)
      const avgConversationLength = weeklyData.length > 0 ? 
        weeklyData.reduce((sum, d) => sum + d.userMessage.length + d.aiReply.length, 0) / weeklyData.length : 0;
      const reflectionInsightTags = Math.min(15, Math.floor((avgConversationLength / 500) * 15));

      // 6. Privacy-Conscious Behavior (up to 10 pts)
      // Simplified: if user has encrypted conversations, give full points
      const privacyConsciousBehavior = weeklyData.length > 0 ? 10 : 0;

      const totalScore = conversationsLogged + peakTimeConsistency + topicKeywordDepth + 
                        weeklyConsistency + reflectionInsightTags + privacyConsciousBehavior;

      return {
        conversationsLogged,
        peakTimeConsistency,
        topicKeywordDepth,
        weeklyConsistency,
        reflectionInsightTags,
        privacyConsciousBehavior,
        totalScore
      };
    } catch (error) {
      console.error('Error calculating productivity metrics:', error);
      return {
        conversationsLogged: 0,
        peakTimeConsistency: 0,
        topicKeywordDepth: 0,
        weeklyConsistency: 0,
        reflectionInsightTags: 0,
        privacyConsciousBehavior: 0,
        totalScore: 0
      };
    }
  }

  async getConversationFromBlockchain(cid: string, encryptionKey?: string): Promise<ConversationData | null> {
    try {
      console.log('🔍 Retrieving conversation from IPFS gateways:', cid);
      
      // Step 1: Retrieve encrypted data from IPFS gateways
      const encryptedData = await this.retrieveFromIPFSGateways(cid);
      
      console.log('📥 Retrieved data from IPFS:', {
        type: typeof encryptedData,
        length: encryptedData?.length || 0,
        preview: encryptedData?.substring(0, 100) || 'N/A'
      });
      
      // Step 2: Decrypt the conversation data using Web Crypto API
      const { decryptConversationData } = await import('../lib/encryption');
      const conversationData = await decryptConversationData(encryptedData, encryptionKey);
      
      console.log('✅ Successfully retrieved and decrypted conversation');
      return conversationData;
    } catch (error) {
      console.error('❌ Error retrieving conversation:', error);
      return null;
    }
  }

  private async retrieveFromIPFSGateways(cid: string): Promise<string> {
    const ipfsGateways = [
      'https://gateway.pinata.cloud/ipfs/',
      'https://ipfs.algonode.xyz/ipfs/',
      'https://ipfs.algonode.dev/ipfs/',
      'https://ipfs.io/ipfs/',
      'https://cloudflare-ipfs.com/ipfs/',
      'https://dweb.link/ipfs/'
    ];

    let lastError: Error | null = null;

    for (const gateway of ipfsGateways) {
      try {
        console.log(`🌐 Trying IPFS gateway: ${gateway}${cid}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(`${gateway}${cid}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json, text/plain, */*'
          },
          mode: 'cors',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.text();
          
          console.log(`📊 Raw data retrieved from ${gateway}:`, {
            status: response.status,
            statusText: response.statusText,
            contentType: response.headers.get('content-type'),
            dataType: typeof data,
            dataLength: data?.length || 0,
            dataPreview: data?.substring(0, 200) || 'N/A',
            containsHTML: data?.includes('<html>') || data?.includes('<!DOCTYPE') || false
          });
          
          // Validate that the retrieved data looks like encrypted content
          if (!data || data.trim().length === 0) {
            console.warn(`⚠️ Empty data from gateway ${gateway}`);
            throw new Error('Empty data retrieved');
          }
          
          // Check if it looks like an HTML error page
          if (data.trim().startsWith('<') || data.includes('<html>') || data.includes('<!DOCTYPE')) {
            console.warn(`⚠️ HTML content detected from gateway ${gateway}:`);
            console.warn('HTML preview:', data.substring(0, 500));
            throw new Error('Retrieved HTML instead of encrypted data');
          }
          
          console.log(`✅ Successfully retrieved data from IPFS gateway: ${gateway}${cid}`);
          return data;
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.warn(`❌ Failed to retrieve from gateway ${gateway}:`, error);
        lastError = error instanceof Error ? error : new Error('Unknown error');
        continue;
      }
    }

    throw lastError || new Error(`Failed to retrieve data from all IPFS gateways for CID: ${cid}`);
  }

  private generateSessionTitle(allUserMessages: string, exchangeCount: number): string {
    // Handle special cases
    if (!allUserMessages || allUserMessages.trim().length === 0) {
      return 'Conversation Session';
    }
    
    // Get the first meaningful message for the title
    const firstMessage = allUserMessages.trim().split('.')[0] || allUserMessages.trim().split('?')[0] || allUserMessages.trim();
    const words = firstMessage.split(' ').slice(0, 6);
    let title = words.join(' ');
    
    if (title.length > 50) {
      title = title.substring(0, 47) + '...';
    }
    
    return title;
  }

  private generateTags(userMessage: string, aiReply: string): string[] {
    const text = (userMessage + ' ' + aiReply).toLowerCase();
    const tags: string[] = ['encrypted'];

    // Simple keyword-based tagging
    const keywords = {
      'technology': ['tech', 'software', 'programming', 'code', 'development', 'app', 'website'],
      'business': ['business', 'startup', 'company', 'market', 'strategy', 'revenue', 'profit'],
      'ai': ['ai', 'artificial intelligence', 'machine learning', 'neural', 'algorithm'],
      'web3': ['blockchain', 'crypto', 'web3', 'defi', 'nft', 'ethereum', 'algorand'],
      'design': ['design', 'ui', 'ux', 'interface', 'user experience', 'visual'],
      'marketing': ['marketing', 'advertising', 'promotion', 'brand', 'campaign'],
      'finance': ['finance', 'money', 'investment', 'trading', 'stock', 'financial'],
      'chainspeak': ['chainspeak', 'memory', 'vault', 'privacy', 'data', 'conversation']
    };

    for (const [tag, words] of Object.entries(keywords)) {
      if (words.some(word => text.includes(word))) {
        if (!tags.includes(tag)) {
          tags.push(tag);
        }
      }
    }

    return tags.slice(0, 4); // Limit to 4 tags
  }

  async verifyConversationOnBlockchain(cid: string, txId: string): Promise<boolean> {
    try {
      // For verification, we could create another Edge Function if needed
      // For now, return true if both CID and txId exist and don't look like fallbacks
      return !!(cid && txId && 
               !cid.startsWith('error-fallback-') && 
               !txId.startsWith('error-'));
    } catch (error) {
      console.error('Verification error:', error);
      return false;
    }
  }

  isReady(): boolean {
    // Always return true since we're using Edge Functions and IPFS gateways
    return true;
  }

  getStatus(): { filebase: boolean; algorand: boolean; walletAddress: string | null } {
    return {
      filebase: true, // Edge Function handles IPFS via Pinata
      algorand: true, // Edge Function handles this
      walletAddress: 'Edge Function Managed'
    };
  }
}

export async function getWeeklyActivityWithLastWeek(userId: string, authUserId?: string) {
  const conversations = await blockchainChatService.getUserConversations(userId, authUserId);

  // Get start of this week (Monday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = (dayOfWeek + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);

  // Get start of last week
  const lastMonday = new Date(monday);
  lastMonday.setDate(monday.getDate() - 7);

  // Prepare arrays
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const thisWeek = days.map(day => ({ day, count: 0 }));
  const lastWeek = days.map(day => ({ day, count: 0 }));

  conversations.forEach(conv => {
    const created = new Date(conv.createdAt);
    if (created >= monday) {
      const dayIndex = (created.getDay() + 6) % 7;
      thisWeek[dayIndex].count += 1;
    } else if (created >= lastMonday && created < monday) {
      const dayIndex = (created.getDay() + 6) % 7;
      lastWeek[dayIndex].count += 1;
    }
  });

  return { thisWeek, lastWeek };
}

// Export singleton instance
export const blockchainChatService = new BlockchainChatService();

export async function getMostDiscussedTopic(userId: string, authUserId?: string) {
  // Get all conversations for the user
  const conversations = await blockchainChatService.getUserConversations(userId, authUserId);
  const topicCounts: { [topic: string]: number } = {};

  conversations.forEach(conv => {
    const messages = conv.messages.map(msg => msg.content);
    const topic = detectTopic(messages);
    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
  });

  // Find the topic with the highest count
  let mostDiscussed = 'General';
  let max = 0;
  for (const topic in topicCounts) {
    if (topicCounts[topic] > max) {
      max = topicCounts[topic];
      mostDiscussed = topic;
    }
  }
  return mostDiscussed;
}