

import React, { useState, useEffect } from 'react';
import { CallState } from '../types';

interface CallOverlayProps {
  callState: CallState;
  onEndCall: () => void;
  onAnswerCall?: () => void;
}

export const CallOverlay: React.FC<CallOverlayProps> = ({ callState, onEndCall, onAnswerCall }) => {
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  useEffect(() => {
    let interval: any;
    if (!callState.isIncoming && callState.isActive) {
      interval = setInterval(() => setDuration(d => d + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [callState.isIncoming, callState.isActive]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleScreenShare = async () => {
      try {
          if (!isScreenSharing) {
              // @ts-ignore - getDisplayMedia exists in modern browsers
              await navigator.mediaDevices.getDisplayMedia({ video: true });
              setIsScreenSharing(true);
          } else {
              // Logic to stop tracks would go here
              setIsScreenSharing(false);
          }
      } catch (err) {
          console.error("Screen share failed", err);
          alert("Could not start screen share.");
      }
  };

  if (!callState.isActive) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900 text-white flex flex-col items-center justify-between py-8 sm:py-12 animate-fade-in overflow-hidden">
      
      {/* Background / Video Area */}
      <div className="absolute inset-0 z-0">
          {callState.type === 'video' && !isVideoOff ? (
               <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                   {/* Mock Group Call Grid if group */}
                   {callState.isGroupCall ? (
                       <div className="grid grid-cols-2 gap-2 w-full h-full p-2">
                           <div className="bg-gray-700 rounded-xl flex items-center justify-center text-2xl">User A</div>
                           <div className="bg-gray-700 rounded-xl flex items-center justify-center text-2xl">User B</div>
                           <div className="bg-gray-700 rounded-xl flex items-center justify-center text-2xl">User C</div>
                           <div className="bg-gray-700 rounded-xl flex items-center justify-center text-2xl">Me</div>
                       </div>
                   ) : (
                       <div className="text-gray-500">Video Feed Active</div>
                   )}
               </div>
          ) : (
             <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-black">
                 <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center text-6xl shadow-2xl mb-6 border-4 border-gray-600 animate-pulse">
                     {callState.partnerAvatar}
                 </div>
                 <h2 className="text-3xl font-bold mb-2">{callState.partnerName}</h2>
                 <p className="text-brand-400 font-mono tracking-widest">{callState.isIncoming ? 'Incoming...' : formatTime(duration)}</p>
             </div>
          )}
      </div>

      {/* Header Info (Overlay) */}
      <div className="z-10 w-full text-center mt-4 bg-gradient-to-b from-black/50 to-transparent pb-8 pt-4 absolute top-0">
          {callState.type === 'video' && !isVideoOff && (
              <>
                <h2 className="text-xl font-bold shadow-black drop-shadow-md">{callState.partnerName}</h2>
                <p className="text-sm opacity-80 shadow-black drop-shadow-md">{formatTime(duration)}</p>
              </>
          )}
      </div>

      {/* Controls */}
      <div className="z-10 w-full max-w-md px-6 mb-safe absolute bottom-10">
        {callState.isIncoming ? (
          <div className="flex justify-around items-center">
            <button onClick={onEndCall} className="flex flex-col items-center space-y-2 group">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg group-active:scale-95 transition-transform hover:bg-red-600">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06l1.89 1.89-1.89 1.89a.75.75 0 101.06 1.06l1.89-1.89 1.89 1.89a.75.75 0 101.06-1.06L7.34 8.17l1.89-1.89a.75.75 0 00-1.06-1.06l-1.89 1.89-1.89-1.89z" /><path fillRule="evenodd" d="M3.5 3.5c-.966 0-1.75.784-1.75 1.75v11.5c0 .966.784 1.75 1.75 1.75h13c.966 0 1.75-.784 1.75-1.75V5.25c0-.966-.784-1.75-1.75-1.75h-13zm1.75 10.5a.75.75 0 000 1.5h9.5a.75.75 0 000-1.5h-9.5z" clipRule="evenodd" /></svg>
              </div>
              <span className="text-sm font-medium">Decline</span>
            </button>
            <button onClick={onAnswerCall} className="flex flex-col items-center space-y-2 group">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce group-active:scale-95 transition-transform hover:bg-green-600">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
              </div>
              <span className="text-sm font-medium">Accept</span>
            </button>
          </div>
        ) : (
          <div className="bg-black/40 backdrop-blur-md rounded-3xl p-4 grid grid-cols-4 gap-4 items-center justify-items-center">
            {/* Mute */}
            <button onClick={() => setIsMuted(!isMuted)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-white text-gray-900' : 'bg-white/20 hover:bg-white/30 text-white'}`}>
                {isMuted ? '🔇' : '🎙️'}
            </button>
            
            {/* Video Toggle */}
            {callState.type === 'video' && (
                <button onClick={() => setIsVideoOff(!isVideoOff)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? 'bg-white text-gray-900' : 'bg-white/20 hover:bg-white/30 text-white'}`}>
                    {isVideoOff ? '🚫' : '📹'}
                </button>
            )}

            {/* Screen Share (Video Only) */}
            {callState.type === 'video' && (
                <button onClick={handleScreenShare} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isScreenSharing ? 'bg-brand-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white'}`}>
                    🖥️
                </button>
            )}

            {/* Speaker */}
            <button onClick={() => setIsSpeakerOn(!isSpeakerOn)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isSpeakerOn ? 'bg-white text-gray-900' : 'bg-white/20 hover:bg-white/30 text-white'}`}>
                🔊
            </button>

            {/* End Call */}
            <button onClick={onEndCall} className="col-span-4 w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 shadow-xl transition-transform hover:scale-105 mt-2">
                <svg className="w-8 h-8 transform rotate-135" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
