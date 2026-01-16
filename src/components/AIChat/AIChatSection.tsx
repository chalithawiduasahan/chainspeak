import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Copy, ThumbsUp, ThumbsDown, Tag, Shield, Save, CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { chainspeakAssistant, Message } from '../../services/chainspeakAssistant';
import { blockchainChatService, ConversationExchange } from '../../services/blockchainChatService';

// List of topics and related keywords
const TOPICS = [
  { name: "Business", keywords: ["business", "company", "work", "office", "startup", "money", "meeting", "project"] },
  { name: "Health", keywords: ["health", "doctor", "medicine", "hospital", "fitness", "diet", "exercise", "wellness"] },
  { name: "AI", keywords: ["ai", "artificial intelligence", "machine learning", "chatbot", "model", "neural", "algorithm"] },
  { name: "Entertainment", keywords: ["movie", "music", "game", "tv", "show", "concert", "entertainment", "series"] },
  { name: "General", keywords: [] } // fallback
];

// Detect topic based on keywords in the conversation
function detectTopic(messages: string[]): string {
  const text = messages.join(" ").toLowerCase();
  let bestMatch = "General";
  let maxCount = 0;
  for (const topic of TOPICS) {
    if (topic.name === "General") continue;
    let count = 0;
    for (const keyword of topic.keywords) {
      // Count keyword appearances
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      count += (text.match(regex) || []).length;
    }
    if (count > maxCount) {
      maxCount = count;
      bestMatch = topic.name;
    }
  }
  return bestMatch;
}

// Generate a simple title based on topic and first user message
function generateTitle(messages: string[], topic: string): string {
  if (topic === "General") {
    // Use first user message, trimmed to 7 words
    const firstMsg = messages[0] || "";
    return firstMsg.split(" ").slice(0, 7).join(" ") + (firstMsg.split(" ").length > 7 ? "..." : "");
  } else {
    // Use topic and a short phrase from the first user message
    const firstMsg = messages[0] || "";
    return `${topic}: ${firstMsg.split(" ").slice(0, 7).join(" ")}${firstMsg.split(" ").length > 7 ? "..." : ""}`;
  }
}

interface AIChatSectionProps {
  darkMode: boolean;
  userProfile?: any;
  triggerDataRefresh?: () => void;
}

// This function makes a random secret key for encrypting a chat session
function generateEncryptionKey() {
  const array = new Uint8Array(32); // 32 random numbers
  window.crypto.getRandomValues(array); // Fill with random values
  return btoa(String.fromCharCode(...array)); // Turn into a string
}

const AIChatSection: React.FC<AIChatSectionProps> = ({ darkMode, userProfile, triggerDataRefresh }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello${userProfile ? ` ${userProfile.nickname}` : ''}! I'm Chainspeak Assistant, your guide to understanding memory vaults, privacy, and earning from your conversations. How can I help you today?`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveStatus, setLastSaveStatus] = useState<'success' | 'error' | 'fallback' | null>(null);
  const [blockchainStatus, setBlockchainStatus] = useState<any>(null);
  
  // This will hold the secret key for the current chat session
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null); // Add ref for input
  
  // Session management
  const sessionIdRef = useRef<string | null>(null);
  const conversationExchangesRef = useRef<ConversationExchange[]>([]);
  const exchangeCounterRef = useRef<number>(0);

  useEffect(() => {
    // Generate a new session ID and a new encryption key when the component mounts
    sessionIdRef.current = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    conversationExchangesRef.current = [];
    exchangeCounterRef.current = 0;
    setEncryptionKey(generateEncryptionKey()); // <-- This line creates and stores a new key!
    console.log('🆕 New chat session started:', sessionIdRef.current);
  }, []);

  useEffect(() => {
    // Auto-scroll to latest message
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    // Check blockchain service status
    const status = blockchainChatService.getStatus();
    setBlockchainStatus(status);
  }, []);

  const saveSessionToBlockchain = async () => {
    if (!userProfile || !userProfile.id || !userProfile.nickname || !sessionIdRef.current) {
      console.log('Cannot save session: missing user profile, ID, or nickname');
      return;
    }

    if (conversationExchangesRef.current.length === 0) {
      return;
    }

    try {
      console.log('💾 Saving session to blockchain...', {
        sessionId: sessionIdRef.current,
        userId: userProfile.id,
        authUserId: userProfile.auth_user_id,
        username: userProfile.nickname,
        exchangeCount: conversationExchangesRef.current.length
      });

      setIsSaving(true);
      
      const { cid, txId } = await blockchainChatService.saveSessionToBlockchain(
        sessionIdRef.current,
        userProfile.id,
        userProfile.nickname,
        conversationExchangesRef.current,
        encryptionKey,
        userProfile.auth_user_id // Pass auth user ID
      );
      
      console.log('✅ Session save completed:', { cid, txId, sessionId: sessionIdRef.current });
      
      // Determine save status based on the response
      if (cid.startsWith('error-fallback-') || cid.startsWith('fallback-')) {
        setLastSaveStatus('fallback');
      } else if (cid && txId && !txId.startsWith('pending-') && !txId.startsWith('local-')) {
        setLastSaveStatus('success');
      } else if (cid && (txId.startsWith('pending-') || txId.startsWith('local-'))) {
        setLastSaveStatus('fallback');
      } else {
        setLastSaveStatus('error');
      }
      
      // Trigger data refresh after successful save
      if (triggerDataRefresh) {
        triggerDataRefresh();
        console.log('🔄 Data refresh triggered after conversation save');
      }
      
      setTimeout(() => setLastSaveStatus(null), 5000);
    } catch (saveError) {
      console.error('❌ Failed to save session:', saveError);
      setLastSaveStatus('error');
      setTimeout(() => setLastSaveStatus(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    const currentInput = inputValue;
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Get AI response from Chainspeak Assistant
      const aiMessage = await chainspeakAssistant.sendMessage(currentInput);
      setMessages(prev => [...prev, aiMessage]);

      // Add to conversation exchanges for session saving
      if (userProfile && userProfile.id && userProfile.nickname && sessionIdRef.current) {
        const exchange: ConversationExchange = {
          userMessage: currentInput,
          aiReply: aiMessage.content,
          timestamp: new Date()
        };
        
        conversationExchangesRef.current.push(exchange);
        exchangeCounterRef.current += 1;

        console.log('📝 Added exchange to session:', {
          sessionId: sessionIdRef.current,
          userId: userProfile.id,
          authUserId: userProfile.auth_user_id,
          username: userProfile.nickname,
          totalExchanges: conversationExchangesRef.current.length
        });

        // Save individual message to database immediately
        try {
          await blockchainChatService.saveMessageToDatabase(
            userProfile.id,
            userProfile.nickname,
            currentInput,
            aiMessage.content,
            sessionIdRef.current,
            exchangeCounterRef.current,
            encryptionKey,
            userProfile.auth_user_id // Pass auth user ID
          );
          console.log('✅ Message saved to database');
        } catch (error) {
          console.warn('Failed to save individual message to database:', error);
        }

        // Save entire session to blockchain/storage after each message
        try {
          await saveSessionToBlockchain();
        } catch (error) {
          console.warn('Failed to save session to blockchain:', error);
          // Don't throw error - message was saved to database
        }
      } else {
        console.warn('Cannot save message: missing user profile, ID, or nickname');
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      // Focus the input after message is processed
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const TypingIndicator = () => (
    <div className="flex items-start space-x-3 px-4 md:px-8">
      <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
        <Bot className="w-4 h-4 md:w-5 md:h-5 text-white" />
      </div>
      <div className={`rounded-2xl rounded-tl-md p-3 md:p-4 shadow-md ${
        darkMode ? 'bg-gray-700' : 'bg-gray-100'
      }`}>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );

  const BlockchainStatusIndicator = () => {
    const isFullyReady = blockchainStatus?.filebase && blockchainStatus?.algorand;
    
    return (
      <div className={`text-xs md:text-sm px-3 md:px-4 py-2 rounded-full border shadow-sm transition-colors duration-300 ${
        isFullyReady
          ? darkMode 
            ? 'bg-gradient-to-r from-green-800 to-blue-800 border-green-600 text-green-300'
            : 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200 text-green-700'
          : darkMode
            ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600 text-gray-300'
            : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 text-gray-600'
      }`}>
        <div className="flex items-center space-x-2">
          {isFullyReady ? (
            <Wifi className="w-3 h-3" />
          ) : (
            <WifiOff className="w-3 h-3" />
          )}
          <span>Blockchain Ready</span>
          {userProfile && userProfile.id && userProfile.nickname && (
            <>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Auto-saving</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const SaveStatusIndicator = () => {
    if (isSaving) {
      return (
        <div className="flex items-center space-x-2 text-blue-600">
          <Save className="w-4 h-4 animate-spin" />
          <span className="text-sm">Saving conversation...</span>
        </div>
      );
    }

    if (lastSaveStatus === 'success') {
      return (
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">Saved to blockchain!</span>
        </div>
      );
    }

    if (lastSaveStatus === 'fallback') {
      return (
        <div className="flex items-center space-x-2 text-yellow-600">
          <Shield className="w-4 h-4" />
          <span className="text-sm">Saved locally (blockchain unavailable)</span>
        </div>
      );
    }

    if (lastSaveStatus === 'error') {
      return (
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Save failed - trying again...</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] flex flex-col animate-fadeIn">
      {/* Header Section */}
      <div className="flex-shrink-0 px-4 md:px-8 py-4 md:py-6 pt-20 md:pt-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
          <h1 className={`text-xl md:text-3xl font-bold transition-colors duration-300 ${
            darkMode 
              ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'
          }`}>
            Chat with Chainspeak Assistant
          </h1>
          <div className="flex items-center space-x-2">
            <BlockchainStatusIndicator />
          </div>
        </div>
        
        {/* Status Indicators */}
        <div className="mt-3 flex flex-col space-y-2">
          {(!userProfile?.id || !userProfile?.nickname) && (
            <div className={`text-xs px-3 py-1 rounded-full border ${
              darkMode 
                ? 'bg-yellow-900/20 border-yellow-700 text-yellow-300'
                : 'bg-yellow-50 border-yellow-200 text-yellow-700'
            }`}>
              Please sign in to save conversations
            </div>
          )}
          
          {/* Save Status */}
          {(isSaving || lastSaveStatus) && (
            <div>
              <SaveStatusIndicator />
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-4">
        <div className="space-y-4 md:space-y-6 pb-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 animate-fadeIn ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 ${
                message.sender === 'user' 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white' 
                  : 'bg-gradient-to-br from-purple-500 to-blue-500 text-white'
              }`}>
                {message.sender === 'user' ? (
                  <User className="w-4 h-4 md:w-5 md:h-5" />
                ) : (
                  <Bot className="w-4 h-4 md:w-5 md:h-5" />
                )}
              </div>
              
              <div className={`flex-1 group ${
                message.sender === 'user' ? 'text-right' : 'text-left'
              }`}>
                <div className={`inline-block p-3 md:p-4 rounded-2xl shadow-md transition-all duration-300 hover:shadow-lg max-w-full md:max-w-4xl ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-tr-md'
                    : darkMode
                      ? 'bg-gray-700 text-gray-100 rounded-tl-md border border-gray-600'
                      : 'bg-gray-50 text-gray-900 rounded-tl-md border border-gray-100'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">{message.content}</p>
                </div>
                
                <div className="mt-2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                  {message.sender === 'ai' && (
                    <div className="flex items-center space-x-1">
                      <button className={`p-1.5 rounded-lg transition-all duration-300 hover:scale-110 ${
                        darkMode 
                          ? 'text-gray-500 hover:text-green-400 hover:bg-gray-600' 
                          : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                      }`}>
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button className={`p-1.5 rounded-lg transition-all duration-300 hover:scale-110 ${
                        darkMode 
                          ? 'text-gray-500 hover:text-red-400 hover:bg-gray-600' 
                          : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                      }`}>
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                      <button className={`p-1.5 rounded-lg transition-all duration-300 hover:scale-110 ${
                        darkMode 
                          ? 'text-gray-500 hover:text-blue-400 hover:bg-gray-600' 
                          : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                      }`}>
                        <Copy className="w-3 h-3" />
                      </button>
                      <button className={`p-1.5 rounded-lg transition-all duration-300 hover:scale-110 ${
                        darkMode 
                          ? 'text-gray-500 hover:text-purple-400 hover:bg-gray-600' 
                          : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                      }`}>
                        <Tag className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className={`flex-shrink-0 border-t transition-colors duration-300 ${
        darkMode 
          ? 'border-gray-700 bg-gray-800/95' 
          : 'border-gray-200 bg-white/95'
      } backdrop-blur-sm`}>
        <div className="px-4 md:px-8 py-3 md:py-4 pb-safe">
          <div className="flex space-x-2 md:space-x-3">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about ChainSpeak..."
              className={`flex-1 resize-none border rounded-xl px-3 md:px-4 py-2.5 md:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md text-sm md:text-base ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              rows={1}
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="px-4 md:px-5 py-2.5 md:py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-1 md:space-x-2 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatSection;