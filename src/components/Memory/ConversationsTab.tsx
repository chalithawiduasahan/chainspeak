import React, { useState, useEffect } from 'react';
import { Search, Tag, Calendar, Bot, Archive, Shield, Eye, Link, CheckCircle } from 'lucide-react';
import { blockchainChatService, ChatSession } from '../../services/blockchainChatService';
import ConversationModal from './ConversationModal';
import { detectTopic, generateTitle } from '../../utils/chatUtils';

interface ConversationsTabProps {
  darkMode: boolean;
  userProfile?: any;
}

const ConversationsTab: React.FC<ConversationsTabProps> = ({ darkMode, userProfile }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<ChatSession | null>(null);
  const [editingTags, setEditingTags] = useState<string | null>(null);
  const [newTags, setNewTags] = useState<string>('');

  useEffect(() => {
    loadConversations();
  }, [userProfile]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      
      if (userProfile && userProfile.id) {
        // Load conversations from blockchain/IPFS using user ID (UUID)
        const userConversations = await blockchainChatService.getUserConversations(userProfile.id);
        setConversations(userConversations);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTags = (conversationId: string, currentTags: string[]) => {
    setEditingTags(conversationId);
    setNewTags(currentTags.join(', '));
  };

  const handleSaveTags = async (conversationId: string) => {
    try {
      const tagsArray = newTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      // Update the conversation tags locally
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, tags: tagsArray }
          : conv
      ));
      
      // In a real implementation, you would save to the database here
      // await blockchainChatService.updateConversationTags(conversationId, userProfile.id, tagsArray);
      
      setEditingTags(null);
      setNewTags('');
    } catch (error) {
      console.error('Failed to update tags:', error);
    }
  };

  const handleCancelEditTags = () => {
    setEditingTags(null);
    setNewTags('');
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
    conv.messages.some(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="animate-pulse mb-4">
          <div className={`h-12 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </div>
        <div className="flex-1 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`animate-pulse p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div className={`h-4 rounded mb-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
              <div className={`h-3 rounded w-3/4 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 mb-4">
        <div className="relative">
          <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
          <input
            type="text"
            placeholder="Search conversations, tags, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md text-sm md:text-base ${
              darkMode 
                ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
      </div>

      <div>
        {filteredConversations.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center py-12 md:py-16">
              <div className={`mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                <Archive className="w-12 h-12 md:w-16 md:h-16 mx-auto" />
              </div>
              <h3 className={`text-lg md:text-xl font-medium mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                No conversations found
              </h3>
              <p className={`text-sm md:text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {userProfile && userProfile.id
                  ? 'Start a conversation in the AI Chat tab to see your encrypted conversations here.'
                  : 'Please create a profile to view your conversations.'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4 pb-4">
            {filteredConversations.map((conversation, index) => (
              <div
                key={conversation.id}
                className={`border rounded-xl p-3 md:p-6 hover:shadow-lg transition-all duration-300 cursor-pointer backdrop-blur-sm hover:scale-[1.02] group ${
                  darkMode 
                    ? 'border-gray-600 bg-gray-700/30 hover:bg-gray-700/50' 
                    : 'border-gray-200 bg-white/80 hover:bg-white'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2 md:space-y-3 min-w-0" onClick={() => setSelectedConversation(conversation)}>
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <h3 className={`text-base md:text-lg font-semibold group-hover:text-blue-600 transition-colors duration-300 truncate ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {generateTitle(
                          conversation.messages.map(msg => msg.content),
                          detectTopic(conversation.messages.map(msg => msg.content))
                        )}
                      </h3>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        {conversation.isEncrypted && (
                          <div className="relative group/tooltip">
                            <Shield className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
                              Blockchain Verified
                            </div>
                          </div>
                        )}
                        {conversation.ipfsCid && (
                          <div className="relative group/tooltip">
                            <Link className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
                              IPFS Stored
                            </div>
                          </div>
                        )}
                        {conversation.algorandTxId && (
                          <div className="relative group/tooltip">
                            <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-purple-500" />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
                              Algorand Verified
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className={`flex flex-wrap md:flex-nowrap items-center gap-x-3 gap-y-1 md:gap-x-4 text-xs md:text-sm ${
  darkMode ? 'text-gray-300' : 'text-gray-600'
}`}>
  <div className="flex items-center space-x-1 md:space-x-2">
    <div className="w-4 h-4 md:w-6 md:h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
      <Bot className="w-2 h-2 md:w-3 md:h-3 text-white" />
    </div>
    <span className="truncate">Chainspeak AI</span>
  </div>
  <div className="flex items-center space-x-1 flex-shrink-0">
    <Calendar className="w-3 h-3 md:w-4 md:h-4" />
    <span className="whitespace-nowrap">{conversation.createdAt.toLocaleDateString()}</span>
  </div>
  <div className="flex items-center space-x-1 flex-shrink-0">
    <Eye className="w-3 h-3 md:w-4 md:h-4" />
    <span className="whitespace-nowrap">{conversation.messages.length} messages</span>
  </div>
</div>
                    
                    <p className={`line-clamp-2 leading-relaxed text-xs md:text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {conversation.messages[0]?.content || 'No preview available'}
                    </p>
                    
                    {/* Tags Section */}
                    {editingTags === conversation.id ? (
                      <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={newTags}
                          onChange={(e) => setNewTags(e.target.value)}
                          placeholder="Enter tags separated by commas..."
                          className={`w-full px-3 py-2 border rounded-lg text-sm ${
                            darkMode 
                              ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                          autoFocus
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSaveTags(conversation.id)}
                            className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors duration-300"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEditTags}
                            className={`px-3 py-1 text-xs rounded-lg transition-colors duration-300 ${
                              darkMode 
                                ? 'bg-gray-600 text-gray-300 hover:bg-gray-700' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 md:space-x-2 flex-wrap gap-1">
                        {conversation.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 md:px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 text-xs rounded-full border border-blue-200 hover:from-blue-100 hover:to-purple-100 transition-all duration-300 whitespace-nowrap"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1 md:space-x-2 ml-2 md:ml-4 opacity-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0">
                    <div className="relative group/tooltip">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTags(conversation.id, conversation.tags);
                        }}
                        className={`p-1.5 md:p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                          darkMode 
                            ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-600' 
                            : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        <Tag className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
                        Edit Tags
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conversation Modal */}
      {selectedConversation && (
        <ConversationModal
          conversation={selectedConversation}
          onClose={() => setSelectedConversation(null)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default ConversationsTab;