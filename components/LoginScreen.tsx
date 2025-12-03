import React, { useState } from 'react';
import { Button } from './Button';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');

  // Form State
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    // Simulate auth delay
    setTimeout(() => {
      setLoading(false);
      
      if (authMode === 'forgot') {
          alert('Password reset link sent to your email.');
          setAuthMode('login');
          return;
      }

      if (method === 'phone' && !isOtpSent) {
          setIsOtpSent(true);
          alert('OTP sent to ' + phone);
          return;
      }
      
      onLogin();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-600 to-brand-900 flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-brand-500/30 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <div className="w-full max-w-sm z-10">
        <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-4 shadow-2xl rotate-12 mx-auto">
                <span className="text-4xl">💬</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Mega Chat</h1>
            <p className="text-brand-100 text-sm">Connect. Stream. Style.</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
            {/* Tabs */}
            <div className="flex bg-black/20 p-1 rounded-xl mb-6">
                <button 
                    onClick={() => { setMethod('phone'); setAuthMode('login'); setIsOtpSent(false); }}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${method === 'phone' ? 'bg-white text-brand-900 shadow-sm' : 'text-brand-100 hover:text-white'}`}
                >
                    Phone
                </button>
                <button 
                    onClick={() => { setMethod('email'); setAuthMode('login'); }}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${method === 'email' ? 'bg-white text-brand-900 shadow-sm' : 'text-brand-100 hover:text-white'}`}
                >
                    Email
                </button>
            </div>

            {/* Auth Mode Header (Email Only usually, but applying generally for consistency) */}
            <h2 className="text-xl font-bold mb-4 text-center">
                {authMode === 'login' ? 'Welcome Back' : authMode === 'signup' ? 'Create Account' : 'Reset Password'}
            </h2>

            {/* Inputs */}
            <div className="space-y-4 mb-6">
                {method === 'phone' && (
                    <>
                        {!isOtpSent ? (
                            <div>
                                <label className="block text-xs uppercase font-bold text-brand-200 mb-2">Phone Number</label>
                                <input 
                                    type="tel" 
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-brand-300/50 focus:outline-none focus:ring-2 focus:ring-brand-300 transition-all"
                                />
                            </div>
                        ) : (
                            <div className="animate-fade-in">
                                <label className="block text-xs uppercase font-bold text-brand-200 mb-2">Enter OTP</label>
                                <input 
                                    type="text" 
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
                                    placeholder="123456"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-brand-300/50 text-center tracking-widest text-xl focus:outline-none focus:ring-2 focus:ring-brand-300 transition-all"
                                    maxLength={6}
                                />
                                <button onClick={() => setIsOtpSent(false)} className="text-xs text-brand-200 underline mt-2 w-full text-center">Change Phone Number</button>
                            </div>
                        )}
                    </>
                )}

                {method === 'email' && (
                    <>
                         <div>
                            <label className="block text-xs uppercase font-bold text-brand-200 mb-2">Email Address</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-brand-300/50 focus:outline-none focus:ring-2 focus:ring-brand-300 transition-all"
                            />
                        </div>
                        {authMode !== 'forgot' && (
                            <div>
                                <label className="block text-xs uppercase font-bold text-brand-200 mb-2">Password</label>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-brand-300/50 focus:outline-none focus:ring-2 focus:ring-brand-300 transition-all"
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Action Button */}
            <Button 
                onClick={handleSubmit} 
                isLoading={loading}
                className="w-full !bg-white !text-brand-900 hover:!bg-brand-50 shadow-lg"
            >
                {authMode === 'login' ? (method === 'phone' && !isOtpSent ? 'Send Code' : 'Log In') : authMode === 'signup' ? 'Sign Up' : 'Send Reset Link'}
            </Button>

            {/* Footer Links */}
            <div className="mt-6 text-center text-sm space-y-2">
                {authMode === 'login' && method === 'email' && (
                    <button onClick={() => setAuthMode('forgot')} className="text-brand-200 hover:text-white transition-colors">Forgot Password?</button>
                )}
                
                {authMode === 'login' ? (
                    <p className="text-brand-200">
                        New here? <button onClick={() => setAuthMode('signup')} className="font-bold text-white hover:underline ml-1">Create Account</button>
                    </p>
                ) : (
                    <p className="text-brand-200">
                        Already have an account? <button onClick={() => setAuthMode('login')} className="font-bold text-white hover:underline ml-1">Log In</button>
                    </p>
                )}
            </div>
        </div>
      </div>
      
      <div className="mt-8 text-xs text-brand-300/60">
          © 2023 Mega Chat Inc. All rights reserved.
      </div>
    </div>
  );
};