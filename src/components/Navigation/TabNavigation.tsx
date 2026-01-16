import React from 'react';
import { 
  Home,
  Archive, 
  MessageSquare, 
  BarChart3, 
  ShoppingBag, 
  Settings,
  X
} from 'lucide-react';
import { TabType } from '../../App';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  darkMode?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  darkMode = false, 
  isOpen, 
  onClose 
}) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'memory' as TabType, label: 'Memory', icon: Archive },
    { id: 'chat' as TabType, label: 'AI Chat', icon: MessageSquare },
    { id: 'insights' as TabType, label: 'Insights', icon: BarChart3 },
    { id: 'exchange' as TabType, label: 'Vault Exchange', icon: ShoppingBag },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      <nav className={`fixed left-0 top-16 h-full w-64 backdrop-blur-md border-r pt-6 transition-all duration-300 z-50 ${
        darkMode 
          ? 'bg-gray-900/90 border-gray-700' 
          : 'bg-white/90 border-gray-200'
      } ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="flex items-center justify-between px-4 mb-4 md:hidden">
          <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Navigation
          </span>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all duration-300 ${
              darkMode 
                ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="px-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 hover:scale-105 group ${
                  isActive
                    ? darkMode
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                    : darkMode
                      ? 'text-gray-300 hover:bg-gray-800/50 hover:text-white hover:shadow-md'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md'
                }`}
              >
                <Icon className={`w-5 h-5 transition-all duration-300 ${
                  isActive 
                    ? 'text-white' 
                    : darkMode 
                      ? 'text-gray-400 group-hover:text-white' 
                      : 'text-gray-500 group-hover:text-gray-700'
                }`} />
                <span className="font-medium">{tab.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default TabNavigation;