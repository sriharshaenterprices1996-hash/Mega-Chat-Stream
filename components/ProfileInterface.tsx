import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, UserSettings, PaymentMethod, BillingHistoryItem, SupportTicket, BadgeType } from '../types';
import { Button } from './Button';

interface ProfileInterfaceProps {
  settings: UserSettings;
  userProfile: UserProfile; // Added prop for full user data
  onUpdateSettings: (key: keyof UserSettings, value: any) => void;
  onLogout: () => void;
  onOpenBusinessPortal: () => void;
}

const NOTIFICATION_TONES = ['Ding', 'Chirp', 'Bloop', 'Crystal', 'Bounce'];

// Chat Wallpapers
const WALLPAPERS = [
  { id: 'default', name: 'Default', value: 'default', color: 'bg-gray-50' },
  { id: 'beige', name: 'Beige', value: '#f5f5dc', color: 'bg-[#f5f5dc]' },
  { id: 'dark', name: 'Dark', value: '#1a1a1a', color: 'bg-gray-900' },
  { id: 'blue', name: 'Cool Blue', value: 'linear-gradient(to top, #e6b980 0%, #eacda3 100%)', color: 'bg-blue-100' }, 
  { id: 'doodles', name: 'Doodles', value: 'url("https://www.transparenttextures.com/patterns/notebook.png")', color: 'bg-gray-200' },
  { id: 'space', name: 'Space', value: 'url("https://www.transparenttextures.com/patterns/stardust.png")', color: 'bg-black' },
];

const FAQS = [
    { question: "How do I change my password?", answer: "Go to the Security tab in your Profile settings and click on 'Change Password'." },
    { question: "Can I use the app on multiple devices?", answer: "Yes! You can log in on multiple devices. Use 'Log Out All Devices' in Security to manage sessions." },
    { question: "How do I cancel my subscription?", answer: "Navigate to the Payments tab and toggle 'Auto-Renewal' to off." },
    { question: "Is my data secure?", answer: "We use end-to-end encryption for chats and industry-standard security for all your data." }
];

// Helper Component for Badges
const BadgeIcon: React.FC<{ type: BadgeType }> = ({ type }) => {
    switch (type) {
        case 'verified':
            return <span className="text-blue-500 ml-1" title="Verified">✓</span>;
        case 'pro':
            return <span className="text-purple-500 ml-1 text-xs bg-purple-100 px-1 rounded border border-purple-200" title="Pro Creator">PRO</span>;
        case 'top-creator':
            return <span className="ml-1" title="Top Creator">👑</span>;
        case 'admin':
            return <span className="ml-1 text-red-500" title="Admin">🛡️</span>;
        default:
            return null;
    }
};

export const ProfileInterface: React.FC<ProfileInterfaceProps> = ({ settings, userProfile, onUpdateSettings, onLogout, onOpenBusinessPortal }) => {
  const [activeSection, setActiveSection] = useState<'details' | 'leaderboard' | 'security' | 'payments' | 'settings' | 'support'>('details');
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Modals for details/settings
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  // Security Feature Modals & State
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorStep, setTwoFactorStep] = useState<0 | 1>(0);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  
  const [showAppLockModal, setShowAppLockModal] = useState(false);
  const [appLockPin, setAppLockPin] = useState('');
  const [appLockConfirmPin, setAppLockConfirmPin] = useState('');
  const [appLockStep, setAppLockStep] = useState<0 | 1>(0);

  // Data & Storage State
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [lastBackup, setLastBackup] = useState('Yesterday, 10:24 PM • 1.2 GB');

  // Payments State
  const [autoRenewal, setAutoRenewal] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
      { id: '1', type: 'card', brand: 'visa', last4: '4242', expiry: '12/26', isDefault: true },
      { id: '2', type: 'upi', upiId: 'user@okaxis', isDefault: false }
  ]);
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([
      { id: 'inv_001', date: 'Oct 24, 2023', amount: '$9.99', description: 'Premium Plan - Monthly', status: 'paid', downloadUrl: '#' },
      { id: 'inv_002', date: 'Sep 24, 2023', amount: '$9.99', description: 'Premium Plan - Monthly', status: 'paid', downloadUrl: '#' },
      { id: 'inv_003', date: 'Aug 24, 2023', amount: '$9.99', description: 'Premium Plan - Monthly', status: 'refunded', downloadUrl: '#' },
  ]);

  // Support State
  const [tickets, setTickets] = useState<SupportTicket[]>([
      { id: 'T-1024', subject: 'Payment Issue', status: 'resolved', date: '2 days ago' },
      { id: 'T-1025', subject: 'Bug in Video Feed', status: 'pending', date: 'Yesterday' }
  ]);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: '', message: '' });
  const [activeFaqId, setActiveFaqId] = useState<number | null>(null);

  // User Data State (initialized from prop)
  const [user, setUser] = useState<UserProfile>(userProfile);

  // Leaderboard Mock Data
  const [topCreators, setTopCreators] = useState([
      { id: '1', name: 'Bella Chef', username: '@bella_cooks', avatar: '🍳', followers: '2.5M', badges: ['verified', 'top-creator'], isFollowing: false },
      { id: '2', name: 'Tech Guru', username: '@tech_guy', avatar: '💻', followers: '1.8M', badges: ['verified', 'pro'], isFollowing: true },
      { id: '3', name: 'Travel Tom', username: '@tom_travels', avatar: '✈️', followers: '900K', badges: ['pro'], isFollowing: false },
      { id: '4', name: 'Dance Diva', username: '@dance_queen', avatar: '💃', followers: '850K', badges: ['verified'], isFollowing: false },
      { id: '5', name: 'Gamer X', username: '@gamer_x', avatar: '🎮', followers: '700K', badges: [], isFollowing: true },
  ]);

  // Blocked Users Data
  const [blockedUsers, setBlockedUsers] = useState([
    { id: '1', name: '@spammer_bot', date: 'Blocked 2 days ago' },
    { id: '2', name: '@toxic_guy', date: 'Blocked 1 week ago' }
  ]);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(user);

  // Tab Scroll Logic
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const slide = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  const handleSaveProfile = () => {
    setUser(editForm);
    setIsEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = (event) => {
            const result = event.target?.result as string;
            if (result) {
                // Update both the display user and the edit form
                const updatedUser = { ...user, avatar: result };
                setUser(updatedUser);
                setEditForm(prev => ({ ...prev, avatar: result }));
                // In a real app, you would upload 'file' to a server here
            }
        };
        
        reader.readAsDataURL(file);
    }
  };

  const handle2FASetup = () => {
      if (twoFactorStep === 0) {
          setTwoFactorStep(1);
      } else {
          if (twoFactorCode === '123456') { // Mock check
              onUpdateSettings('twoFactorEnabled', true);
              setShow2FAModal(false);
              setTwoFactorStep(0);
              setTwoFactorCode('');
              alert("2FA Enabled Successfully!");
          } else {
              alert("Invalid code. Try 123456");
          }
      }
  };

  const handleAppLockSetup = () => {
      if (appLockStep === 0) {
          if (appLockPin.length < 4) return;
          setAppLockStep(1);
      } else {
          if (appLockPin === appLockConfirmPin) {
              onUpdateSettings('appLockEnabled', true);
              setShowAppLockModal(false);
              setAppLockStep(0);
              setAppLockPin('');
              setAppLockConfirmPin('');
              alert("App Lock Enabled!");
          } else {
              alert("PINs do not match.");
          }
      }
  };

  const handleClearCache = () => {
      setIsClearingCache(true);
      setTimeout(() => {
          setIsClearingCache(false);
          alert("Cache Cleared (1.2 GB freed)");
      }, 1500);
  };

  const handleBackup = () => {
      setIsBackingUp(true);
      setTimeout(() => {
          setIsBackingUp(false);
          setLastBackup('Just now • 1.2 GB');
          alert("Backup Completed Successfully");
      }, 2000);
  };

  const handleSubmitTicket = () => {
      if (!ticketForm.subject || !ticketForm.message) return;
      const newTicket: SupportTicket = {
          id: `T-${Math.floor(Math.random() * 10000)}`,
          subject: ticketForm.subject,
          status: 'open',
          date: 'Just now'
      };
      setTickets([newTicket, ...tickets]);
      setShowTicketModal(false);
      setTicketForm({ subject: '', message: '' });
      alert("Ticket Raised Successfully");
  };

  const toggleFollowCreator = (id: string) => {
      setTopCreators(prev => prev.map(c => c.id === id ? { ...c, isFollowing: !c.isFollowing } : c));
  };

  // Function to format number
  const formatNum = (num: number) => {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toString();
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-full flex flex-col pb-20 overflow-y-auto transition-colors duration-300">
      
      {/* Header Profile Card */}
      <div className="bg-white dark:bg-gray-800 p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex flex-col items-center">
          <div className="relative group cursor-pointer mb-4">
            <div className="w-24 h-24 rounded-full bg-brand-100 dark:bg-gray-700 flex items-center justify-center text-5xl border-4 border-white dark:border-gray-600 shadow-lg overflow-hidden">
                {user.avatar.startsWith('data:') || user.avatar.startsWith('http') ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    user.avatar
                )}
            </div>
            {/* Always visible edit badge on hover or clicking */}
            <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <span className="text-xs font-bold">Change</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
            </label>
            <div className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 p-1 rounded-full border border-gray-200 dark:border-gray-600 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
          </div>
          
          {isEditing ? (
              <div className="w-full max-w-xs space-y-2 text-center animate-fade-in">
                  <input value={editForm.displayName} onChange={e => setEditForm({...editForm, displayName: e.target.value})} className="w-full text-center font-bold text-xl bg-gray-50 dark:bg-gray-700 dark:text-white border-b border-brand-300 focus:outline-none" placeholder="Display Name" />
                  <input value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})} className="w-full text-center text-sm text-gray-500 bg-transparent focus:outline-none" placeholder="@username" />
                  <textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} className="w-full text-center text-sm bg-gray-50 dark:bg-gray-700 dark:text-gray-300 rounded p-2 focus:outline-none resize-none" rows={2} placeholder="Bio" />
                  <div className="flex space-x-2 justify-center pt-2">
                      <Button variant="secondary" onClick={() => { setIsEditing(false); setEditForm(user); }} className="!py-1 !px-3 !text-sm">Cancel</Button>
                      <Button onClick={handleSaveProfile} className="!py-1 !px-3 !text-sm">Save</Button>
                  </div>
              </div>
          ) : (
              <div className="text-center animate-fade-in w-full">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-1">
                    {user.displayName}
                    {user.badges && user.badges.map(b => <BadgeIcon key={b} type={b} />)}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{user.username}</p>
                <p className="text-gray-700 dark:text-gray-300 max-w-xs mx-auto text-sm leading-relaxed mb-4">{user.bio}</p>
                
                {/* Followers / Following Stats */}
                <div className="flex justify-center space-x-6 mb-4">
                    <div className="text-center">
                        <span className="block font-bold text-gray-900 dark:text-white text-lg">{formatNum(user.followers)}</span>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Followers</span>
                    </div>
                    <div className="text-center">
                        <span className="block font-bold text-gray-900 dark:text-white text-lg">{formatNum(user.following)}</span>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Following</span>
                    </div>
                </div>

                <div className="flex justify-center space-x-3">
                    <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        Edit Profile
                    </button>
                    {onOpenBusinessPortal && (
                         <button onClick={onOpenBusinessPortal} className="px-4 py-2 bg-brand-600 text-white rounded-full text-sm font-medium hover:bg-brand-700 transition-colors shadow-sm">
                            Business Portal
                        </button>
                    )}
                </div>
              </div>
          )}
        </div>
        
        {/* Navigation Tabs with Sliding Buttons */}
        <div className="relative group mt-8">
            {showLeftArrow && (
                <button 
                    onClick={() => slide('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 p-1.5 rounded-full shadow-sm text-gray-500 hover:text-brand-600 border border-gray-100 dark:border-gray-700 transition-opacity"
                    aria-label="Scroll left"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
            )}

            <div 
                ref={scrollRef}
                className="flex space-x-1 overflow-x-auto no-scrollbar pb-2 scroll-smooth px-1"
                onScroll={checkScroll}
            >
                {['details', 'leaderboard', 'security', 'payments', 'settings', 'support'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveSection(tab as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                            activeSection === tab 
                            ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border-b-2 border-brand-500' 
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {showRightArrow && (
                <button 
                    onClick={() => slide('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 p-1.5 rounded-full shadow-sm text-gray-500 hover:text-brand-600 border border-gray-100 dark:border-gray-700 transition-opacity"
                    aria-label="Scroll right"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            )}
        </div>
      </div>

      <div className="p-4 max-w-3xl mx-auto w-full flex-1">
          
          {/* DETAILS TAB */}
          {activeSection === 'details' && (
              <div className="space-y-4 animate-slide-up">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-4">Contact Info</h3>
                      <div className="space-y-4">
                          <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700">
                              <span className="text-gray-500 dark:text-gray-400 text-sm">Phone</span>
                              {isEditing ? (
                                  <input value={editForm.phoneNumber} onChange={e => setEditForm({...editForm, phoneNumber: e.target.value})} className="text-right text-gray-900 dark:text-white text-sm bg-transparent border-b border-brand-200 focus:outline-none" />
                              ) : (
                                  <span className="text-gray-900 dark:text-white font-medium">{user.phoneNumber}</span>
                              )}
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700">
                              <span className="text-gray-500 dark:text-gray-400 text-sm">Email</span>
                              {isEditing ? (
                                  <input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="text-right text-gray-900 dark:text-white text-sm bg-transparent border-b border-brand-200 focus:outline-none" />
                              ) : (
                                  <span className="text-gray-900 dark:text-white font-medium">{user.email}</span>
                              )}
                          </div>
                      </div>
                  </div>
              </div>
          )}

          {/* LEADERBOARD TAB */}
          {activeSection === 'leaderboard' && (
              <div className="space-y-4 animate-slide-up">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg mb-6">
                      <h3 className="font-bold text-lg mb-1">Top Creators 🏆</h3>
                      <p className="text-white/90 text-sm">Follow the best creators on Mega Chat.</p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
                      {topCreators.map((creator, index) => (
                          <div key={creator.id} className="flex items-center p-4 border-b border-gray-50 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                              <div className="w-8 text-center font-bold text-gray-400 text-lg mr-2">#{index + 1}</div>
                              <div className="relative">
                                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-xl border-2 border-white dark:border-gray-600 shadow-sm">
                                      {creator.avatar}
                                  </div>
                              </div>
                              <div className="flex-1 ml-3">
                                  <div className="flex items-center">
                                      <h4 className="font-bold text-gray-900 dark:text-white">{creator.name}</h4>
                                      {creator.badges.map(b => <BadgeIcon key={b} type={b as BadgeType} />)}
                                  </div>
                                  <p className="text-xs text-gray-500">{creator.followers} Followers</p>
                              </div>
                              <button 
                                  onClick={() => toggleFollowCreator(creator.id)}
                                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                                      creator.isFollowing 
                                      ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' 
                                      : 'bg-brand-600 text-white shadow-md hover:bg-brand-700'
                                  }`}
                              >
                                  {creator.isFollowing ? 'Following' : 'Follow'}
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* SECURITY TAB */}
          {activeSection === 'security' && (
              <div className="space-y-4 animate-slide-up">
                  {/* Access Control */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
                      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                          <h3 className="font-bold text-gray-900 dark:text-white">Access & Authentication</h3>
                      </div>
                      <div className="p-4 space-y-4">
                          <div className="flex justify-between items-center">
                              <div>
                                  <p className="font-medium text-gray-900 dark:text-white">Biometric Unlock</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Use FaceID / Fingerprint</p>
                              </div>
                              <button 
                                onClick={() => onUpdateSettings('biometricEnabled', !settings.biometricEnabled)}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.biometricEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                              >
                                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${settings.biometricEnabled ? 'translate-x-6' : ''}`}></div>
                              </button>
                          </div>
                          <div className="flex justify-between items-center">
                              <div>
                                  <p className="font-medium text-gray-900 dark:text-white">Two-Factor Auth (2FA)</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Extra layer of security</p>
                              </div>
                              <button 
                                onClick={() => settings.twoFactorEnabled ? onUpdateSettings('twoFactorEnabled', false) : setShow2FAModal(true)}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.twoFactorEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                              >
                                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${settings.twoFactorEnabled ? 'translate-x-6' : ''}`}></div>
                              </button>
                          </div>
                          <div className="flex justify-between items-center">
                              <div>
                                  <p className="font-medium text-gray-900 dark:text-white">App Lock</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Require PIN on launch</p>
                              </div>
                              <button 
                                onClick={() => settings.appLockEnabled ? onUpdateSettings('appLockEnabled', false) : setShowAppLockModal(true)}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.appLockEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                              >
                                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${settings.appLockEnabled ? 'translate-x-6' : ''}`}></div>
                              </button>
                          </div>
                      </div>
                  </div>

                  {/* Sessions & Management */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
                      <div className="p-4 space-y-1">
                          <button onClick={() => alert("Logged out of all other devices.")} className="w-full text-left py-3 flex justify-between items-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 px-2 rounded-lg transition-colors">
                              <span>Log Out All Devices</span>
                              <span className="text-gray-400">→</span>
                          </button>
                          <button onClick={() => setShowBlockedModal(true)} className="w-full text-left py-3 flex justify-between items-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 px-2 rounded-lg transition-colors">
                              <span>Blocked Users</span>
                              <span className="text-gray-400">{blockedUsers.length}</span>
                          </button>
                          <button onClick={() => setShowPasswordModal(true)} className="w-full text-left py-3 flex justify-between items-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 px-2 rounded-lg transition-colors">
                              <span>Change Password</span>
                              <span className="text-gray-400">→</span>
                          </button>
                      </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl overflow-hidden shadow-sm border border-red-100 dark:border-red-900/30 p-4">
                      <h3 className="text-red-600 font-bold mb-4 text-sm uppercase">Danger Zone</h3>
                      <div className="space-y-3">
                          <button onClick={() => setShowDeactivateModal(true)} className="w-full py-3 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors">
                              Deactivate Account
                          </button>
                          <button onClick={() => setShowDeleteAccountModal(true)} className="w-full py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-lg">
                              Delete Account
                          </button>
                      </div>
                  </div>
              </div>
          )}

          {/* PAYMENTS TAB */}
          {activeSection === 'payments' && (
              <div className="space-y-6 animate-slide-up">
                  
                  {/* Wallet Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-start mb-4">
                          <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wide">Earnings & Gifts</p>
                              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">${user.walletBalance.toFixed(2)}</h2>
                          </div>
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600">
                              💰
                          </div>
                      </div>
                      <div className="flex space-x-3">
                           <button onClick={() => alert("Cash out requested!")} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-xl transition-colors">
                               Cash Out
                           </button>
                           <button className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white font-bold py-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                               History
                           </button>
                      </div>
                  </div>

                  {/* Subscription Card */}
                  <div className="bg-gradient-to-br from-brand-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
                      <div className="relative z-10">
                          <p className="text-brand-100 text-sm font-medium mb-1">Current Plan</p>
                          <h2 className="text-3xl font-bold mb-4">Mega Premium</h2>
                          <div className="flex justify-between items-end">
                              <div>
                                  <p className="text-2xl font-bold">$9.99<span className="text-sm font-normal text-brand-200">/mo</span></p>
                                  <p className="text-xs text-brand-200 mt-1">Next billing: Nov 24, 2023</p>
                              </div>
                              <div className="flex items-center space-x-2 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                  <span className="text-xs">Auto-Renew</span>
                                  <div 
                                    onClick={() => setAutoRenewal(!autoRenewal)}
                                    className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${autoRenewal ? 'bg-green-400' : 'bg-gray-400'}`}
                                  >
                                      <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${autoRenewal ? 'translate-x-4' : ''}`}></div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Payment Methods */}
                  <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-3">Payment Methods</h3>
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                          {paymentMethods.map(method => (
                              <div key={method.id} className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center last:border-0">
                                  <div className="flex items-center space-x-3">
                                      <div className="w-10 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-xl">
                                          {method.type === 'card' ? '💳' : '🏦'}
                                      </div>
                                      <div>
                                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                                              {method.type === 'card' ? `•••• ${method.last4}` : method.upiId}
                                          </p>
                                          {method.type === 'card' && <p className="text-xs text-gray-500">Expires {method.expiry}</p>}
                                      </div>
                                  </div>
                                  {method.isDefault && <span className="bg-brand-100 text-brand-700 text-[10px] font-bold px-2 py-1 rounded-full">Default</span>}
                              </div>
                          ))}
                          <button className="w-full py-3 text-center text-brand-600 dark:text-brand-400 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              + Add New Method
                          </button>
                      </div>
                  </div>

                  {/* Billing History */}
                  <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-3">Billing History</h3>
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                          {billingHistory.map(item => (
                              <div key={item.id} className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                  <div>
                                      <p className="font-medium text-gray-900 dark:text-white text-sm">{item.date}</p>
                                      <p className="text-xs text-gray-500">{item.description}</p>
                                  </div>
                                  <div className="text-right">
                                      <p className="font-bold text-gray-900 dark:text-white text-sm">{item.amount}</p>
                                      <div className="flex space-x-2 mt-1">
                                          <button className="text-[10px] text-blue-500 hover:underline">Invoice</button>
                                          {item.status === 'paid' && <button onClick={() => alert("Refund request sent.")} className="text-[10px] text-gray-400 hover:text-red-500 hover:underline">Refund</button>}
                                          {item.status === 'refunded' && <span className="text-[10px] text-orange-500">Refunded</span>}
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          )}

          {/* SETTINGS TAB */}
          {activeSection === 'settings' && (
              <div className="space-y-6 animate-slide-up">
                  
                  {/* Appearance */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center"><span className="mr-2">🎨</span> Appearance</h3>
                      <div className="space-y-4">
                          {/* Theme */}
                          <div>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">App Theme</p>
                              <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                                  {['light', 'dark', 'system'].map((t) => (
                                      <button 
                                        key={t}
                                        onClick={() => onUpdateSettings('theme', t)}
                                        className={`flex-1 py-1.5 text-sm rounded-lg capitalize transition-all ${settings.theme === t ? 'bg-white dark:bg-gray-600 shadow text-brand-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                                      >
                                          {t}
                                      </button>
                                  ))}
                              </div>
                          </div>
                          {/* Font Size */}
                          <div>
                               <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Font Size</p>
                               <div className="flex items-center space-x-4">
                                   <span className="text-xs text-gray-500">Aa</span>
                                   <input 
                                     type="range" min="0" max="2" step="1"
                                     value={settings.fontSize === 'small' ? 0 : settings.fontSize === 'medium' ? 1 : 2}
                                     onChange={(e) => {
                                         const val = parseInt(e.target.value);
                                         onUpdateSettings('fontSize', val === 0 ? 'small' : val === 1 ? 'medium' : 'large');
                                     }}
                                     className="flex-1 accent-brand-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                   />
                                   <span className="text-lg text-gray-500">Aa</span>
                               </div>
                          </div>
                          {/* Language */}
                          <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Language</span>
                              <select 
                                value={settings.language}
                                onChange={(e) => onUpdateSettings('language', e.target.value)}
                                className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm rounded-lg p-2 outline-none"
                              >
                                  <option value="en">English</option>
                                  <option value="es">Español</option>
                                  <option value="fr">Français</option>
                                  <option value="de">Deutsch</option>
                              </select>
                          </div>
                      </div>
                  </div>

                  {/* Notifications */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center"><span className="mr-2">🔔</span> Notifications</h3>
                      <div className="space-y-4">
                           <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-700 dark:text-gray-300">Push Notifications</span>
                              <input type="checkbox" checked={settings.notifications} onChange={(e) => onUpdateSettings('notifications', e.target.checked)} className="toggle-checkbox" />
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-700 dark:text-gray-300">Message Sound</span>
                              <input type="checkbox" checked={settings.messageSound} onChange={(e) => onUpdateSettings('messageSound', e.target.checked)} className="toggle-checkbox" />
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-700 dark:text-gray-300">Vibration</span>
                              <input type="checkbox" checked={settings.vibration} onChange={(e) => onUpdateSettings('vibration', e.target.checked)} className="toggle-checkbox" />
                           </div>
                           <div>
                               <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notification Tone</p>
                               <div className="flex flex-wrap gap-2">
                                   {NOTIFICATION_TONES.map(tone => (
                                       <button 
                                        key={tone}
                                        onClick={() => onUpdateSettings('notificationTone', tone)}
                                        className={`px-3 py-1 rounded-full text-xs border transition-colors ${settings.notificationTone === tone ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'border-gray-200 dark:border-gray-600 text-gray-500'}`}
                                       >
                                           {tone}
                                       </button>
                                   ))}
                               </div>
                           </div>
                      </div>
                  </div>

                  {/* Chat Settings (Wallpaper) */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center"><span className="mr-2">💬</span> Chat Settings</h3>
                      <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Chat Wallpaper</p>
                          <div className="grid grid-cols-6 gap-2">
                              {WALLPAPERS.map(wp => (
                                  <button
                                    key={wp.id}
                                    onClick={() => onUpdateSettings('chatWallpaper', wp.value)}
                                    className={`w-10 h-10 rounded-lg shadow-sm border-2 transition-all ${wp.color} ${settings.chatWallpaper === wp.value ? 'border-brand-500 scale-110' : 'border-transparent'}`}
                                    title={wp.name}
                                    style={wp.value.startsWith('url') ? { backgroundImage: wp.value, backgroundSize: 'cover' } : { background: wp.value === 'default' ? undefined : wp.value }}
                                  ></button>
                              ))}
                          </div>
                      </div>
                  </div>

                  {/* Data & Storage */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center"><span className="mr-2">💾</span> Data & Storage</h3>
                      
                      <div className="mb-4">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Storage Used</span>
                              <span>1.2 GB / 5 GB</span>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                              <div className="bg-brand-500 w-[24%] h-full"></div>
                          </div>
                          <button onClick={handleClearCache} disabled={isClearingCache} className="mt-2 text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline">
                              {isClearingCache ? "Cleaning..." : "Clear Cache"}
                          </button>
                      </div>

                      <div className="space-y-3 mb-4">
                          <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-700 dark:text-gray-300">Auto-download on Wi-Fi</span>
                              <input type="checkbox" checked={settings.autoDownloadWifi} onChange={(e) => onUpdateSettings('autoDownloadWifi', e.target.checked)} className="toggle-checkbox" />
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-700 dark:text-gray-300">Auto-download on Mobile</span>
                              <input type="checkbox" checked={settings.autoDownloadMobile} onChange={(e) => onUpdateSettings('autoDownloadMobile', e.target.checked)} className="toggle-checkbox" />
                          </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl flex items-center justify-between">
                          <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">Chat Backup</p>
                              <p className="text-xs text-gray-500">{lastBackup}</p>
                          </div>
                          <Button onClick={handleBackup} isLoading={isBackingUp} className="!py-1.5 !px-3 !text-xs">
                              Back Up
                          </Button>
                      </div>
                  </div>
                  
                  {/* Permissions */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center"><span className="mr-2">🔒</span> Permissions</h3>
                      <div className="space-y-3">
                           {['gpsEnabled', 'cameraPermission', 'microphonePermission'].map(perm => (
                               <div key={perm} className="flex justify-between items-center">
                                   <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{perm.replace('Permission', '').replace('Enabled', '')} Access</span>
                                   <input 
                                     type="checkbox" 
                                     checked={(settings as any)[perm]} 
                                     onChange={(e) => onUpdateSettings(perm as any, e.target.checked)} 
                                     className="toggle-checkbox" 
                                   />
                               </div>
                           ))}
                      </div>
                  </div>
              </div>
          )}

          {/* SUPPORT TAB */}
          {activeSection === 'support' && (
              <div className="space-y-6 animate-slide-up">
                  {/* Contact Info Card */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 mb-2">
                       <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Support Contacts</h3>
                       <div className="space-y-1 text-sm text-blue-700 dark:text-blue-200">
                           <p>📧 Support: support@shesonline.in</p>
                           <p>🏢 Business: admin@shesonline.in</p>
                           <p>📞 Phone: +91 81060 18811</p>
                           <p>🕒 Hours: Mon–Sat, 10 AM – 7 PM</p>
                       </div>
                  </div>

                  {/* Contact Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => window.open('tel:+918106018811')} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <span className="text-3xl mb-2">📞</span>
                          <span className="font-bold text-gray-900 dark:text-white text-sm">Call Support</span>
                      </button>
                      <button onClick={() => window.open('mailto:support@shesonline.in')} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <span className="text-3xl mb-2">✉️</span>
                          <span className="font-bold text-gray-900 dark:text-white text-sm">Email Support</span>
                      </button>
                  </div>

                  {/* FAQ */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                      <div className="space-y-2">
                          {FAQS.map((faq, idx) => (
                              <div key={idx} className="border-b border-gray-50 dark:border-gray-700 last:border-0 pb-2">
                                  <button onClick={() => setActiveFaqId(activeFaqId === idx ? null : idx)} className="w-full text-left font-medium text-sm text-gray-800 dark:text-gray-200 flex justify-between items-center py-2">
                                      {faq.question}
                                      <span className={`transform transition-transform ${activeFaqId === idx ? 'rotate-180' : ''}`}>▼</span>
                                  </button>
                                  {activeFaqId === idx && (
                                      <p className="text-xs text-gray-500 dark:text-gray-400 pb-2 animate-fade-in">
                                          {faq.answer}
                                      </p>
                                  )}
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Tickets */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold text-gray-900 dark:text-white">Recent Tickets</h3>
                          <button onClick={() => setShowTicketModal(true)} className="text-xs bg-brand-100 text-brand-700 font-bold px-3 py-1.5 rounded-full hover:bg-brand-200">Raise Ticket</button>
                      </div>
                      <div className="space-y-3">
                          {tickets.map(ticket => (
                              <div key={ticket.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                  <div>
                                      <p className="font-bold text-sm text-gray-900 dark:text-white">{ticket.subject}</p>
                                      <p className="text-xs text-gray-400">ID: {ticket.id} • {ticket.date}</p>
                                  </div>
                                  <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${ticket.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                      {ticket.status}
                                  </span>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          )}

          {/* Footer Actions */}
          <div className="mt-8 mb-4 flex justify-center">
              <button 
                onClick={() => setShowLogoutConfirm(true)} 
                className="text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 px-6 py-2 rounded-full transition-colors"
              >
                  Log Out
              </button>
          </div>
      </div>

      {/* Modals */}
      
      {/* 2FA Modal */}
      {show2FAModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-click">
                  <h3 className="font-bold text-lg dark:text-white mb-4">Setup 2FA</h3>
                  {twoFactorStep === 0 ? (
                      <div className="text-center">
                          <div className="w-32 h-32 bg-gray-200 mx-auto mb-4 flex items-center justify-center">[QR Code]</div>
                          <p className="text-sm text-gray-500 mb-4">Scan this QR code with your authenticator app.</p>
                          <Button onClick={handle2FASetup} className="w-full">Next</Button>
                      </div>
                  ) : (
                      <div>
                          <input 
                            value={twoFactorCode}
                            onChange={e => setTwoFactorCode(e.target.value)}
                            placeholder="Enter 6-digit code"
                            className="w-full text-center text-2xl tracking-widest border border-gray-300 rounded-lg p-2 mb-4 dark:bg-gray-700 dark:text-white"
                            maxLength={6}
                          />
                          <Button onClick={handle2FASetup} className="w-full">Verify & Enable</Button>
                      </div>
                  )}
                  <button onClick={() => setShow2FAModal(false)} className="w-full mt-2 py-2 text-gray-500">Cancel</button>
              </div>
          </div>
      )}

      {/* App Lock Modal */}
      {showAppLockModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-click">
                  <h3 className="font-bold text-lg dark:text-white mb-4">{appLockStep === 0 ? "Set PIN" : "Confirm PIN"}</h3>
                  <input 
                    type="password"
                    value={appLockStep === 0 ? appLockPin : appLockConfirmPin}
                    onChange={e => appLockStep === 0 ? setAppLockPin(e.target.value) : setAppLockConfirmPin(e.target.value)}
                    placeholder="Enter 4-digit PIN"
                    className="w-full text-center text-2xl tracking-widest border border-gray-300 rounded-lg p-2 mb-4 dark:bg-gray-700 dark:text-white"
                    maxLength={4}
                  />
                  <Button onClick={handleAppLockSetup} className="w-full">Next</Button>
                  <button onClick={() => setShowAppLockModal(false)} className="w-full mt-2 py-2 text-gray-500">Cancel</button>
              </div>
          </div>
      )}

      {/* Ticket Modal */}
      {showTicketModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-click">
                  <h3 className="font-bold text-lg dark:text-white mb-4">Raise Support Ticket</h3>
                  <div className="space-y-3 mb-4">
                      <input 
                        value={ticketForm.subject}
                        onChange={e => setTicketForm({...ticketForm, subject: e.target.value})}
                        placeholder="Subject"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 dark:bg-gray-700 dark:text-white"
                      />
                      <textarea 
                        value={ticketForm.message}
                        onChange={e => setTicketForm({...ticketForm, message: e.target.value})}
                        placeholder="Describe your issue..."
                        rows={4}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 dark:bg-gray-700 dark:text-white resize-none"
                      />
                  </div>
                  <Button onClick={handleSubmitTicket} className="w-full">Submit Ticket</Button>
                  <button onClick={() => setShowTicketModal(false)} className="w-full mt-2 py-2 text-gray-500">Cancel</button>
              </div>
          </div>
      )}

      {/* Blocked Users Modal */}
      {showBlockedModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-click">
                  <h3 className="font-bold text-lg dark:text-white mb-4">Blocked Users</h3>
                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                      {blockedUsers.length === 0 ? <p className="text-gray-500 text-sm text-center">No blocked users.</p> : blockedUsers.map(u => (
                          <div key={u.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div>
                                  <p className="font-bold text-sm dark:text-white">{u.name}</p>
                                  <p className="text-xs text-gray-500">{u.date}</p>
                              </div>
                              <button onClick={() => setBlockedUsers(blockedUsers.filter(b => b.id !== u.id))} className="text-xs text-red-500 font-bold border border-red-200 px-2 py-1 rounded hover:bg-red-50">Unblock</button>
                          </div>
                      ))}
                  </div>
                  <button onClick={() => setShowBlockedModal(false)} className="w-full py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-white font-bold">Close</button>
              </div>
          </div>
      )}

      {/* Password Change Modal (Simulated) */}
      {showPasswordModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-click">
                  <h3 className="font-bold text-lg dark:text-white mb-4">Change Password</h3>
                  <div className="space-y-3 mb-4">
                      <input type="password" placeholder="Current Password" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                      <input type="password" placeholder="New Password" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                      <input type="password" placeholder="Confirm Password" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                  </div>
                  <Button onClick={() => { setShowPasswordModal(false); alert("Password updated!"); }} className="w-full">Update Password</Button>
                  <button onClick={() => setShowPasswordModal(false)} className="w-full mt-2 py-2 text-gray-500">Cancel</button>
              </div>
          </div>
      )}

      {/* Deactivate/Delete Modals */}
      {showDeactivateModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Deactivate Account?</h3>
                  <p className="text-sm text-gray-500 mb-6">Your account will be hidden until you log back in. Your data will be preserved.</p>
                  <div className="flex space-x-3">
                      <button onClick={() => setShowDeactivateModal(false)} className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-white font-bold">Cancel</button>
                      <button onClick={() => { onLogout(); alert("Account Deactivated"); }} className="flex-1 py-2 bg-orange-500 text-white rounded-lg font-bold">Deactivate</button>
                  </div>
              </div>
          </div>
      )}
      {showDeleteAccountModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                  <h3 className="font-bold text-lg text-red-600 mb-2">Delete Account?</h3>
                  <p className="text-sm text-gray-500 mb-6">This action is permanent. All your data, chats, and files will be erased immediately. You cannot undo this.</p>
                  <div className="flex space-x-3">
                      <button onClick={() => setShowDeleteAccountModal(false)} className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-white font-bold">Cancel</button>
                      <button onClick={() => { onLogout(); alert("Account Deleted"); }} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold">Delete Forever</button>
                  </div>
              </div>
          </div>
      )}

      {/* Logout Confirm */}
      {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-click">
                  <h3 className="font-bold text-lg dark:text-white mb-2">Log Out?</h3>
                  <p className="text-sm text-gray-500 mb-6">Are you sure you want to log out of this device?</p>
                  <div className="flex space-x-3">
                      <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-white font-bold">Cancel</button>
                      <button onClick={onLogout} className="flex-1 py-2 bg-brand-600 text-white rounded-lg font-bold">Log Out</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};