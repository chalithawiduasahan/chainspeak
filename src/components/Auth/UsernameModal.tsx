import React, { useState } from 'react';
import { X, User, Loader2 } from 'lucide-react';
import { authService } from '../../services/authService';

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  darkMode: boolean;
}

const UsernameModal: React.FC<UsernameModalProps> = ({ isOpen, onClose, onSuccess, darkMode }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !username.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const user = await authService.signInWithUsername(username.trim());
      onSuccess(user);
      setUsername('');
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`rounded-2xl w-full max-w-md transition-all duration-300 shadow-2xl transform ${
        darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <h2 className={`text-xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Start ChainSpeaking
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 disabled:opacity-50 ${
              darkMode 
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={username}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  minLength={3}
                  maxLength={20}
                  pattern="[a-zA-Z0-9_-]+"
                  title="Username can only contain letters, numbers, underscores, and hyphens"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="Enter your username"
                  autoFocus
                />
              </div>
              <p className={`mt-2 text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                3-20 characters. Letters, numbers, underscores, and hyphens only.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl p-4 bg-red-900/20 border border-red-700">
                <p className="text-sm text-red-200">
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-lg font-medium flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <span>Continue</span>
              )}
            </button>

            <p className={`text-xs text-center ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              If this username exists, you'll be logged in. If not, a new account will be created.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsernameModal;
