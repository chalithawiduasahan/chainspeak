import React, { useState, useEffect } from 'react';
import { X, Shield, Link, Calendar, Bot, User, Loader } from 'lucide-react';
import { ChatSession } from '../../services/blockchainChatService';
import { blockchainChatService } from '../../services/blockchainChatService';
import { ConversationData } from '../../lib/encryption';

interface ConversationModalProps {
  conversation: ChatSession;
  onClose: () => void;
  darkMode: boolean;
}

const ConversationModal: React.FC<ConversationModalProps> = ({ conversation, onClose, darkMode }) => {
  const [decryptedConversation, setDecryptedConversation] = useState<ConversationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConversationFromBlockchain = async () => {
      if (!conversation.ipfsCid) {
        setError('No IPFS CID found for this conversation');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('🔍 Loading conversation from blockchain:', conversation.ipfsCid);
        
        const blockchainData = await blockchainChatService.getConversationFromBlockchain(
          conversation.ipfsCid,
          conversation.encryptionKey // <-- pass the key!
        );
        
        if (blockchainData) {
          setDecryptedConversation(blockchainData);
          console.log('✅ Successfully loaded and decrypted conversation');
        } else {
          setError('Failed to decrypt conversation data');
        }
      } catch (error) {
        console.error('❌ Error loading conversation:', error);
        setError('Failed to load conversation from blockchain');
      } finally {
        setIsLoading(false);
      }
    };

    loadConversationFromBlockchain();
  }, [conversation.ipfsCid, conversation.encryptionKey]);

  const renderMessages = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <Loader className="w-6 h-6 animate-spin text-blue-500" />
            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Decrypting conversation from blockchain...
            </span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 mb-2">⚠️ Error</div>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {error}
            </p>
          </div>
        </div>
      );
    }

    if (!decryptedConversation) {
      return (
        <div className="flex items-center justify-center py-12">
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            No conversation data available
          </p>
        </div>
      );
    }

    // Render the decrypted conversation exchanges
    return (
      <div className="space-y-6">
        {decryptedConversation.exchanges.map((exchange, index) => (
          <div key={index} className="space-y-4">
            {/* User Message */}
            <div className="flex items-start space-x-3 flex-row-reverse space-x-reverse">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 text-right">
                <div className="inline-block p-4 rounded-2xl shadow-md max-w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-tr-md">
                  <p className="whitespace-pre-wrap leading-relaxed">{exchange.userMessage}</p>
                </div>
                <div className="mt-2">
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(exchange.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Reply */}
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <div className={`inline-block p-4 rounded-2xl shadow-md max-w-full rounded-tl-md border ${
                  darkMode
                    ? 'bg-gray-700 text-gray-100 border-gray-600'
                    : 'bg-gray-50 text-gray-900 border-gray-100'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{exchange.aiReply}</p>
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
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center p-2 md:p-4 pt-4 md:pt-8 pb-4 md:pb-8">
        <div className={`relative rounded-xl w-full max-w-4xl transition-all duration-300 shadow-2xl flex flex-col mx-2 md:mx-4 ${
          darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`} style={{ height: '90vh', maxHeight: '90vh' }}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex-1 min-w-0">
              <h2 className={`text-lg md:text-xl font-bold truncate ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {conversation.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2">
                <div className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{conversation.createdAt.toLocaleDateString()}</span>
                </div>
                {conversation.isEncrypted && (
                  <div className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm text-green-600">
                    <Shield className="w-4 h-4" />
                    <span>Blockchain Encrypted</span>
                  </div>
                )}
                {conversation.ipfsCid && (
                  <div className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm text-blue-600">
                    <Link className="w-4 h-4" />
                    <span>IPFS Stored</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1 md:gap-2 mt-2">
                {conversation.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 text-xs rounded-full border border-blue-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <button
  onClick={onClose}
  className={`absolute top-2 right-2 md:top-4 md:right-4 z-10 p-1.5 md:p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-all ${
    darkMode 
      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
  }`}
>
  <X className="w-4 h-4 md:w-5 md:h-5" />
</button>
          </div>

          {/* Messages */}
          <div className="p-3 md:p-6 overflow-y-auto flex-1 min-h-0">
            {renderMessages()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationModal;