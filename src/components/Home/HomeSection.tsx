import React, { useState, useEffect } from 'react';
import { MessageSquare, Archive, Shield } from 'lucide-react';
import { blockchainChatService } from '../../services/blockchainChatService';
import { marketplaceService } from '../../services/marketplaceService';

interface HomeSectionProps {
  darkMode: boolean;
  userProfile?: any;
  dataRefreshKey?: number;
}

const HomeSection: React.FC<HomeSectionProps> = ({ 
  darkMode, 
  userProfile,
  dataRefreshKey = 0
}) => {
  const [stats, setStats] = useState({
    conversations: 0,
    memoriesSaved: 0,
    earnings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!userProfile?.id) {
        setStats({ conversations: 0, memoriesSaved: 0, earnings: 0 });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get chat summary
        const chatSummary = await blockchainChatService.getChatSummary(userProfile.id);
        
        // Get earnings summary
        const earningsSummary = await marketplaceService.getEarningsSummary(userProfile.id);
        
        setStats({
          conversations: chatSummary.totalConversations,
          memoriesSaved: chatSummary.totalMemoriesSaved,
          earnings: earningsSummary.totalEarnings
        });
      } catch (error) {
        console.error('Error loading stats:', error);
        setStats({ conversations: 0, memoriesSaved: 0, earnings: 0 });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [userProfile?.id, dataRefreshKey]); // Added dataRefreshKey to dependency array

  return (
    <div className="space-y-6 animate-fadeIn pb-8 pt-20 md:pt-24">
      <div className="text-center mb-8">
        <h1 className={`text-3xl md:text-4xl font-bold mb-8 transition-colors duration-300 ${
          darkMode 
            ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'
            : 'bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'
        }`}>
          Welcome{userProfile ? `, ${userProfile.nickname}` : ''}!
        </h1>
        <p className={`text-lg md:text-xl transition-colors duration-300 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Your ChainSpeak journey begins here.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className={`rounded-xl border p-6 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group ${
          darkMode 
            ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700 hover:bg-gray-700/80' 
            : 'bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white'
        }`}>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Start a New Conversation
            </h3>
            <p className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Begin chatting with AI in your private space
            </p>
          </div>
        </div>

        <div className={`rounded-xl border p-6 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group ${
          darkMode 
            ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700 hover:bg-gray-700/80' 
            : 'bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white'
        }`}>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Archive className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              View Saved Memories
            </h3>
            <p className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Access your conversation history and insights
            </p>
          </div>
        </div>

        <div className={`rounded-xl border p-6 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group ${
          darkMode 
            ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700 hover:bg-gray-700/80' 
            : 'bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white'
        }`}>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Customize Permissions
            </h3>
            <p className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Manage your privacy and data sharing settings
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className={`rounded-xl border p-6 shadow-xl transition-colors duration-300 max-w-2xl mx-auto ${
        darkMode 
          ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700' 
          : 'bg-white/80 backdrop-blur-sm border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 text-center ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Your ChainSpeak Overview
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              {loading ? (
                <div className="w-8 h-8 mx-auto">
                  <div className="w-full h-full border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                stats.conversations
              )}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Conversations</div>
          </div>
          <div>
            <div className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
              {loading ? (
                <div className="w-8 h-8 mx-auto">
                  <div className="w-full h-full border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                stats.memoriesSaved
              )}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Memories Saved</div>
          </div>
          <div>
            <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              {loading ? (
                <div className="w-8 h-8 mx-auto">
                  <div className="w-full h-full border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                `$${stats.earnings.toFixed(2)}`
              )}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Earnings</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeSection;