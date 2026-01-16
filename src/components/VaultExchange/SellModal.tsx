import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface SellModalProps {
  onClose: () => void;
  darkMode: boolean;
}

const SellModal: React.FC<SellModalProps> = ({ onClose, darkMode }) => {
  const [selectedConversations, setSelectedConversations] = useState<string[]>([]);
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    // Don't prevent body scroll - allow page to be scrollable
    return () => {
      // Clean up if needed
    };
  }, []);

  const conversations = [
    { id: '1', title: 'Startup Ideas for 2024', date: 'June 6, 2024' },
    { id: '2', title: 'React Performance Optimization', date: 'June 4, 2024' },
    { id: '3', title: 'Web3 Investment Analysis', date: 'June 3, 2024' },
  ];

  const handleConversationSelect = (id: string) => {
    setSelectedConversations(prev =>
      prev.includes(id)
        ? prev.filter(convId => convId !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = () => {
    // Handle submission logic here
    console.log('Selling conversations:', { selectedConversations, price, category });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center p-4 pt-24 pb-8">
        <div className={`rounded-xl w-full max-w-lg transition-all duration-300 shadow-2xl ${
          darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className={`text-xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Sell Your Conversations
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                darkMode 
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-3 ${
                  darkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Select Conversations to Sell
                </label>
                <div className="space-y-3">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => handleConversationSelect(conv.id)}
                      className={`border rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${
                        selectedConversations.includes(conv.id)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : darkMode
                            ? 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`font-medium ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {conv.title}
                          </h3>
                          <p className={`text-sm ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {conv.date}
                          </p>
                        </div>
                        {selectedConversations.includes(conv.id) && (
                          <Check className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    Price ($)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="89.99"
                    className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:shadow-sm ${
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
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:shadow-sm ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">Select Category</option>
                    <option value="technology">Technology</option>
                    <option value="business">Business</option>
                    <option value="marketing">Marketing</option>
                    <option value="development">Development</option>
                    <option value="finance">Finance</option>
                    <option value="design">Design</option>
                  </select>
                </div>
              </div>

              <div className={`rounded-xl p-4 border transition-colors duration-300 ${
                darkMode 
                  ? 'bg-yellow-900/20 border-yellow-700' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <h4 className={`font-medium mb-2 ${
                  darkMode ? 'text-yellow-300' : 'text-yellow-800'
                }`}>
                  Privacy & Anonymization
                </h4>
                <p className={`text-sm leading-relaxed ${
                  darkMode ? 'text-yellow-200' : 'text-yellow-700'
                }`}>
                  Your conversations will be automatically anonymized before listing. 
                  All personal identifiers, names, and sensitive information will be removed 
                  to protect your privacy while maintaining the educational value.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6">
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className={`flex-1 px-6 py-3 border rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md ${
                  darkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={selectedConversations.length === 0 || !price || !category}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                List for Sale
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellModal;