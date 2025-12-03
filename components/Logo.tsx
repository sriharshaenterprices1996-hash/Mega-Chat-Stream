import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';

interface LogoProps {
  settings: AppSettings;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ settings, className = "" }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Simulate listening to Firebase Database
  useEffect(() => {
    // In a real app, this would be a firebase subscription:
    // onValue(ref(db, 'settings/branding/logo'), (snapshot) => setLogoUrl(snapshot.val()));
    
    // For demo, we use the prop passed down from App state, which acts as our store
    if (settings.logoUrl) {
        setLogoUrl(settings.logoUrl);
    }
  }, [settings.logoUrl]);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
        {logoUrl ? (
            <img src={logoUrl} alt="App Logo" className="h-8 w-auto object-contain" />
        ) : (
            // Default Logo Fallback
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                    M
                </div>
                <span className="text-xl font-bold text-brand-700 dark:text-brand-400 tracking-tight">
                    {settings.appName}
                </span>
            </div>
        )}
    </div>
  );
};