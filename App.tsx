import React, { useState, useEffect } from 'react';
import { Tab, CallState, UserSettings, UserProfile, AppSettings } from './types';
import { Navigation } from './components/Navigation';
import { ChatInterface } from './components/ChatInterface';
import { VideoFeed, ShortsFeed } from './components/VideoFeeds';
import { StylistInterface } from './components/StylistInterface';
import { ProfileInterface } from './components/ProfileInterface';
import { CallOverlay } from './components/CallOverlay';
import { LoginScreen } from './components/LoginScreen';
import { AdminDashboard } from './components/AdminDashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  
  // App Config & Branding
  const [appSettings, setAppSettings] = useState<AppSettings>({
      appName: 'Mega App',
      // logoUrl: 'https://placehold.co/100x100?text=Logo', // Example initial logo
  });

  // Settings State
  const [settings, setSettings] = useState<UserSettings>({
    notifications: true, // Push Notifications On by default
    messageSound: true,
    vibration: true,
    notificationTone: 'Ding',
    
    // Appearance
    theme: 'system', // Default to system
    fontSize: 'medium',
    language: 'en',
    chatWallpaper: 'default',

    privacy: false,
    autoBlockDuration: 'off',
    biometricEnabled: false,
    twoFactorEnabled: false,
    appLockEnabled: false,

    // Data & Storage
    autoDownloadWifi: true,
    autoDownloadMobile: false,

    // Permissions
    gpsEnabled: true,
    cameraPermission: true,
    microphonePermission: true,
    storagePermission: true,
    backgroundActivity: true
  });

  // Global User State (for Profile & Avatar updates)
  const [currentUser, setCurrentUser] = useState<UserProfile>({
      username: '@mega_user',
      displayName: 'Mega Star',
      bio: 'Living life one pixel at a time. 🌟',
      phoneNumber: '+1 (555) 123-4567',
      email: 'mega.user@example.com',
      isVerified: true,
      avatar: '😎',
      subscriptionPlan: 'premium',
      followers: 12050,
      following: 152,
      badges: ['verified', 'pro'],
      walletBalance: 152.50
  });

  // Theme Logic (Dark/Light/System)
  useEffect(() => {
    const applyTheme = () => {
      let isDark = false;
      if (settings.theme === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        isDark = settings.theme === 'dark';
      }

      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    // Listener for system changes if in system mode
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme]);

  // Font Size Logic
  useEffect(() => {
    const sizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    // Tailwind uses rems based on root font-size. 
    // Changing this scales the entire app UI if built with rems (which Tailwind is).
    document.documentElement.style.fontSize = sizeMap[settings.fontSize];
  }, [settings.fontSize]);

  // Call State Management
  const [callState, setCallState] = useState<CallState>({
    isActive: false,
    isIncoming: false,
    type: 'video',
    partnerName: '',
    partnerAvatar: ''
  });

  const handleStartCall = (type: 'video' | 'audio', partnerName: string, partnerAvatar: string) => {
    setCallState({
        isActive: true,
        isIncoming: false,
        type,
        partnerName,
        partnerAvatar
    });
  };

  const handleEndCall = () => {
    setCallState(prev => ({ ...prev, isActive: false }));
  };

  const handleAnswerCall = () => {
    setCallState(prev => ({ ...prev, isIncoming: false }));
  };

  const handleUpdateSettings = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('chat'); 
    // Resetting visual settings is optional, keeping them is usually better UX
  };

  const handleUpdateAvatar = (newAvatarUrl: string) => {
      setCurrentUser(prev => ({ ...prev, avatar: '✨' })); 
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatInterface onStartCall={handleStartCall} settings={settings} currentUser={currentUser} />;
      case 'videos':
        return <VideoFeed onOpenAdPortal={() => setActiveTab('business')} />;
      case 'shorts':
        return <ShortsFeed />;
      case 'stylist':
        return <StylistInterface onUpdateAvatar={handleUpdateAvatar} />;
      case 'profile':
        return <ProfileInterface 
            settings={settings}
            userProfile={currentUser}
            onUpdateSettings={handleUpdateSettings}
            onLogout={handleLogout}
            onOpenBusinessPortal={() => setActiveTab('business')}
        />;
      case 'business':
        return <AdminDashboard />;
      default:
        return <ChatInterface onStartCall={handleStartCall} settings={settings} currentUser={currentUser} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-white overflow-hidden relative transition-colors duration-300">
      
      {/* Navigation (Sidebar on Desktop, Bottom on Mobile) */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} appSettings={appSettings} />

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-hidden relative flex flex-col w-full">
        {renderContent()}
      </main>

      {/* Call Overlay (Global) */}
      <CallOverlay 
        callState={callState} 
        onEndCall={handleEndCall}
        onAnswerCall={handleAnswerCall}
      />
    </div>
  );
}

export default App;