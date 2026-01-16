import React, { useState } from 'react';
import { X, User, Shield } from 'lucide-react';

interface NicknameModalProps {
  onSubmit: (nickname: string) => void;
  onClose: () => void;
  darkMode: boolean;
}

const NicknameModal: React.FC<NicknameModalProps> = ({ onSubmit, onClose, darkMode }) => {
  const [nickname, setNickname] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(nickname.trim());
      // onSubmit will handle the success case
    } catch (error: any) {
      console.error('Failed to create profile:', error);
      setError(error.message || 'Failed to create profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && nickname.trim() && !isSubmitting) {
      handleSubmit(e);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4 pt-8 pb-8 overflow-y-auto">
      <div className={`rounded-2xl w-full max-w-md transition-all duration-300 shadow-2xl transform mx-4 my-auto min-h-0 max-h-[90vh] overflow-y-auto ${
        'bg-gray-800 border border-gray-700'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-700 sticky top-0 bg-inherit z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white pr-8">
              Welcome to ChainSpeak
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="absolute top-4 right-4 p-1.5 md:p-2 rounded-lg transition-all duration-300 hover:scale-110 disabled:opacity-50 text-gray-400 hover:text-gray-200 hover:bg-gray-700"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 flex-1">
          <div className="text-center mb-6">
            <p className="text-base md:text-lg mb-2 text-gray-200">
              Let's personalize your experience
            </p>
            <p className="text-sm text-gray-400">
              Choose a nickname to start with ChainSpeak.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-200">
                Enter your nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g: Alex"
                className="w-full border rounded-xl px-4 py-2.5 md:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                autoFocus
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <div className="rounded-xl p-4 bg-red-900/20 border border-red-700">
                <p className="text-sm text-red-200">
                  {error}
                </p>
              </div>
            )}

            <div className="rounded-xl p-4 bg-blue-900/20 border border-blue-700">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 mt-0.5 text-blue-300" />
                <div>
                  <p className="text-sm font-medium mb-1 text-blue-200">
                    Privacy & Security
                  </p>
                  <p className="text-xs text-blue-300">
                    Your data are encrypted and stored on blockchain for maximum privacy.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-2.5 md:py-3 border rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!nickname.trim() || isSubmitting}
              className="flex-1 px-6 py-2.5 md:py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Profile...</span>
                </div>
              ) : (
                'Create'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NicknameModal;