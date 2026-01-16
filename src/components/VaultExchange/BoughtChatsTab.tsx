import React, { useState, useEffect } from 'react';
import { ShoppingBag, Calendar, DollarSign, User, UserX, Eye, MessageSquare, Bot } from 'lucide-react';
import { marketplaceService, MarketplacePurchase } from '../../services/marketplaceService';
import { blockchainChatService } from '../../services/blockchainChatService';
import { ConversationData } from '../../lib/encryption';
import { supabase } from '../../lib/supabase';

interface BoughtChatsTabProps {
  darkMode: boolean;
  userProfile?: any;
}

interface PurchaseWithConversation extends MarketplacePurchase {
  conversationData?: ConversationData;
  loading?: boolean;
  error?: string;
}

const BoughtChatsTab: React.FC<BoughtChatsTabProps> = ({ darkMode, userProfile }) => {
  const [purchases, setPurchases] = useState<PurchaseWithConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingConversation, setViewingConversation] = useState<ConversationData | null>(null);

  useEffect(() => {
    if (userProfile?.id) {
      loadPurchases();
    }
  }, [userProfile]);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const data = await marketplaceService.getUserPurchases(userProfile.id);
      setPurchases(data.map(purchase => ({ ...purchase, loading: false })));
    } catch (error) {
      console.error('Failed to load purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversationData = async (purchase: PurchaseWithConversation) => {
    // Update the specific purchase to show loading
    setPurchases(prev => prev.map(p => 
      p.id === purchase.id ? { ...p, loading: true, error: undefined } : p
    ));

    try {
      // Get the CID from chat_logs table using the seller's info
      const { data: chatLogs, error } = await supabase
        .from('chat_logs')
        .select('cid')
        .eq('session_id', purchase.chat_session_id)
        .eq('user_id', purchase.seller_user_id)
        .limit(1);

      if (error || !chatLogs || chatLogs.length === 0) {
        throw new Error('Chat data not found in database');
      }

      const cid = chatLogs[0].cid;
      if (!cid || cid.startsWith('error-') || cid.startsWith('fallback-')) {
        throw new Error('Chat not available on blockchain - stored locally only');
      }

      console.log('🔍 Loading purchased conversation:', {
        cid,
        sessionId: purchase.chat_session_id,
        hasEncryptionKey: !!purchase.encryption_key
      });

      // Decrypt the conversation using the purchase's encryption key
      const conversationData = await blockchainChatService.getConversationFromBlockchain(
        cid,
        purchase.encryption_key
      );

      if (!conversationData) {
        throw new Error('Failed to decrypt conversation data');
      }

      console.log('✅ Successfully loaded purchased conversation:', {
        sessionId: conversationData.sessionId,
        exchangeCount: conversationData.exchanges.length
      });

      // Update the purchase with the conversation data
      setPurchases(prev => prev.map(p => 
        p.id === purchase.id 
          ? { ...p, conversationData, loading: false, error: undefined }
          : p
      ));

    } catch (error) {
      console.error('Failed to load conversation:', error);
      setPurchases(prev => prev.map(p => 
        p.id === purchase.id 
          ? { ...p, loading: false, error: error instanceof Error ? error.message : 'Failed to load conversation' }
          : p
      ));
    }
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`;
  };

  if (!userProfile?.id) {
    return (
      <div className="text-center py-16">
        <div className={`mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          <User className="w-16 h-16 mx-auto" />
        </div>
        <h3 className={`text-xl font-medium mb-2 ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Profile Required
        </h3>
        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
          Please create a profile to view your purchased chats.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`animate-pulse p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div className={`h-4 rounded mb-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
            <div className={`h-3 rounded w-3/4 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className={`text-2xl font-bold mb-2 ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Bought Chats
        </h2>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Access your purchased conversations
        </p>
      </div>

      {/* Demo Notice */}
      <div className={`rounded-xl p-4 border ${
        darkMode 
          ? 'bg-blue-900/20 border-blue-700 text-blue-300' 
          : 'bg-blue-50 border-blue-200 text-blue-700'
      }`}>
        <div className="flex items-center space-x-2">
          <ShoppingBag className="w-5 h-5" />
          <span className="font-medium">Demo Mode:</span>
          <span className="text-sm">All purchases are simulated. You have permanent access to purchased content.</span>
        </div>
      </div>

      {/* Purchases */}
      {purchases.length === 0 ? (
        <div className="text-center py-16">
          <div className={`mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <ShoppingBag className="w-16 h-16 mx-auto" />
          </div>
          <h3 className={`text-xl font-medium mb-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            No purchases yet
          </h3>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Browse the marketplace to find interesting conversations to purchase.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase, index) => (
            <div
              key={purchase.id}
              className={`border rounded-xl p-6 transition-all duration-300 hover:shadow-lg ${
                darkMode 
                  ? 'border-gray-600 bg-gray-700/80 hover:bg-gray-700' 
                  : 'border-gray-200 bg-white/80 hover:bg-white'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1 space-y-3">
                  {/* Title and Seller */}
                  <div className="flex items-center space-x-3">
                    <h3 className={`text-lg font-semibold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {purchase.listing?.title || 'Purchased Chat'}
                    </h3>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      {purchase.listing?.is_anonymous ? (
                        <>
                          <UserX className="w-3 h-3" />
                          <span>Anonymous Seller</span>
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3" />
                          <span>by {purchase.seller_username}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {purchase.listing?.description || 'No description available.'}
                  </p>

                  {/* Tags */}
                  {purchase.listing?.tags && purchase.listing.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {purchase.listing.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`px-2 py-1 text-xs rounded-full ${
                            darkMode 
                              ? 'bg-gray-600 text-gray-300' 
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className={`flex items-center space-x-4 text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium">{formatPrice(purchase.purchase_price)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Purchased {new Date(purchase.purchased_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Conversation Status */}
                  {purchase.conversationData && (
                    <div className={`text-sm flex items-center space-x-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      <MessageSquare className="w-4 h-4" />
                      <span>Conversation loaded ({purchase.conversationData.exchanges.length} exchanges)</span>
                    </div>
                  )}
                  {purchase.error && (
                    <div className={`text-sm flex items-center space-x-2 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                      <span>⚠</span>
                      <span>{purchase.error}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 mt-4 md:mt-0 md:ml-4">
                  {purchase.conversationData ? (
                    <button
                      onClick={() => setViewingConversation(purchase.conversationData!)}
                      className={`px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 flex items-center space-x-2 ${
                        darkMode 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Chat</span>
                    </button>
                  ) : purchase.loading ? (
                    <div className="flex items-center space-x-2 px-4 py-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm">Loading...</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => loadConversationData(purchase)}
                      className={`px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 flex items-center space-x-2 ${
                        darkMode 
                          ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                          : 'bg-gray-500 hover:bg-gray-600 text-white'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Load Chat</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Conversation Viewer Modal */}
      {viewingConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="min-h-screen flex items-start justify-center p-2 md:p-4 pt-4 md:pt-8 pb-4 md:pb-8">
            <div className={`rounded-xl w-full max-w-4xl transition-all duration-300 shadow-2xl max-h-[95vh] overflow-hidden mx-2 md:mx-4 ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              {/* Header */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-inherit z-10">
                <div>
                  <h2 className={`text-lg md:text-xl font-bold pr-8 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Purchased Conversation
                  </h2>
                  <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {viewingConversation.exchanges.length} exchanges
                  </p>
                </div>
                <button
                  onClick={() => setViewingConversation(null)}
                  className={`absolute top-4 right-4 p-1.5 md:p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                    darkMode 
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="p-3 md:p-6 overflow-y-auto flex-1">
                <div className="space-y-4 md:space-y-6">
                  {viewingConversation.exchanges.map((exchange, index) => (
                    <div key={index} className="space-y-3 md:space-y-4">
                      {/* User Message */}
                      <div className="flex items-start space-x-2 md:space-x-3 flex-row-reverse space-x-reverse">
                        <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          <User className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div className="flex-1 text-right">
                          <div className="inline-block p-3 md:p-4 rounded-2xl shadow-md max-w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-tr-md">
                            <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">{exchange.userMessage}</p>
                          </div>
                          <div className="mt-2">
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {new Date(exchange.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* AI Reply */}
                      <div className="flex items-start space-x-2 md:space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                          <Bot className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className={`inline-block p-3 md:p-4 rounded-2xl shadow-md max-w-full rounded-tl-md border ${
                            darkMode
                              ? 'bg-gray-700 text-gray-100 border-gray-600'
                              : 'bg-gray-50 text-gray-900 border-gray-100'
                          }`}>
                            <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">{exchange.aiReply}</p>
                          </div>
                          <div className="mt-2">
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {new Date(exchange.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoughtChatsTab;