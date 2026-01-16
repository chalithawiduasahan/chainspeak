import React, { useState, useEffect } from 'react';
import { Plus, MessageSquare, Calendar, DollarSign, Tag, User, UserX, Check } from 'lucide-react';
import { marketplaceService, UserChatForSale } from '../../services/marketplaceService';
import ConfirmationModal from './ConfirmationModal';

interface SellChatsTabProps {
  darkMode: boolean;
  userProfile?: any;
  triggerDataRefresh?: () => void;
}

const SellChatsTab: React.FC<SellChatsTabProps> = ({ darkMode, userProfile, triggerDataRefresh }) => {
  const [availableChats, setAvailableChats] = useState<UserChatForSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedChat, setSelectedChat] = useState<UserChatForSale | null>(null);
  const [sellForm, setSellForm] = useState({
    title: '',
    description: '',
    price: '',
    tags: '',
    isAnonymous: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'purchase' | 'edit' | 'delete' | 'list' | 'unlist';
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: 'list',
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Debug logging
  console.log('SellChatsTab.tsx: Received userProfile prop:', userProfile);
  console.log('SellChatsTab.tsx: userProfile?.id value:', userProfile?.id);

  useEffect(() => {
    if (userProfile?.id) {
      loadAvailableChats();
    } else {
      console.log('SellChatsTab: No userProfile.id, skipping chat loading');
      setLoading(false);
    }
  }, [userProfile]);

  const loadAvailableChats = async () => {
    try {
      setLoading(true);
      console.log('SellChatsTab: Loading chats for user ID:', userProfile.id);
      const chats = await marketplaceService.getUserChatsForSale(userProfile.id);
      console.log('SellChatsTab: Loaded chats:', chats);
      setAvailableChats(chats);
    } catch (error) {
      console.error('Failed to load available chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSellClick = (chat: UserChatForSale) => {
    setSelectedChat(chat);
    setSellForm({
      title: chat.title,
      description: '',
      price: '',
      tags: '',
      isAnonymous: false
    });
    setShowSellModal(true);
  };

  const handleSubmitListingClick = () => {
    if (!selectedChat || !userProfile) return;

    const tags = sellForm.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    setConfirmModal({
      isOpen: true,
      type: 'list',
      title: 'Confirm Listing',
      message: `Are you sure you want to list "${sellForm.title}" for ${sellForm.price ? `$${parseFloat(sellForm.price).toFixed(2)}` : 'free'}?`,
      onConfirm: handleSubmitListing
    });
  };

  const handleSubmitListing = async () => {
    if (!selectedChat || !userProfile) return;

    try {
      setSubmitting(true);
      
      const tags = sellForm.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const result = await marketplaceService.createListing({
        sellerUserId: userProfile.id,
        sellerUsername: userProfile.nickname,
        chatSessionId: selectedChat.session_id,
        title: sellForm.title,
        description: sellForm.description,
        price: parseFloat(sellForm.price) || 0,
        tags: tags,
        isAnonymous: sellForm.isAnonymous
      });

      if (result.success) {
        setConfirmModal({
          isOpen: true,
          type: 'list',
          title: 'Listing Created!',
          message: 'Your chat has been successfully listed in the marketplace!',
          onConfirm: () => {
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
            setShowSellModal(false);
            loadAvailableChats(); // Refresh the list
            // Trigger data refresh for other components
            if (triggerDataRefresh) {
              triggerDataRefresh();
              console.log('🔄 Data refresh triggered after listing creation');
            }
          }
        });
      } else {
        setConfirmModal({
          isOpen: true,
          type: 'list',
          title: 'Listing Failed',
          message: result.error || 'Failed to create listing. Please try again.',
          onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
        });
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      setConfirmModal({
        isOpen: true,
        type: 'list',
        title: 'Listing Failed',
        message: 'An error occurred while creating your listing. Please try again.',
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Debug the condition that's causing the issue
  const hasValidProfile = userProfile?.id && userProfile?.nickname;
  console.log('SellChatsTab: Profile validation:', {
    userProfile,
    hasId: !!userProfile?.id,
    hasNickname: !!userProfile?.nickname,
    hasValidProfile
  });

  if (!hasValidProfile) {
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
          Please create a profile to sell your chats.
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
          Sell Your Chats
        </h2>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Select conversations from your memory vault to list in the marketplace
        </p>
      </div>

      {/* Available Chats */}
      {availableChats.length === 0 ? (
        <div className="text-center py-16">
          <div className={`mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <MessageSquare className="w-16 h-16 mx-auto" />
          </div>
          <h3 className={`text-xl font-medium mb-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            No chats available to sell
          </h3>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Start some conversations in the AI Chat section to have chats available for sale.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableChats.map((chat, index) => (
            <div
              key={chat.session_id}
              className={`border rounded-xl p-6 hover:shadow-xl transition-all duration-300 backdrop-blur-sm hover:scale-105 group ${
                darkMode 
                  ? 'border-gray-600 bg-gray-700/80 hover:bg-gray-700' 
                  : 'border-gray-200 bg-white/80 hover:bg-white'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="space-y-4">
                {/* Chat Info */}
                <div>
                  <h3 className={`text-lg font-semibold line-clamp-2 mb-2 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {chat.title}
                  </h3>
                  <p className={`text-sm line-clamp-3 leading-relaxed ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {chat.preview}
                  </p>
                </div>

                {/* Metadata */}
                <div className={`flex items-center justify-between text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>{chat.message_count} messages</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(chat.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Sell Button */}
                <button
                  onClick={() => handleSellClick(chat)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>List for Sale</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sell Modal */}
      {showSellModal && selectedChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="min-h-screen flex items-start justify-center p-2 md:p-4 pt-4 md:pt-8 pb-4 md:pb-8">
            <div className={`rounded-xl w-full max-w-lg transition-all duration-300 shadow-2xl max-h-[95vh] overflow-y-auto mx-2 md:mx-4 ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              {/* Header */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-inherit z-10">
                <h2 className={`text-lg md:text-xl font-bold pr-8 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  List Chat for Sale
                </h2>
                <button
                  onClick={() => setShowSellModal(false)}
                  className={`absolute top-4 right-4 p-1.5 md:p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                    darkMode 
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 md:p-6 space-y-4 md:space-y-6 flex-1">
                {/* Title */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={sellForm.title}
                    onChange={(e) => setSellForm(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full border rounded-xl px-3 md:px-4 py-2.5 md:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:shadow-sm ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Description
                  </label>
                  <textarea
                    value={sellForm.description}
                    onChange={(e) => setSellForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                    placeholder="Describe what makes this conversation valuable..."
                    className={`w-full border rounded-xl px-3 md:px-4 py-2.5 md:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:shadow-sm resize-none ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                {/* Price and Tags */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Price ($)
                    </label>
                    <input
                      type="number"
                      value={sellForm.price}
                      onChange={(e) => setSellForm(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={`w-full border rounded-xl px-3 md:px-4 py-2.5 md:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:shadow-sm ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Tags
                    </label>
                    <input
                      type="text"
                      value={sellForm.tags}
                      onChange={(e) => setSellForm(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="ai, tech, business"
                      className={`w-full border rounded-xl px-3 md:px-4 py-2.5 md:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:shadow-sm ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Anonymous Option */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSellForm(prev => ({ ...prev, isAnonymous: !prev.isAnonymous }))}
                    className={`flex items-center space-x-2 px-3 md:px-4 py-2 md:py-3 border rounded-xl transition-all duration-300 hover:scale-105 ${
                      sellForm.isAnonymous
                        ? darkMode
                          ? 'border-purple-400 bg-purple-500/20 text-purple-200'
                          : 'border-purple-500 bg-purple-50 text-purple-700'
                        : darkMode
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30'
                          : 'border-cyan-500 bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
                    }`}
                  >
                    {sellForm.isAnonymous ? (
                      <>
                        <UserX className="w-4 h-4" />
                        <span className="text-sm">List as Anonymous</span>
                        <Check className={`w-4 h-4 ${darkMode ? 'text-purple-200' : 'text-purple-600'}`} />
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4" />
                        <span className="text-sm">Show my username</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Demo Notice */}
                <div className={`rounded-xl p-3 md:p-4 border ${
                  darkMode 
                    ? 'bg-yellow-900/20 border-yellow-700 text-yellow-300' 
                    : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                }`}>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">
                      Demo Mode: Payments are simulated. No real money will be transferred.
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 md:p-6 sticky bottom-0 bg-inherit">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowSellModal(false)}
                    disabled={submitting}
                    className={`flex-1 px-4 md:px-6 py-2.5 md:py-3 border rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md disabled:opacity-50 ${
                      darkMode 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitListingClick}
                    disabled={!sellForm.title || submitting}
                    className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Listing...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>List for Sale</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        darkMode={darkMode}
        loading={submitting}
      />
    </div>
  );
};

export default SellChatsTab;