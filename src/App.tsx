import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TopNavigation from './components/Navigation/TopNavigation';
import TabNavigation from './components/Navigation/TabNavigation';
import HomeSection from './components/Home/HomeSection';
import MemorySection from './components/Memory/MemorySection';
import AIChatSection from './components/AIChat/AIChatSection';
import InsightsSection from './components/Insights/InsightsSection';
import VaultExchangeSection from './components/VaultExchange/VaultExchangeSection';
import SettingsSection from './components/Settings/SettingsSection';
import LandingPage from './components/Landing/LandingPage';
import AuthModal from './components/Auth/AuthModal';
import { authService } from './services/authService';
import { notificationService } from './services/notificationService';
import { useSessionTimer } from './hooks/useSessionTimer';
import { supabase } from './lib/supabase';

export type TabType = 'home' | 'memory' | 'chat' | 'insights' | 'exchange' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataRefreshKey, setDataRefreshKey] = useState(0);

  // Define triggerDataRefresh function before using it
  const triggerDataRefresh = () => {
    setDataRefreshKey(prev => prev + 1);
    console.log('App.tsx: Data refresh triggered, new key:', dataRefreshKey + 1);
  };

  // Track user activity globally when authenticated
  useSessionTimer(userProfile?.auth_user_id);

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const profile = await authService.getCurrentUser();
        console.log('App.tsx: User profile from auth check:', profile);
        if (profile) {
          setUserProfile(profile);
          setIsAuthenticated(true);
          console.log('App.tsx: User profile set from auth check:', profile);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setUserProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        // User signed in, get their profile
        const profile = await authService.getCurrentUser();
        if (profile) {
          setUserProfile(profile);
          setIsAuthenticated(true);
          setShowAuthModal(false);
          triggerDataRefresh();
          
          // Create welcome notification for new users
          try {
            await notificationService.createWelcomeNotification(profile.id, profile.nickname);
          } catch (notificationError) {
            console.warn('Failed to create welcome notification:', notificationError);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        // User signed out
        setUserProfile(null);
        setIsAuthenticated(false);
        setActiveTab('home');
        setDataRefreshKey(0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Debug log current userProfile state on every render
  console.log('App.tsx: Current userProfile state:', userProfile);

  const handleStartChainSpeaking = () => {
    setShowAuthModal(true);
  };

  const handleAuthSuccess = (user: any) => {
    console.log('App.tsx: Auth success, user:', user);
    setUserProfile(user);
    setIsAuthenticated(true);
    setShowAuthModal(false);
    setActiveTab('home');
    triggerDataRefresh();
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
  };

  const handleHomeClick = () => {
    setActiveTab('home');
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      // Auth state change listener will handle the rest
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeSection 
            darkMode={darkMode} 
            userProfile={userProfile}
            dataRefreshKey={dataRefreshKey}
          />
        );
      case 'memory':
        return <MemorySection darkMode={darkMode} userProfile={userProfile} />;
      case 'chat':
        return (
          <AIChatSection 
            darkMode={darkMode} 
            userProfile={userProfile}
            triggerDataRefresh={triggerDataRefresh}
          />
        );
      case 'insights':
        return (
          <InsightsSection 
            darkMode={darkMode} 
            userProfile={userProfile}
            dataRefreshKey={dataRefreshKey}
            triggerDataRefresh={triggerDataRefresh}
          />
        );
      case 'exchange':
        return (
          <VaultExchangeSection 
            darkMode={darkMode} 
            userProfile={userProfile}
            triggerDataRefresh={triggerDataRefresh}
          />
        );
      case 'settings':
        return (
          <SettingsSection 
            darkMode={darkMode} 
            onToggleDarkMode={handleToggleDarkMode}
            onSignOut={handleSignOut}
            userProfile={userProfile}
          />
        );
      default:
        return (
          <HomeSection 
            darkMode={darkMode} 
            userProfile={userProfile}
            dataRefreshKey={dataRefreshKey}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
      }`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading ChainSpeak...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className={`min-h-screen transition-all duration-300 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
      }`}>
        <Routes>
          <Route 
            path="/landing-preview" 
            element={
              <LandingPage 
                onStartChainSpeaking={handleStartChainSpeaking}
              />
            } 
          />
          <Route 
            path="/*" 
            element={
              isAuthenticated ? (
                <>
                  <TopNavigation 
                    onHomeClick={handleHomeClick} 
                    darkMode={darkMode}
                    onToggleDarkMode={handleToggleDarkMode}
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    userProfile={userProfile}
                  />
                  
                  <TabNavigation 
                    activeTab={activeTab} 
                    onTabChange={(tab) => {
                      setActiveTab(tab);
                      setSidebarOpen(false);
                    }}
                    darkMode={darkMode}
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                  />

                  <main className={`transition-all duration-300 ${
                    sidebarOpen ? 'md:ml-64' : 'md:ml-64'
                  } ml-0 p-2 md:p-6 min-w-0 overflow-x-hidden`}>
                    <div className="w-full max-w-none">
                      <div className="transition-all duration-500 ease-in-out transform">
                        {renderActiveSection()}
                      </div>
                    </div>
                  </main>

                  {/* Mobile overlay for dashboard */}
                  {sidebarOpen && (
                    <div 
                      className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                      onClick={() => setSidebarOpen(false)}
                    />
                  )}
                </>
              ) : (
                <LandingPage 
                  onStartChainSpeaking={handleStartChainSpeaking}
                />
              )
            } 
          />
        </Routes>

        {/* Auth Modal */}
        {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={handleAuthModalClose}
            onSuccess={handleAuthSuccess}
            darkMode={darkMode}
          />
        )}

        {/* Built on Bolt badge */}
        <div className="fixed bottom-6 right-6 z-40">
          <div className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105 shadow-lg ${
            darkMode 
              ? 'bg-gray-800/90 text-gray-300 border border-gray-700' 
              : 'bg-white/90 text-gray-600 border border-gray-200'
          } backdrop-blur-sm`}>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              <span>Built on Bolt</span>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;