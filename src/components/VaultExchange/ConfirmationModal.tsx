import React from 'react';
import { X, AlertTriangle, CheckCircle, ShoppingBag, Edit, Trash2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type: 'purchase' | 'edit' | 'delete' | 'list' | 'unlist';
  darkMode: boolean;
  loading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type,
  darkMode,
  loading = false
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'purchase':
        return <ShoppingBag className="w-6 h-6 text-blue-500" />;
      case 'edit':
        return <Edit className="w-6 h-6 text-blue-500" />;
      case 'delete':
      case 'unlist':
        return <Trash2 className="w-6 h-6 text-red-500" />;
      case 'list':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getConfirmButtonColor = () => {
    switch (type) {
      case 'delete':
      case 'unlist':
        return 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700';
      case 'purchase':
      case 'edit':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700';
      case 'list':
        return 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700';
      default:
        return 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700';
    }
  };

  const getConfirmButtonText = () => {
    switch (type) {
      case 'purchase':
        return 'Confirm Purchase';
      case 'edit':
        return 'Save Changes';
      case 'delete':
        return 'Delete';
      case 'unlist':
        return 'Remove Listing';
      case 'list':
        return 'List for Sale';
      default:
        return 'Confirm';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4 pt-8 pb-8 overflow-y-auto">
      <div className={`rounded-2xl w-full max-w-md transition-all duration-300 shadow-2xl transform mx-4 my-auto min-h-0 max-h-[90vh] overflow-y-auto ${
        darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-inherit z-10">
          <div className="flex items-center space-x-3">
            {getIcon()}
            <h2 className={`text-lg md:text-xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {title}
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
        <div className="p-4 md:p-6 flex-1">
          <p className={`text-base leading-relaxed ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 md:p-6 sticky bottom-0 bg-inherit">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className={`flex-1 px-4 md:px-6 py-2.5 md:py-3 border rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md disabled:opacity-50 ${
                darkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-4 md:px-6 py-2.5 md:py-3 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2 ${getConfirmButtonColor()}`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <span>{getConfirmButtonText()}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;