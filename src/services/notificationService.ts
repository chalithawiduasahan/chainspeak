import { supabase } from '../lib/supabase';

export interface Notification {
  id: string;
  user_id: string;
  type: 'sale' | 'purchase' | 'listing' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  metadata?: any;
}

export class NotificationService {
  // Create a new notification
  async createNotification(notification: {
    userId: string;
    type: 'sale' | 'purchase' | 'listing' | 'system';
    title: string;
    message: string;
    metadata?: any;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          user_id: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          metadata: notification.metadata || {},
          is_read: false
        }]);

      if (error) {
        console.error('Error creating notification:', error);
        throw error;
      }

      console.log('✅ Notification created successfully');
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  // Get user's notifications
  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  // Create sale notification
  async createSaleNotification(sellerId: string, chatTitle: string, price: number, buyerUsername: string): Promise<void> {
    await this.createNotification({
      userId: sellerId,
      type: 'sale',
      title: '💰 Chat Sold!',
      message: `Your chat "${chatTitle}" was purchased for $${price.toFixed(2)} by ${buyerUsername}`,
      metadata: {
        chatTitle,
        price,
        buyerUsername
      }
    });
  }

  // Create purchase notification
  async createPurchaseNotification(buyerId: string, chatTitle: string, price: number, sellerUsername: string): Promise<void> {
    await this.createNotification({
      userId: buyerId,
      type: 'purchase',
      title: '🛒 Purchase Successful!',
      message: `You successfully purchased "${chatTitle}" for $${price.toFixed(2)} from ${sellerUsername}`,
      metadata: {
        chatTitle,
        price,
        sellerUsername
      }
    });
  }

  // Create listing notification
  async createListingNotification(userId: string, chatTitle: string, price: number): Promise<void> {
    await this.createNotification({
      userId: userId,
      type: 'listing',
      title: '📝 Chat Listed!',
      message: `Your chat "${chatTitle}" is now listed for ${price === 0 ? 'free' : `$${price.toFixed(2)}`}`,
      metadata: {
        chatTitle,
        price
      }
    });
  }

  // Create system notification
  async createSystemNotification(userId: string, title: string, message: string): Promise<void> {
    await this.createNotification({
      userId: userId,
      type: 'system',
      title: title,
      message: message
    });
  }

  // Create welcome notification for new users
  async createWelcomeNotification(userId: string, nickname: string): Promise<void> {
    await this.createNotification({
      userId: userId,
      type: 'system',
      title: '🎉 Welcome to ChainSpeak!',
      message: `Hi ${nickname}! Start chatting with AI and save your conversations to the blockchain. Your privacy is our priority.`,
      metadata: {
        nickname
      }
    });
  }

  // Create blockchain save notification
  async createBlockchainSaveNotification(userId: string, sessionId: string): Promise<void> {
    await this.createNotification({
      userId: userId,
      type: 'system',
      title: '⛓️ Conversation Saved to Blockchain!',
      message: 'Your conversation has been successfully encrypted and stored on the blockchain.',
      metadata: {
        sessionId
      }
    });
  }
}

export const notificationService = new NotificationService();