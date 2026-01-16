import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, TrendingUp, X, CreditCard } from 'lucide-react';
import { marketplaceService } from '../../services/marketplaceService';

interface EarningsTabProps {
  darkMode: boolean;
  userProfile?: any;
  dataRefreshKey?: number;
}

const EarningsTab: React.FC<EarningsTabProps> = ({ darkMode, userProfile, dataRefreshKey = 0 }) => {
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    chatsSold: 0,
    averagePrice: 0,
    recentSales: []
  });
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  useEffect(() => {
    const loadEarnings = async () => {
      if (!userProfile?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const earningsSummary = await marketplaceService.getEarningsSummary(userProfile.id);
        setEarnings(earningsSummary);
      } catch (error) {
        console.error('Error loading earnings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEarnings();
  }, [userProfile?.id, dataRefreshKey]);

  const earningsStats = [
    {
      label: 'Total Earnings',
      value: `$${earnings.totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      change: earnings.totalEarnings > 0 ? 'From chat sales' : 'No sales yet',
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Chats Sold',
      value: earnings.chatsSold.toString(),
      icon: ShoppingBag,
      change: earnings.chatsSold > 0 ? 'Successful sales' : 'List your first chat',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Average Price',
      value: `$${earnings.averagePrice.toFixed(2)}`,
      icon: TrendingUp,
      change: earnings.averagePrice > 0 ? 'Per chat sold' : 'No sales yet',
      color: 'from-orange-500 to-amber-500'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`animate-pulse p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div className={`h-4 rounded mb-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
              <div className={`h-3 rounded w-3/4 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {earningsStats.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <div 
              key={index} 
              className={`backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border ${
                darkMode 
                  ? 'bg-gray-700/80 border-gray-600' 
                  : 'bg-white/80 border-gray-100'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg`}>
                  <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <span className={`text-sm font-medium ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {stat.label}
                </span>
              </div>
              <div className={`text-xl md:text-2xl font-bold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {stat.value}
              </div>
              <div className="text-sm text-green-600 font-medium">{stat.change}</div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end mb-4">
        <button
          className={`px-6 py-2 rounded-lg font-semibold shadow transition-all duration-300 hover:scale-105 ${
            darkMode
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
          onClick={() => setShowWithdrawModal(true)}
        >
          Withdraw
        </button>
      </div>

      {earnings.recentSales.length > 0 && (
        <div className={`backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-lg border transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-700/80 border-gray-600' 
            : 'bg-white/80 border-gray-100'
        }`}>
          <h3 className={`text-lg font-semibold mb-6 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Recent Sales
          </h3>
          <div className="space-y-4">
            {earnings.recentSales.slice(0, 3).map((sale, index) => (
              <div 
                key={sale.id} 
                className={`flex items-center justify-between py-4 px-4 rounded-lg transition-all duration-300 border hover:shadow-md group ${
                  darkMode 
                    ? 'hover:bg-gray-600/50 border-gray-600' 
                    : 'hover:bg-gray-50 border-gray-100'
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex-1">
                  <h4 className={`font-medium group-hover:text-blue-600 transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {sale.title}
                  </h4>
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Chat sold
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600 text-lg">${sale.price.toFixed(2)}</div>
                  <div className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {new Date(sale.soldAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="ml-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`rounded-xl p-4 md:p-6 border shadow-lg transition-colors duration-300 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600' 
          : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Earnings Potential
        </h3>
        <p className={`mb-6 leading-relaxed ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Your conversations are valuable! Based on current market trends, you could potentially earn more by:
        </p>
        <ul className={`space-y-3 text-sm ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          <li className="flex items-center space-x-3 group">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full group-hover:scale-125 transition-transform duration-300"></div>
            <span>Creating more technical deep-dive conversations (+30% premium)</span>
          </li>
          <li className="flex items-center space-x-3 group">
            <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-full group-hover:scale-125 transition-transform duration-300"></div>
            <span>Adding detailed tags and summaries (+20% discoverability)</span>
          </li>
          <li className="flex items-center space-x-3 group">
            <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full group-hover:scale-125 transition-transform duration-300"></div>
            <span>Listing conversations with unique insights and perspectives</span>
          </li>
        </ul>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl w-full max-w-md transition-all duration-300 shadow-2xl transform mx-4 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <h2 className={`text-lg md:text-xl font-bold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Withdraw Earnings
                </h2>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
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
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Payment Gateways Coming Soon!
                </h3>
                <p className={`text-base leading-relaxed ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  We're working hard to integrate secure payment gateways for withdrawals. 
                  Soon you'll be able to withdraw your earnings directly to your bank account, 
                  PayPal, or crypto wallet.
                </p>
              </div>

              <div className={`rounded-xl p-4 border ${
                darkMode 
                  ? 'bg-blue-900/20 border-blue-700' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-start space-x-3">
                  <DollarSign className={`w-5 h-5 mt-0.5 ${
                    darkMode ? 'text-blue-300' : 'text-blue-600'
                  }`} />
                  <div>
                    <p className={`text-sm font-medium mb-1 ${
                      darkMode ? 'text-blue-200' : 'text-blue-700'
                    }`}>
                      Your Current Balance
                    </p>
                    <p className={`text-lg font-bold ${
                      darkMode ? 'text-blue-100' : 'text-blue-800'
                    }`}>
                      ${earnings.totalEarnings.toFixed(2)}
                    </p>
                    <p className={`text-xs mt-1 ${
                      darkMode ? 'text-blue-300' : 'text-blue-600'
                    }`}>
                      Your earnings are safely stored and will be available for withdrawal once payment gateways are live.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-6">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 shadow-lg font-medium"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsTab;