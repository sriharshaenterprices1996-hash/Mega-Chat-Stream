
import React from 'react';
import { Tab, AppSettings } from '../types';
import { Logo } from './Logo';

interface NavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  appSettings?: AppSettings; // Added
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, appSettings }) => {
  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { 
      id: 'chat', 
      label: 'Chats', 
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
    },
    { 
      id: 'videos', 
      label: 'Trending', 
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    { 
      id: 'shorts', 
      label: 'Shorts', 
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    },
    { 
      id: 'stylist', 
      label: 'Stylist', 
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    },
  ];

  const settings = appSettings || { appName: 'Mega App' };

  return (
    <>
        {/* Mobile Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-brand-100 dark:border-gray-800 shadow-lg pb-safe z-40 md:hidden">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto overflow-x-auto">
            {navItems.map((item) => (
            <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center min-w-[60px] h-full transition-colors duration-200 ${
                activeTab === item.id ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500 hover:text-brand-400'
                }`}
            >
                {item.icon}
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </button>
            ))}
        </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-brand-100 dark:border-gray-800 h-screen z-40 flex-shrink-0">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <Logo settings={settings} />
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 group ${
                            activeTab === item.id 
                            ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 font-medium shadow-sm' 
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <div className={`${activeTab === item.id ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}>
                            {item.icon}
                        </div>
                        <span className="ml-3">{item.label}</span>
                    </button>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl p-4 text-white text-center">
                    <p className="font-bold text-sm">Go Premium</p>
                    <p className="text-xs text-brand-100 mt-1">Unlock exclusive features</p>
                </div>
            </div>
        </div>
    </>
  );
};
