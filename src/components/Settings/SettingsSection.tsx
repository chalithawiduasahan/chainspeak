import React, { useState, useEffect } from 'react';
import { Moon, Sun, LogOut, User, Shield, Bell, Globe, Link } from 'lucide-react';
import { notificationService } from '../../services/notificationService';

interface SettingsSectionProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onSignOut: () => void;
  userProfile?: any;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ 
  darkMode, 
  onToggleDarkMode, 
  onSignOut, 
  userProfile 
}) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.id) {
      loadNotifications();
    }
  }, [userProfile?.id]);

  const loadNotifications = async () => {
    if (!userProfile?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userNotifications = await notificationService.getUserNotifications(userProfile.id);
      setNotifications(userNotifications.slice(0, 5)); // Show only recent 5
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return '💰';
      case 'purchase':
        return '🛒';
      case 'listing':
        return '📝';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8 pt-20 md:pt-24">
      <div className="flex items-center justify-between">
        <h1 className={`text-2xl md:text-3xl font-bold transition-colors duration-300 ${
          darkMode 
            ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'
            : 'bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'
        }`}>
          Settings
        </h1>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* User Profile Section */}
        {userProfile && (
          <div className={`backdrop-blur-sm rounded-2xl border shadow-xl p-6 transition-colors duration-300 ${
            darkMode 
              ? 'bg-gray-800/80 border-gray-700' 
              : 'bg-white/80 border-gray-200'
          }`}>
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Profile Information
                </h3>
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Manage your account details
                </p>
              </div>
            </div>
            <div className={`p-4 rounded-xl ${
              darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Nickname
                  </p>
                  <p className={`text-lg font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {userProfile.nickname}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Member Since
                  </p>
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {new Date(userProfile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appearance Settings */}
        <div className={`backdrop-blur-sm rounded-2xl border shadow-xl p-6 transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-800/80 border-gray-700' 
            : 'bg-white/80 border-gray-200'
        }`}>
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              {darkMode ? <Moon className="w-6 h-6 text-white" /> : <Sun className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Appearance
              </h3>
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Customize your visual experience
              </p>
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                {darkMode ? (
                  <Moon className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Sun className="w-5 h-5 text-orange-500" />
                )}
              </div>
              <div>
                <p className={`font-medium ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {darkMode ? 'Dark Mode' : 'Light Mode'}
                </p>
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {darkMode ? 'Dark theme is enabled' : 'Light theme is enabled'}
                </p>
              </div>
            </div>
            
            <button
              onClick={onToggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                darkMode 
                  ? 'bg-blue-600 focus:ring-offset-gray-800' 
                  : 'bg-gray-200 focus:ring-offset-white'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Privacy & Security Settings */}
        <div className={`backdrop-blur-sm rounded-2xl border shadow-xl p-6 transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-800/80 border-gray-700' 
            : 'bg-white/80 border-gray-200'
        }`}>
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Privacy & Security
              </h3>
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Control your data and privacy settings
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <Shield className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className={`font-medium ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Encryption Status
                  </p>
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    All conversations are encrypted
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 font-medium">Enabled</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <Link className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className={`font-medium ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Blockchain Status
                  </p>
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Conversations stored on-chain
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-purple-600 font-medium">Connected</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <Globe className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className={`font-medium ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Anonymous Mode
                  </p>
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Your identity is protected
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-600 font-medium">Enabled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Settings */}
        <div className={`backdrop-blur-sm rounded-2xl border shadow-xl p-6 transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-800/80 border-gray-700' 
            : 'bg-white/80 border-gray-200'
        }`}>
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Recent Notifications
              </h3>
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Your latest activity updates
              </p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`animate-pulse p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className={`h-3 rounded mb-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                  <div className={`h-2 rounded w-3/4 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                </div>
              ))}
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-all duration-300 ${
                    !notification.is_read 
                      ? darkMode 
                        ? 'bg-blue-900/20 border-blue-700' 
                        : 'bg-blue-50 border-blue-200'
                      : darkMode 
                        ? 'bg-gray-700/50 border-gray-600' 
                        : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-lg flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {notification.title}
                      </p>
                      <p className={`text-xs mt-1 ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {notification.message}
                      </p>
                      <p className={`text-xs mt-1 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {formatTimeAgo(notification.created_at)}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`p-4 rounded-xl text-center ${
              darkMode 
                ? 'bg-blue-900/20 border border-blue-700' 
                : 'bg-blue-50 border border-blue-200'
            }`}>
              <Bell className={`w-8 h-8 mx-auto mb-2 ${
                darkMode ? 'text-blue-300' : 'text-blue-600'
              }`} />
              <p className={`text-sm font-medium mb-1 ${
                darkMode ? 'text-blue-200' : 'text-blue-700'
              }`}>
                No notifications yet
              </p>
              <p className={`text-xs ${
                darkMode ? 'text-blue-300' : 'text-blue-600'
              }`}>
                You'll see updates about sales, purchases, and system notifications here.
              </p>
            </div>
          )}
        </div>

        {/* Account Actions */}
        <div className={`backdrop-blur-sm rounded-2xl border shadow-xl p-6 transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-800/80 border-gray-700' 
            : 'bg-white/80 border-gray-200'
        }`}>
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <LogOut className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Account Actions
              </h3>
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Manage your account and session
              </p>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={onSignOut}
            className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg group"
          >
            <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-medium">Sign Out</span>
          </button>
          
          <p className={`text-xs text-center mt-3 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            You'll be redirected to the landing page after signing out
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsSection;