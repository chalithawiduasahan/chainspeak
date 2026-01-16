import React, { useState } from 'react';
import ConversationsTab from './ConversationsTab';
import PermissionsTab from './PermissionsTab';

type MemorySubTab = 'conversations' | 'permissions';

interface MemorySectionProps {
  darkMode: boolean;
  userProfile?: any;
}

const MemorySection: React.FC<MemorySectionProps> = ({ darkMode, userProfile }) => {
  const [activeSubTab, setActiveSubTab] = useState<MemorySubTab>('conversations');

  return (
    <div className="space-y-6 animate-fadeIn pb-8 w-full min-w-0 pt-20 md:pt-24 h-screen flex flex-col">
      <div className="flex items-center justify-between px-4 md:px-0 flex-shrink-0">
        <h1 className={`text-2xl md:text-3xl font-bold transition-colors duration-300 ${
          darkMode 
            ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'
            : 'bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'
        }`}>
          Memory Vault
        </h1>
      </div>

      <div className={`rounded-xl border shadow-xl transition-all duration-300 mx-2 md:mx-0 flex flex-col ${
  darkMode 
    ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700' 
    : 'bg-white/80 backdrop-blur-sm border-gray-200'
}`}>
        <div className={`border-b transition-colors duration-300 flex-shrink-0 ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <nav className="flex space-x-4 md:space-x-8 px-4 md:px-6 pt-6 overflow-x-auto">
            <button
              onClick={() => setActiveSubTab('conversations')}
              className={`py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-300 ${
                activeSubTab === 'conversations'
                  ? 'border-blue-500 text-blue-600'
                  : darkMode
                    ? 'border-transparent text-gray-400 hover:text-gray-200'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Conversations
            </button>
            <button
              onClick={() => setActiveSubTab('permissions')}
              className={`py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-300 ${
                activeSubTab === 'permissions'
                  ? 'border-blue-500 text-blue-600'
                  : darkMode
                    ? 'border-transparent text-gray-400 hover:text-gray-200'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Permissions
            </button>
          </nav>
        </div>

        <div className="p-4 md:p-6">
  {activeSubTab === 'conversations' ? (
    <ConversationsTab darkMode={darkMode} userProfile={userProfile} />
  ) : (
    <PermissionsTab darkMode={darkMode} />
  )}
</div>

      </div>
    </div>
  );
};

export default MemorySection;