import React, { useState } from 'react';
import AnalyticsTab from './AnalyticsTab';
import EarningsTab from './EarningsTab';

type InsightsSubTab = 'analytics' | 'earnings';

interface InsightsSectionProps {
  darkMode: boolean;
  userProfile?: any;
  dataRefreshKey?: number;
  triggerDataRefresh?: () => void;
}

const InsightsSection: React.FC<InsightsSectionProps> = ({ 
  darkMode, 
  userProfile, 
  dataRefreshKey = 0, 
  triggerDataRefresh 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<InsightsSubTab>('analytics');

  return (
    <div className="space-y-6 animate-fadeIn pb-8 pt-20 md:pt-24">
      <div className="flex items-center justify-between">
        <h1 className={`text-2xl md:text-3xl font-bold transition-colors duration-300 ${
          darkMode 
            ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'
            : 'bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'
        }`}>
          Insights
        </h1>
      </div>

      <div className={`rounded-xl border shadow-xl transition-all duration-300 ${
        darkMode 
          ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700' 
          : 'bg-white/80 backdrop-blur-sm border-gray-200'
      }`}>
        <div className={`border-b transition-colors duration-300 ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <nav className="flex space-x-4 md:space-x-8 px-4 md:px-6 pt-6">
            <button
              onClick={() => setActiveSubTab('analytics')}
              className={`py-4 border-b-2 font-medium text-sm transition-all duration-300 ${
                activeSubTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : darkMode
                    ? 'border-transparent text-gray-400 hover:text-gray-200'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveSubTab('earnings')}
              className={`py-4 border-b-2 font-medium text-sm transition-all duration-300 ${
                activeSubTab === 'earnings'
                  ? 'border-blue-500 text-blue-600'
                  : darkMode
                    ? 'border-transparent text-gray-400 hover:text-gray-200'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Earnings
            </button>
          </nav>
        </div>

        <div className="p-4 md:p-6">
          {activeSubTab === 'analytics' ? (
            <AnalyticsTab darkMode={darkMode} userProfile={userProfile} dataRefreshKey={dataRefreshKey} />
          ) : (
            <EarningsTab darkMode={darkMode} userProfile={userProfile} dataRefreshKey={dataRefreshKey} />
          )}
        </div>
      </div>
    </div>
  );
};

export default InsightsSection;