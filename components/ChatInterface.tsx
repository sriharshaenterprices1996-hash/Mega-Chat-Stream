
import React, { useState, useRef, useEffect } from 'react';
import { Message, UserSettings, UserProfile, AttachmentType } from '../types';
import { sendChatMessage } from '../services/geminiService';

interface ChatInterfaceProps {
  onStartCall: (type: 'video' | 'audio', partnerName: string, partnerAvatar: string) => void;
  settings: UserSettings;
  currentUser: UserProfile;
}

// Mock contacts for group creation
const MOCK_CONTACTS = [
    { id: 'c1', name: 'Alice Smith', avatar: '👩‍🦰' },
    { id: 'c2', name: 'Bob Jones', avatar: '👨‍🦱' },
    { id: 'c3', name: 'Charlie Day', avatar: '🧔' },
    { id: 'c4', name: 'Diana Prince', avatar: '👩' },
    { id: 'c5', name: 'Evan Peters', avatar: '👱' },
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onStartCall, settings, currentUser }) => {
  // Load messages from local storage or initialize with default
  const [messages, setMessages] = useState<Message[]>(() => {
      if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('chat_messages');
          if (saved) {
              try {
                  return JSON.parse(saved);
              } catch (e) {
                  console.error("Failed to load chat history", e);
              }
          }
      }
      return [{ id: '1', text: 'Hey there! Welcome to Mega Chat.', sender: 'ai', timestamp: Date.now() - 100000, senderName: 'Mega AI', senderAvatar: '🤖', status: 'read' }];
  });

  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false); // Press-and-hold state
  const [recordingMode, setRecordingMode] = useState<'idle' | 'locked'>('idle'); // Menu-triggered state
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isVoiceTyping, setIsVoiceTyping] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // Typing indicator state
  
  // Advanced Features State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showMainMenu, setShowMainMenu] = useState(false); // Top right 3-dots
  const [activeMessageMenu, setActiveMessageMenu] = useState<string | null>(null); // Message ID for context menu
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  // Group Creation State
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (!isSearching) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, replyingTo, showAttachments, recordingMode, isTyping]);

  // Focus search input when opened
  useEffect(() => {
      if (isSearching) {
          searchInputRef.current?.focus();
      }
  }, [isSearching]);

  // Persistence: Save messages to local storage whenever they change
  useEffect(() => {
      localStorage.setItem('chat_messages', JSON.stringify(messages));
  }, [messages]);

  // Recording Timer
  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (isRecording || recordingMode === 'locked') {
          interval = setInterval(() => setRecordingDuration(prev => prev + 1), 1000);
      } else {
          setRecordingDuration(0);
      }
      return () => clearInterval(interval);
  }, [isRecording, recordingMode]);

  const formatDuration = (sec: number) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Helper to update a specific message status
  const updateMessageStatus = (msgId: string, status: 'sent' | 'delivered' | 'read') => {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status } : m));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    if (editingMessageId) {
        // Handle Edit
        setMessages(prev => prev.map(m => m.id === editingMessageId ? { ...m, text: inputText, isEdited: true } : m));
        setEditingMessageId(null);
        setInputText('');
        return;
    }

    const msgId = Date.now().toString();
    const newMessage: Message = {
      id: msgId,
      text: inputText,
      sender: 'user',
      senderName: currentUser.displayName,
      senderAvatar: currentUser.avatar,
      timestamp: Date.now(),
      status: 'sent',
      replyTo: replyingTo ? {
          id: replyingTo.id,
          text: replyingTo.text,
          senderName: replyingTo.senderName || 'Unknown',
          attachment: replyingTo.attachment ? { type: replyingTo.attachment.type, url: replyingTo.attachment.url } : undefined
      } : undefined
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setReplyingTo(null);
    setShowAttachments(false);

    // Reliable Status Simulation
    setTimeout(() => updateMessageStatus(msgId, 'delivered'), 1500);
    setTimeout(() => updateMessageStatus(msgId, 'read'), 3000);

    // Show typing indicator
    setIsTyping(true);

    try {
        const aiResponseText = await sendChatMessage(messages, newMessage.text);
        
        setTimeout(() => {
            setIsTyping(false); // Hide typing indicator
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: aiResponseText,
                sender: 'ai',
                senderName: 'Mega AI',
                senderAvatar: '🤖',
                timestamp: Date.now(),
                status: 'read'
            };
            setMessages(prev => [...prev, aiMessage]);
        }, 2000); 
        
    } catch (error) {
        setIsTyping(false);
        console.error("Failed to get AI response", error);
    }
  };

  const handleCancelRecording = () => {
      setRecordingMode('idle');
      setIsRecording(false);
      setRecordingDuration(0);
  };

  const handleSendVoice = () => {
      const msgId = Date.now().toString();
      const voiceMsg: Message = {
          id: msgId,
          text: '',
          sender: 'user',
          senderName: currentUser.displayName,
          senderAvatar: currentUser.avatar,
          timestamp: Date.now(),
          status: 'sent',
          attachment: {
              type: 'voice',
              url: '#',
              name: `Voice Message (${formatDuration(recordingDuration)})`,
          }
      };
      setMessages(prev => [...prev, voiceMsg]);
      handleCancelRecording();
      
      setTimeout(() => updateMessageStatus(msgId, 'delivered'), 1500);
      setTimeout(() => updateMessageStatus(msgId, 'read'), 3000);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
      console.log('Paste event detected');
  };

  const handleFileSelect = (label: string) => {
      // Handle Special Modes
      if (label === 'Record') {
          setRecordingMode('locked');
          setShowAttachments(false);
          return;
      }
      if (label === 'Voice') {
          setShowAttachments(false);
          setIsVoiceTyping(true);
          // Simulate speech to text
          setTimeout(() => {
              setInputText(prev => (prev ? prev + ' ' : '') + "This is simulated speech to text from the Voice option! 🗣️");
              setIsVoiceTyping(false);
              inputRef.current?.focus();
          }, 2000);
          return;
      }

      // Map label to AttachmentType
      let type: AttachmentType = 'file';
      switch(label) {
          case 'Gallery': type = 'image'; break;
          case 'Camera': type = 'image'; break;
          case 'Document': type = 'document'; break;
          case 'Audio': type = 'audio'; break;
          case 'Location': type = 'location'; break;
          case 'Live Loc': type = 'live_location'; break;
          case 'Contact': type = 'contact'; break;
          case 'Poll': type = 'poll'; break;
          case 'Event': type = 'event'; break;
          case 'Template': type = 'template'; break;
          default: type = 'file';
      }

      const msgId = Date.now().toString();
      const attachmentMsg: Message = {
          id: msgId,
          text: `Sent ${label === 'Live Loc' ? 'Live Location' : label}`,
          sender: 'user',
          senderName: currentUser.displayName,
          senderAvatar: currentUser.avatar,
          timestamp: Date.now(),
          status: 'sent',
          attachment: {
              type: type,
              url: '#',
              name: `${label} Attachment`,
          }
      };
      setMessages(prev => [...prev, attachmentMsg]);
      setShowAttachments(false);
      
      // Simulate status for attachments too
      setTimeout(() => updateMessageStatus(msgId, 'delivered'), 1500);
      setTimeout(() => updateMessageStatus(msgId, 'read'), 3000);
  };

  const handleMicDoubleTap = () => {
      console.log("Mic double tap detected");
  };

  // Interaction Handlers
  const handleLikeMessage = (msgId: string) => {
      setMessages(prev => prev.map(m => {
          if (m.id === msgId) {
              const reactions = m.reactions || {};
              const likes = reactions['❤️'] || [];
              const isLiked = likes.includes('me');
              
              return {
                  ...m,
                  reactions: {
                      ...reactions,
                      '❤️': isLiked ? likes.filter(id => id !== 'me') : [...likes, 'me']
                  }
              };
          }
          return m;
      }));
  };

  const handleReplyMessage = (msg: Message) => {
      setReplyingTo(msg);
      setActiveMessageMenu(null);
      inputRef.current?.focus();
  };

  const handleDeleteMessage = (msgId: string) => {
      if (confirm('Delete this message?')) {
          setMessages(prev => prev.filter(m => m.id !== msgId));
      }
      setActiveMessageMenu(null);
  };

  const handleEditMessage = (msg: Message) => {
      setEditingMessageId(msg.id);
      setInputText(msg.text);
      setActiveMessageMenu(null);
      inputRef.current?.focus();
  };

  const handleStarMessage = (msgId: string) => {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isStarred: !m.isStarred } : m));
      setActiveMessageMenu(null);
  };

  const handleForwardMessage = (msg: Message) => {
      const msgId = Date.now().toString();
      const fwdMsg: Message = {
          ...msg,
          id: msgId,
          timestamp: Date.now(),
          status: 'sent',
          isForwarded: true,
          sender: 'user', // Sending as me
          senderName: currentUser.displayName,
          senderAvatar: currentUser.avatar
      };
      setMessages(prev => [...prev, fwdMsg]);
      setActiveMessageMenu(null);
      setTimeout(() => updateMessageStatus(msgId, 'delivered'), 1000);
  };

  const handleCreateGroup = () => {
      if (!groupName || selectedContacts.length === 0) return;
      
      const msgId = Date.now().toString();
      const systemMsg: Message = {
          id: msgId,
          text: `You created group "${groupName}" with ${selectedContacts.length} members.`,
          sender: 'system',
          timestamp: Date.now(),
          isSystem: true
      };
      setMessages(prev => [...prev, systemMsg]);
      setShowCreateGroup(false);
      setGroupName('');
      setSelectedContacts([]);
      setShowMainMenu(false);
  };

  // Filter messages for search
  const displayedMessages = messages.filter(m => {
      if (!searchQuery) return true;
      const lowerQ = searchQuery.toLowerCase();
      return m.text.toLowerCase().includes(lowerQ) || m.senderName?.toLowerCase().includes(lowerQ);
  });

  // Attachment Menu Config - 4x3 Grid (12 Items)
  const menuOptions = [
      { label: 'Gallery', icon: '🖼️', color: 'bg-purple-100 text-purple-600' },
      { label: 'Camera', icon: '📷', color: 'bg-rose-100 text-rose-600' },
      { label: 'Document', icon: '📄', color: 'bg-indigo-100 text-indigo-600' },
      { label: 'Audio', icon: '🎵', color: 'bg-orange-100 text-orange-600' },
      
      { label: 'Location', icon: '📍', color: 'bg-green-100 text-green-600' },
      { label: 'Live Loc', icon: '📡', color: 'bg-teal-100 text-teal-600' },
      { label: 'Contact', icon: '👤', color: 'bg-blue-100 text-blue-600' },
      { label: 'Poll', icon: '📊', color: 'bg-yellow-100 text-yellow-600' },
      
      { label: 'Event', icon: '📅', color: 'bg-pink-100 text-pink-600' },
      { label: 'Template', icon: '⚡', color: 'bg-cyan-100 text-cyan-600' },
      { label: 'Voice', icon: '🗣️', color: 'bg-emerald-100 text-emerald-600' },
      { label: 'Record', icon: '🎙️', color: 'bg-red-100 text-red-600' },
  ];
  
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-30 shadow-sm relative">
            {isSearching ? (
                <div className="flex-1 flex items-center animate-fade-in">
                    <button onClick={() => { setIsSearching(false); setSearchQuery(''); }} className="mr-3 text-gray-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <input 
                        ref={searchInputRef}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search messages..."
                        className="flex-1 bg-gray-100 dark:bg-gray-800 border-none outline-none rounded-lg px-4 py-2 text-sm dark:text-white"
                    />
                </div>
            ) : (
                <>
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-gray-800 flex items-center justify-center text-xl shadow-inner cursor-pointer">
                            🤖
                        </div>
                        <div className="cursor-pointer">
                            <h2 className="font-bold text-gray-900 dark:text-white leading-tight">Mega AI</h2>
                            <div className="flex items-center space-x-1.5">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-xs text-gray-500 font-medium">{isTyping ? 'Typing...' : 'Online'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => setIsSearching(true)} className="p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </button>
                        <button onClick={() => onStartCall('video', 'Mega AI', '🤖')} className="p-2.5 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-gray-800 rounded-full transition-colors">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </button>
                        <div className="relative">
                            <button onClick={() => setShowMainMenu(!showMainMenu)} className="p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                            </button>
                            {/* Main Context Menu */}
                            {showMainMenu && (
                                <div className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-fade-in">
                                    <button onClick={() => setShowCreateGroup(true)} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-200">New Group</button>
                                    <button className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-200">Starred Messages</button>
                                    <button className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-200">Wallpaper</button>
                                    <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                                    <button onClick={() => { setMessages([]); setShowMainMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600">Clear Chat</button>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>

        {/* Messages Area */}
        <div 
            className={`flex-1 overflow-y-auto p-4 space-y-6 ${settings.chatWallpaper !== 'default' && !settings.chatWallpaper.startsWith('linear') ? 'bg-repeat' : 'bg-cover'}`}
            style={{ 
                background: settings.chatWallpaper === 'default' ? undefined : settings.chatWallpaper,
                backgroundColor: settings.chatWallpaper.startsWith('#') ? settings.chatWallpaper : undefined
            }}
            onClick={() => { setActiveMessageMenu(null); setShowAttachments(false); }}
        >
            {displayedMessages.map((msg) => {
                const isMe = msg.sender === 'user';
                const likes = msg.reactions?.['❤️'] || [];
                const isLiked = likes.length > 0;
                const isMenuOpen = activeMessageMenu === msg.id;
                
                if (msg.isSystem) {
                    return (
                        <div key={msg.id} className="flex justify-center my-4 animate-message-pop-in">
                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs px-3 py-1 rounded-full shadow-sm">
                                {msg.text}
                            </span>
                        </div>
                    );
                }

                return (
                    <div key={msg.id} className={`flex w-full group ${isMe ? 'justify-end' : 'justify-start'} animate-message-pop-in`}>
                        {!isMe && (
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-2 self-end mb-4 flex-shrink-0">
                                {msg.senderAvatar}
                            </div>
                        )}
                        
                        <div className={`relative max-w-[75%] min-w-[120px]`}>
                            
                            {/* Message Context Menu Trigger (Chevron) */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); setActiveMessageMenu(isMenuOpen ? null : msg.id); }}
                                className={`absolute top-0 w-6 h-6 flex items-center justify-center rounded-full bg-black/20 text-white opacity-0 group-hover:opacity-100 transition-opacity z-20 ${isMe ? 'right-0' : 'left-0'}`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>

                            {/* Context Menu Dropdown */}
                            {isMenuOpen && (
                                <div className={`absolute top-6 ${isMe ? 'right-0' : 'left-0'} w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-30 animate-fade-in`}>
                                    <button onClick={() => handleReplyMessage(msg)} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm flex items-center gap-2 dark:text-white">
                                        <span>↩️</span> Reply
                                    </button>
                                    <button onClick={() => handleStarMessage(msg.id)} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm flex items-center gap-2 dark:text-white">
                                        <span>{msg.isStarred ? '⭐' : '☆'}</span> {msg.isStarred ? 'Unstar' : 'Star'}
                                    </button>
                                    <button onClick={() => handleForwardMessage(msg)} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm flex items-center gap-2 dark:text-white">
                                        <span>➡️</span> Forward
                                    </button>
                                    {isMe && (
                                        <button onClick={() => handleEditMessage(msg)} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm flex items-center gap-2 dark:text-white">
                                            <span>✏️</span> Edit
                                        </button>
                                    )}
                                    <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                                    <button onClick={() => handleDeleteMessage(msg.id)} className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600 flex items-center gap-2">
                                        <span>🗑️</span> Delete
                                    </button>
                                </div>
                            )}

                            {/* Message Bubble */}
                            <div 
                                onDoubleClick={() => handleLikeMessage(msg.id)}
                                className={`
                                    rounded-2xl p-3 px-4 shadow-sm relative cursor-pointer select-none transition-transform active:scale-[0.98]
                                    ${isMe ? 'bg-brand-600 text-white rounded-tr-sm' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-sm border border-gray-100 dark:border-gray-700'}
                                `}
                            >
                                {/* Forwarded Label */}
                                {msg.isForwarded && (
                                    <div className="text-[10px] italic opacity-70 mb-1 flex items-center">
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                        Forwarded
                                    </div>
                                )}

                                {/* Quoted Reply */}
                                {msg.replyTo && (
                                    <div className={`mb-2 rounded-lg p-2 text-xs border-l-4 ${isMe ? 'bg-brand-700/50 border-brand-300 text-brand-100' : 'bg-gray-100 dark:bg-gray-700 border-gray-400 text-gray-500 dark:text-gray-300'}`}>
                                        <p className="font-bold opacity-80 mb-0.5">{msg.replyTo.senderName}</p>
                                        <p className="truncate line-clamp-1">{msg.replyTo.text}</p>
                                    </div>
                                )}

                                {/* Attachment Placeholder */}
                                {msg.attachment && (
                                    <div className={`mb-2 p-3 rounded-lg flex items-center space-x-3 ${isMe ? 'bg-black/10' : 'bg-gray-50 dark:bg-gray-700'}`}>
                                        <div className="w-10 h-10 bg-white/20 rounded flex items-center justify-center text-xl">
                                            {msg.attachment.type === 'image' && '🖼️'}
                                            {msg.attachment.type === 'audio' && '🎵'}
                                            {msg.attachment.type === 'document' && '📄'}
                                            {msg.attachment.type === 'location' && '📍'}
                                            {msg.attachment.type === 'live_location' && '📡'}
                                            {msg.attachment.type === 'contact' && '👤'}
                                            {msg.attachment.type === 'poll' && '📊'}
                                            {msg.attachment.type === 'event' && '📅'}
                                            {msg.attachment.type === 'template' && '⚡'}
                                            {msg.attachment.type === 'voice' && '🗣️'}
                                            {msg.attachment.type === 'record' && '🎙️'}
                                            {msg.attachment.type === 'file' && '📁'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{msg.attachment.name}</p>
                                            <p className="text-xs opacity-70 uppercase tracking-wider">{msg.attachment.type.replace('_', ' ')}</p>
                                        </div>
                                    </div>
                                )}

                                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                
                                <div className={`flex items-center justify-end space-x-1 mt-1 ${isMe ? 'text-brand-100' : 'text-gray-400'} text-[10px]`}>
                                    {msg.isStarred && <span>⭐</span>}
                                    {msg.isEdited && <span>(edited)</span>}
                                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    {isMe && (
                                        <span className="flex items-center ml-0.5" title={msg.status}>
                                            {msg.status === 'sent' && (
                                                <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            )}
                                            {msg.status === 'delivered' && (
                                                <div className="flex -space-x-1">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                            )}
                                            {msg.status === 'read' && (
                                                <div className="flex -space-x-1 text-blue-300 dark:text-blue-400">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                </div>
                                            )}
                                        </span>
                                    )}
                                </div>

                                {/* Reactions Display */}
                                {isLiked && (
                                    <div className="absolute -bottom-2 -left-2 bg-white dark:bg-gray-700 p-0.5 px-1 rounded-full shadow-md border border-gray-100 dark:border-gray-600 animate-scale-in z-10">
                                        <span className="text-xs">❤️</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
            
            {/* Typing Indicator */}
            {isTyping && (
                <div className="flex w-full justify-start animate-message-pop-in">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-2 self-end mb-4 flex-shrink-0">
                        🤖
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center space-x-1.5">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    </div>
                </div>
            )}
            
            <div ref={messagesEndRef} />
        </div>

        {/* Create Group Modal */}
        {showCreateGroup && (
            <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-click">
                    <h3 className="font-bold text-lg dark:text-white mb-4">Create New Group</h3>
                    
                    <div className="space-y-4 mb-4">
                        <input 
                            value={groupName}
                            onChange={e => setGroupName(e.target.value)}
                            placeholder="Group Name"
                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 outline-none focus:border-brand-500 dark:text-white"
                        />
                        
                        <div>
                            <p className="text-sm font-bold text-gray-500 mb-2 uppercase text-xs">Select Members</p>
                            <div className="max-h-40 overflow-y-auto space-y-2">
                                {MOCK_CONTACTS.map(contact => (
                                    <div 
                                        key={contact.id} 
                                        onClick={() => setSelectedContacts(prev => prev.includes(contact.id) ? prev.filter(id => id !== contact.id) : [...prev, contact.id])}
                                        className={`flex items-center p-2 rounded-lg cursor-pointer ${selectedContacts.includes(contact.id) ? 'bg-brand-50 dark:bg-brand-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${selectedContacts.includes(contact.id) ? 'bg-brand-500 border-brand-500 text-white' : 'border-gray-300'}`}>
                                            {selectedContacts.includes(contact.id) && '✓'}
                                        </div>
                                        <span className="mr-2 text-xl">{contact.avatar}</span>
                                        <span className="text-sm dark:text-white">{contact.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <button onClick={() => setShowCreateGroup(false)} className="flex-1 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-bold">Cancel</button>
                        <button onClick={handleCreateGroup} disabled={!groupName || selectedContacts.length === 0} className="flex-1 py-2 bg-brand-600 text-white rounded-lg font-bold disabled:opacity-50">Create</button>
                    </div>
                </div>
            </div>
        )}

        {/* Footer Area - Input & Menu */}
        <div className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-30 pb-safe relative">
            {/* Reply Preview Banner */}
            {replyingTo && (
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center animate-slide-up">
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-1 h-8 bg-brand-500 rounded-full"></div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-brand-600 dark:text-brand-400">Replying to {replyingTo.senderName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{replyingTo.text}</p>
                        </div>
                    </div>
                    <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            )}
            
            {/* Edit Preview Banner */}
            {editingMessageId && (
                <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800 flex justify-between items-center animate-slide-up">
                    <div className="flex items-center space-x-3">
                        <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                        <div>
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400">Editing Message</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Make your corrections below</p>
                        </div>
                    </div>
                    <button onClick={() => { setEditingMessageId(null); setInputText(''); }} className="p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full text-blue-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            )}

            {/* Attachment Menu (4x3 Grid) - Anchored Bottom Right above Input */}
            {showAttachments && (
                <div className="absolute bottom-full right-4 mb-2 p-4 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 animate-slide-up w-80 z-50">
                     <div className="grid grid-cols-4 gap-4">
                         {menuOptions.map(opt => (
                             <button key={opt.label} onClick={() => handleFileSelect(opt.label)} className="flex flex-col items-center space-y-1 group">
                                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm transition-transform group-active:scale-90 ${opt.color}`}>
                                     {opt.icon}
                                 </div>
                                 <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300 truncate w-full text-center">{opt.label}</span>
                             </button>
                         ))}
                     </div>
                     {/* Triangle pointer */}
                     <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white dark:bg-gray-800 transform rotate-45 border-r border-b border-gray-100 dark:border-gray-700"></div>
                </div>
            )}
            
            <div className="p-2 flex items-end gap-2">
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-[24px] flex items-center min-h-[50px] border border-transparent focus-within:border-brand-300 transition-all shadow-sm relative overflow-hidden">
                        
                    {recordingMode === 'locked' ? (
                        <div className="flex-1 flex items-center justify-between px-4 animate-fade-in">
                            <div className="flex items-center space-x-3 text-red-500">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="font-mono font-medium">{formatDuration(recordingDuration)}</span>
                            </div>
                            
                            <div className="flex-1 mx-4 h-6 flex items-center space-x-1 opacity-50">
                                {/* Fake Waveform */}
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="w-1 bg-red-500 rounded-full animate-bounce" style={{ height: `${Math.random() * 16 + 4}px`, animationDelay: `${i * 0.05}s` }}></div>
                                ))}
                            </div>

                            <button onClick={handleCancelRecording} className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Left Side: Emoji Button */}
                            <div className="pl-2 flex items-center">
                                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/10">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </button>
                            </div>

                            <textarea
                                ref={inputRef}
                                value={inputText}
                                onChange={handleInputChange}
                                onClick={(e) => { e.stopPropagation(); setShowAttachments(false); setActiveMessageMenu(null); }}
                                onPaste={handlePaste}
                                placeholder={isVoiceTyping ? "Listening..." : (isRecording ? "Recording..." : (editingMessageId ? "Edit message..." : "Message"))}
                                className={`flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white text-[15px] py-3 pl-2 pr-2 max-h-32 resize-none placeholder-gray-500 ${isRecording ? 'animate-pulse text-red-500 font-bold' : ''}`}
                                rows={1}
                                onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                            />
                            
                            {/* Right Side Inside Capsule: Attachment Button */}
                            <div className="flex items-center pr-2 space-x-1">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setShowAttachments(!showAttachments); }} 
                                    className={`p-2 rounded-full flex-shrink-0 transition-all duration-300 ${showAttachments ? 'bg-brand-600 text-white rotate-45 shadow-md' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                </button>
                                
                                {isVoiceTyping && (
                                     <div className="p-2">
                                         <span className="w-2.5 h-2.5 bg-brand-500 rounded-full animate-ping block"></span>
                                     </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Outside Far Right: Voice/Send Button */}
                <div className="flex-shrink-0 pb-1">
                    {recordingMode === 'locked' ? (
                        <button 
                            onClick={handleSendVoice}
                            className="w-12 h-12 bg-brand-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-brand-700 transition-all active:scale-90 animate-scale-in"
                        >
                            <svg className="w-5 h-5 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </button>
                    ) : (
                        inputText.trim() || isRecording || editingMessageId ? (
                            <button 
                                onClick={handleSendMessage}
                                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 animate-scale-in ${editingMessageId ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-brand-600 hover:bg-brand-700 text-white'}`}
                            >
                                {editingMessageId ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                    <svg className="w-5 h-5 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                )}
                            </button>
                        ) : (
                            <button 
                                onMouseDown={() => setIsRecording(true)}
                                onMouseUp={() => { setIsRecording(false); handleMicDoubleTap(); }}
                                onTouchStart={() => setIsRecording(true)}
                                onTouchEnd={() => { setIsRecording(false); handleMicDoubleTap(); }}
                                className="w-12 h-12 bg-brand-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-brand-600 transition-all active:scale-95"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};
