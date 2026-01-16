import React, { useState, useEffect } from 'react';
import { Moon, Sun, Menu, Bell, MessageCircle} from 'lucide-react';
import { notificationService } from '../../services/notificationService';

interface TopNavigationProps {
  onHomeClick: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onToggleSidebar: () => void;
  userProfile?: any;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ 
  onHomeClick, 
  darkMode, 
  onToggleDarkMode, 
  onToggleSidebar,
  userProfile 
}) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (userProfile?.id) {
      loadNotifications();
      // Set up polling for new notifications every 30 seconds
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userProfile?.id]);

  const loadNotifications = async () => {
    if (!userProfile?.id) return;
    
    try {
      const userNotifications = await notificationService.getUserNotifications(userProfile.id);
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleNotificationClick = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      await loadNotifications(); // Refresh notifications
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(userProfile.id);
      await loadNotifications();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
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
    <nav className={`border-b backdrop-blur-md px-4 md:px-6 py-4 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      darkMode 
        ? 'bg-gray-900/80 border-gray-700' 
        : 'bg-white/80 border-gray-200'
    }`}>
      <div className="flex items-center justify-between w-full">
  {/* Left side: Hamburger, Logo, Name */}
  <div className="flex items-center space-x-3">
    {/* Hamburger menu (mobile only) */}
    <button
      onClick={onToggleSidebar}
      className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 md:hidden ${
        darkMode 
          ? 'text-gray-300 hover:text-white hover:bg-gray-800 hover:shadow-lg' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:shadow-md'
      }`}
    >
      <Menu className="w-5 h-5" />
    </button>
    {/* Logo and Name */}
    <div 
      className="flex items-center space-x-3 cursor-pointer group transition-all duration-300 hover:scale-105"
      onClick={onHomeClick}
    >
      {/* Logo */}
      <div className="relative">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-purple-500/25">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          <MessageCircle className="w-6 h-6 text-white relative z-10" />
        </div>
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-30 blur transition-opacity duration-300"></div>
      </div>
      {/* Name */}
      <span className={`text-lg md:text-xl font-semibold transition-colors duration-300 ${
        darkMode ? 'text-white' : 'text-gray-900'
      }`}>
        ChainSpeak
      </span>
    </div>
  </div>

  {/* Right side: Notification, Dark/Light Toggle */}
  <div className="flex items-center space-x-2">
    {/* Notification Bell */}
    {userProfile?.id && (
      <div className="relative">
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 relative ${
            darkMode 
              ? 'text-gray-300 hover:text-white hover:bg-gray-800 hover:shadow-lg' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:shadow-md'
          }`}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </button>
        {/* Notifications Dropdown */}
        {showNotifications && (
  <div
  className={`absolute right-0 top-12 max-w-xs w-full sm:w-80 max-h-96 overflow-y-auto rounded-xl shadow-2xl border backdrop-blur-sm z-50 ${
    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
  }`}
  style={{
    minWidth: '220px',
    maxWidth: '95vw',
  }}
>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700 transition-colors duration-300"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No notifications yet
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id)}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                      !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
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
                ))
              )}
            </div>
          </div>
        )}
      </div>
    )}

    {/* Dark Mode Toggle */}
    <button 
      onClick={onToggleDarkMode}
      className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
        darkMode 
          ? 'text-yellow-400 hover:bg-gray-800 hover:shadow-lg' 
          : 'text-gray-600 hover:bg-gray-100 hover:shadow-md'
      }`}
    >
      {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  </div>
</div>

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNotifications(false)}
        />
      )}
    </nav>
  );
};

export default TopNavigation;