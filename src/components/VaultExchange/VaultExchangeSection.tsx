import React, { useState } from 'react';
import MarketplaceTab from './MarketplaceTab';
import SellChatsTab from './SellChatsTab';
import MyListingsTab from './MyListingsTab';
import BoughtChatsTab from './BoughtChatsTab';

type VaultExchangeSubTab = 'marketplace' | 'sell' | 'listings' | 'bought';

interface VaultExchangeSectionProps {
  darkMode: boolean;
  userProfile?: any;
  triggerDataRefresh?: () => void;
}

const VaultExchangeSection: React.FC<VaultExchangeSectionProps> = ({ darkMode, userProfile, triggerDataRefresh }) => {
  const [activeSubTab, setActiveSubTab] = useState<VaultExchangeSubTab>('marketplace');

  const tabs = [
    { id: 'marketplace' as VaultExchangeSubTab, label: 'Marketplace', description: 'Browse and buy chats' },
    { id: 'sell' as VaultExchangeSubTab, label: 'Sell Your Chats', description: 'List your conversations' },
    { id: 'listings' as VaultExchangeSubTab, label: 'My Listings', description: 'Manage your sales' },
    { id: 'bought' as VaultExchangeSubTab, label: 'Bought Chats', description: 'Access purchased content' }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-8 pt-20 md:pt-24">
      <div className="flex items-center justify-between">
        <h1 className={`text-2xl md:text-3xl font-bold transition-colors duration-300 ${
          darkMode 
            ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'
            : 'bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'
        }`}>
          Vault Exchange
        </h1>
      </div>

      <div className={`rounded-xl border shadow-xl transition-all duration-300 ${
        darkMode 
          ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700' 
          : 'bg-white/80 backdrop-blur-sm border-gray-200'
      }`}>
        {/* Tab Navigation */}
        <div className={`border-b transition-colors duration-300 ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <nav className="flex space-x-0 px-4 md:px-6 pt-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`py-4 px-4 md:px-6 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                  activeSubTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : darkMode
                      ? 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="font-medium">{tab.label}</div>
                  <div className={`text-xs mt-1 ${
                    activeSubTab === tab.id
                      ? 'text-blue-500'
                      : darkMode
                        ? 'text-gray-500'
                        : 'text-gray-400'
                  }`}>
                    {tab.description}
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4 md:p-6">
          {activeSubTab === 'marketplace' && (
            <MarketplaceTab darkMode={darkMode} userProfile={userProfile} triggerDataRefresh={triggerDataRefresh} />
          )}
          {activeSubTab === 'sell' && (
            <SellChatsTab darkMode={darkMode} userProfile={userProfile} triggerDataRefresh={triggerDataRefresh} />
          )}
          {activeSubTab === 'listings' && (
            <MyListingsTab darkMode={darkMode} userProfile={userProfile} triggerDataRefresh={triggerDataRefresh} />
          )}
          {activeSubTab === 'bought' && (
            <BoughtChatsTab darkMode={darkMode} userProfile={userProfile} />
          )}
        </div>
      </div>
    </div>
  );
};

export default VaultExchangeSection;