import React from 'react';
import { Shield } from 'lucide-react';

interface PermissionsTabProps {
  darkMode: boolean;
}

const PermissionsTab: React.FC<PermissionsTabProps> = ({ darkMode }) => {
  return (
    <div className="flex items-center justify-center">
      <div className="text-center py-16">
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
        </div>
        <h3 className={`text-2xl font-semibold mb-3 transition-colors duration-300 ${
          darkMode 
            ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'
            : 'bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'
        }`}>
          App Access Controls
        </h3>
        <p className={`max-w-md mx-auto leading-relaxed mb-6 transition-colors duration-300 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Advanced permission settings and app access controls are coming soon. 
          You'll be able to manage who can access your conversations and set granular privacy controls.
        </p>
        <div className="flex items-center justify-center space-x-2 text-sm text-blue-600">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <span className="ml-2">Coming Soon</span>
        </div>
      </div>
    </div>
  );
};

export default PermissionsTab;