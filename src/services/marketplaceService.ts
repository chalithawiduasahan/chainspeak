import { supabase } from '../lib/supabase';

export interface MarketplaceListing {
  id: string;
  seller_user_id: string;
  seller_username: string;
  chat_session_id: string;
  title: string;
  description: string;
  price: number;
  tags: string[];
  is_anonymous: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MarketplacePurchase {
  id: string;
  buyer_user_id: string;
  buyer_username: string;
  listing_id: string;
  seller_user_id: string;
  seller_username: string;
  chat_session_id: string;
  encryption_key: string;
  purchase_price: number;
  purchased_at: string;
  listing?: MarketplaceListing;
}

export interface UserChatForSale {
  session_id: string;
  title: string;
  message_count: number;
  created_at: string;
  preview: string;
}

export interface EarningsSummary {
  totalEarnings: number;
  chatsSold: number;
  averagePrice: number;
  recentSales: RecentSale[];
}

export interface RecentSale {
  id: string;
  title: string;
  price: number;
  soldAt: string;
  buyerUsername: string;
}

export class MarketplaceService {
  // Get all active marketplace listings
  async getAllListings(filters?: {
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    tags?: string[];
  }): Promise<MarketplaceListing[]> {
    try {
      let query = supabase
        .from('marketplace_listings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Apply price filters
      if (filters?.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters?.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      const { data: listings, error } = await query;

      if (error) {
        console.error('Error fetching marketplace listings:', error);
        return [];
      }

      let filteredListings = listings || [];

      // Apply search filter (client-side for flexibility)
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredListings = filteredListings.filter(listing =>
          listing.title.toLowerCase().includes(searchTerm) ||
          listing.description.toLowerCase().includes(searchTerm) ||
          listing.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      // Apply tags filter
      if (filters?.tags && filters.tags.length > 0) {
        filteredListings = filteredListings.filter(listing =>
          filters.tags!.some(filterTag =>
            listing.tags.some(listingTag =>
              listingTag.toLowerCase().includes(filterTag.toLowerCase())
            )
          )
        );
      }

      return filteredListings;
    } catch (error) {
      console.error('Error in getAllListings:', error);
      return [];
    }
  }

  // Get user's own listings
  async getUserListings(userId: string): Promise<MarketplaceListing[]> {
    try {
      const { data: listings, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('seller_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user listings:', error);
        return [];
      }

      return listings || [];
    } catch (error) {
      console.error('Error in getUserListings:', error);
      return [];
    }
  }

  // Get user's purchased chats
  async getUserPurchases(userId: string): Promise<MarketplacePurchase[]> {
    try {
      const { data: purchases, error } = await supabase
        .from('marketplace_purchases')
        .select(`
          *,
          listing:marketplace_listings(*)
        `)
        .eq('buyer_user_id', userId)
        .order('purchased_at', { ascending: false });

      if (error) {
        console.error('Error fetching user purchases:', error);
        return [];
      }

      return purchases || [];
    } catch (error) {
      console.error('Error in getUserPurchases:', error);
      return [];
    }
  }

  // Get earnings summary for a user
  async getEarningsSummary(userId: string): Promise<EarningsSummary> {
    try {
      if (!userId || userId.trim() === '') {
        return {
          totalEarnings: 0,
          chatsSold: 0,
          averagePrice: 0,
          recentSales: []
        };
      }

      // Get all purchases where this user is the seller
      const { data: purchases, error } = await supabase
        .from('marketplace_purchases')
        .select(`
          id,
          purchase_price,
          purchased_at,
          buyer_username,
          listing:marketplace_listings(title)
        `)
        .eq('seller_user_id', userId.trim())
        .order('purchased_at', { ascending: false });

      if (error) {
        console.error('Error fetching earnings data:', error);
        return {
          totalEarnings: 0,
          chatsSold: 0,
          averagePrice: 0,
          recentSales: []
        };
      }

      const salesData = purchases || [];
      
      // Calculate totals
      const totalEarnings = salesData.reduce((sum, sale) => sum + (sale.purchase_price || 0), 0);
      const chatsSold = salesData.length;
      const averagePrice = chatsSold > 0 ? totalEarnings / chatsSold : 0;

      // Get recent sales (last 2)
      const recentSales: RecentSale[] = salesData.slice(0, 2).map(sale => ({
        id: sale.id,
        title: sale.listing?.title || 'Unknown Chat',
        price: sale.purchase_price || 0,
        soldAt: sale.purchased_at,
        buyerUsername: sale.buyer_username || 'Anonymous'
      }));

      return {
        totalEarnings,
        chatsSold,
        averagePrice,
        recentSales
      };
    } catch (error) {
      console.error('Error getting earnings summary:', error);
      return {
        totalEarnings: 0,
        chatsSold: 0,
        averagePrice: 0,
        recentSales: []
      };
    }
  }

  // Get user's chats available for sale (excluding already listed ones)
  async getUserChatsForSale(userId: string): Promise<UserChatForSale[]> {
    try {
      console.log('MarketplaceService: Getting chats for user ID:', userId);
      
      // Get all user's chat sessions
      const { data: chatLogs, error } = await supabase
        .from('chat_logs')
        .select('session_id, user_message, ai_reply, created_at, user_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      console.log('MarketplaceService: Chat logs query result:', { 
        error, 
        dataLength: chatLogs?.length || 0,
        sampleData: chatLogs?.slice(0, 2) 
      });

      if (error) {
        console.error('Error fetching user chats:', error);
        return [];
      }

      if (!chatLogs || chatLogs.length === 0) {
        console.log('MarketplaceService: No chat logs found for user');
        return [];
      }

      // Group by session_id
      const sessionGroups = new Map<string, any[]>();
      for (const log of chatLogs) {
        const sessionKey = log.session_id || `individual-${Math.random()}`;
        if (!sessionGroups.has(sessionKey)) {
          sessionGroups.set(sessionKey, []);
        }
        sessionGroups.get(sessionKey)!.push(log);
      }

      console.log('MarketplaceService: Grouped into sessions:', sessionGroups.size);

      // Get existing active listings to filter out already listed chats
      const { data: existingListings } = await supabase
        .from('marketplace_listings')
        .select('chat_session_id')
        .eq('seller_user_id', userId)
        .eq('is_active', true);

      const listedSessionIds = new Set(existingListings?.map(l => l.chat_session_id) || []);
      console.log('MarketplaceService: Already listed sessions:', Array.from(listedSessionIds));

      // Convert to UserChatForSale format
      const chatsForSale: UserChatForSale[] = [];
      for (const [sessionId, logs] of sessionGroups.entries()) {
        // Skip if already listed
        if (listedSessionIds.has(sessionId)) {
          console.log('MarketplaceService: Skipping already listed session:', sessionId);
          continue;
        }

        const firstLog = logs[0];
        const allMessages = logs.map(log => 
          `${log.user_message || ''} ${log.ai_reply || ''}`
        ).join(' ');
        
        chatsForSale.push({
          session_id: sessionId,
          title: this.generateChatTitle(firstLog.user_message || 'Conversation', logs.length),
          message_count: logs.length * 2, // user + ai messages
          created_at: firstLog.created_at,
          preview: allMessages.substring(0, 150) + (allMessages.length > 150 ? '...' : '')
        });
      }

      console.log('MarketplaceService: Final chats for sale:', chatsForSale.length);

      return chatsForSale.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error) {
      console.error('Error in getUserChatsForSale:', error);
      return [];
    }
  }

  // Create a new marketplace listing
  async createListing(listingData: {
    sellerUserId: string;
    sellerUsername: string;
    chatSessionId: string;
    title: string;
    description: string;
    price: number;
    tags: string[];
    isAnonymous: boolean;
  }): Promise<{ success: boolean; listing?: MarketplaceListing; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('create-marketplace-listing', {
        body: listingData
      });

      if (error) {
        console.error('Error creating listing:', error);
        return { success: false, error: error.message };
      }

      if (!data.success) {
        return { success: false, error: data.error };
      }

      return { success: true, listing: data.listing };
    } catch (error) {
      console.error('Error in createListing:', error);
      return { success: false, error: 'Failed to create listing' };
    }
  }

  // Purchase a chat
  async purchaseChat(purchaseData: {
    buyerUserId: string;
    buyerUsername: string;
    listingId: string;
  }): Promise<{ success: boolean; purchase?: MarketplacePurchase; error?: string; message?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('purchase-chat', {
        body: purchaseData
      });

      if (error) {
        console.error('Error purchasing chat:', error);
        return { success: false, error: error.message };
      }

      if (!data.success) {
        return { success: false, error: data.error };
      }

      return { 
        success: true, 
        purchase: data.purchase,
        message: data.message 
      };
    } catch (error) {
      console.error('Error in purchaseChat:', error);
      return { success: false, error: 'Failed to purchase chat' };
    }
  }

  // Update a listing
  async updateListing(listingId: string, updates: {
    title?: string;
    description?: string;
    price?: number;
    tags?: string[];
    is_anonymous?: boolean;
    is_active?: boolean;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .update(updates)
        .eq('id', listingId);

      if (error) {
        console.error('Error updating listing:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateListing:', error);
      return { success: false, error: 'Failed to update listing' };
    }
  }

  // Delete/unlist a listing
  async deleteListing(listingId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .update({ is_active: false })
        .eq('id', listingId);

      if (error) {
        console.error('Error deleting listing:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteListing:', error);
      return { success: false, error: 'Failed to delete listing' };
    }
  }

  private generateChatTitle(firstMessage: string, exchangeCount: number): string {
    if (!firstMessage || firstMessage.trim().length === 0) {
      return `Conversation (${exchangeCount} exchanges)`;
    }
    
    const words = firstMessage.trim().split(' ').slice(0, 6);
    let title = words.join(' ');
    
    if (title.length > 50) {
      title = title.substring(0, 47) + '...';
    }
    
    return title;
  }
}

export const marketplaceService = new MarketplaceService();