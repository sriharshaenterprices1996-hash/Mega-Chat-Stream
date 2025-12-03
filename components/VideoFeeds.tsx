
import React, { useState, useRef, useEffect } from 'react';
import { VideoItem, ShortItem, Comment } from '../types';
import { Button } from './Button';

// --- Helper for formatting numbers ---
const formatCount = (n: number): string => {
  if (n >= 1000000000) return (n / 1000000000).toFixed(1) + 'B';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
};

const formatTime = (seconds: number) => {
    if (!seconds && seconds !== 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

const BadgeIcon: React.FC<{ type: string }> = ({ type }) => {
    switch (type) {
        case 'verified': return <span className="text-blue-500 text-xs ml-1" title="Verified">✓</span>;
        case 'pro': return <span className="text-purple-500 text-[10px] ml-1 bg-purple-100 px-0.5 rounded border border-purple-200" title="Pro">PRO</span>;
        case 'top-creator': return <span className="text-yellow-500 text-xs ml-1" title="Top Creator">👑</span>;
        default: return null;
    }
};

// --- Mock Data ---
const MOCK_COMMENTS: Comment[] = [
    { id: '1', user: 'User123', text: 'This is amazing! 🔥', avatar: '😎', timeAgo: '2m' },
    { id: '2', user: 'DevGuy', text: 'How did you build this?', avatar: '👨‍💻', timeAgo: '5m' },
    { id: '3', user: 'MegaFan', text: 'Love the new update ❤️', avatar: '🚀', timeAgo: '1h' },
];

const SAMPLE_VIDEOS = [
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
];

// --- Shared Upload Modal with Trimmer ---
interface UploadModalProps {
  type: 'video' | 'short';
  onClose: () => void;
  onUpload: (item: any) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ type, onClose, onUpload }) => {
  const [step, setStep] = useState(1); // 1: Details, 2: Music/Trim
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'video' | 'audio'>('video'); // Track media type
  const [thumbnail, setThumbnail] = useState<string | null>(null); // Custom Thumbnail
  const [linkUrl, setLinkUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Music');
  
  // Business / Ad Mode States
  const [isBusinessMode, setIsBusinessMode] = useState(false);
  const [flashDealImage, setFlashDealImage] = useState<string | null>(null);
  const [privacy, setPrivacy] = useState<'public' | 'group'>('public');

  // Trimmer State
  const [selectedMusic, setSelectedMusic] = useState('No Music');
  const [trimStart, setTrimStart] = useState(0); // 0-100%
  const [trimEnd, setTrimEnd] = useState(100); // 0-100%
  const [videoDuration, setVideoDuration] = useState(0);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const audioPreviewRef = useRef<HTMLAudioElement>(null);

  // Sync preview when trim start changes
  useEffect(() => {
      const mediaRef = mediaType === 'video' ? videoPreviewRef.current : audioPreviewRef.current;
      if (mediaRef && videoDuration > 0) {
          mediaRef.currentTime = videoDuration * (trimStart / 100);
          mediaRef.play().catch(() => {});
      }
  }, [trimStart, videoDuration, mediaType]);

  // Loop video within trimmed range
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLMediaElement>) => {
      const vid = e.currentTarget;
      const startTime = videoDuration * (trimStart / 100);
      const endTime = videoDuration * (trimEnd / 100);
      
      if (vid.currentTime >= endTime || vid.currentTime < startTime) {
          vid.currentTime = startTime;
          vid.play().catch(() => {});
      }
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
        const newItem = {
            id: Date.now().toString(),
            title,
            author: '@me',
            videoUrl: file,
            shareUrl: linkUrl || 'https://mega.app/v/new',
            views: '0',
            timeAgo: 'Just now',
            thumbnail: thumbnail || (mediaType === 'audio' ? 'bg-purple-500' : 'bg-brand-500'), // Use custom thumbnail
            likesCount: 0,
            comments: [],
            color: 'bg-brand-500',
            musicTrack: selectedMusic !== 'No Music' ? selectedMusic : undefined,
            category: selectedCategory,
            // Business Fields
            isAd: isBusinessMode,
            adLink: isBusinessMode ? linkUrl : undefined,
            flashDealImage: isBusinessMode ? flashDealImage : undefined,
            privacy: privacy,
            isAudio: mediaType === 'audio'
        };
        onUpload(newItem);
        setLoading(false);
    }, 1500);
  };

  const startTime = videoDuration * (trimStart / 100);
  const endTime = videoDuration * (trimEnd / 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
                <h3 className="font-bold text-lg dark:text-white">
                    {step === 1 ? `Upload ${type === 'video' ? 'Media' : 'Short'}` : 'Add Music & Trim'}
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
                {step === 1 ? (
                    <>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl flex items-center justify-between">
                            <div>
                                <span className="block text-sm font-bold text-gray-900 dark:text-white">Business Mode</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Create ads & flash deals</span>
                            </div>
                            <div 
                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${isBusinessMode ? 'bg-brand-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                onClick={() => setIsBusinessMode(!isBusinessMode)}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isBusinessMode ? 'translate-x-6' : ''}`}></div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">Title / Caption</label>
                            <input 
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder={type === 'video' ? "Title" : "Describe your short..."}
                                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>

                        {type === 'video' && (
                             <div>
                                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">Category</label>
                                <select 
                                    value={selectedCategory}
                                    onChange={e => setSelectedCategory(e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-brand-500"
                                >
                                    {['Music', 'Gaming', 'Tech', 'Fashion', 'Live', 'News', 'Learning', 'Movies', 'Sports', 'Comedy', 'DIY', 'Extra'].map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                             </div>
                        )}

                        {/* Thumbnail Upload (Visible for Video/Audio) */}
                        {type === 'video' && (
                            <div>
                                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">
                                    {mediaType === 'audio' ? 'Cover Art (Required for Audio)' : 'Thumbnail (Optional)'}
                                </label>
                                {thumbnail ? (
                                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 group">
                                        <img src={thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                                        <button 
                                            onClick={() => setThumbnail(null)}
                                            className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ) : (
                                    <label className="w-full h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <span className="text-sm font-medium">Upload Image</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                            if(e.target.files?.[0]) setThumbnail(URL.createObjectURL(e.target.files[0]));
                                        }} />
                                    </label>
                                )}
                            </div>
                        )}

                        {/* Business Fields or Generic Link */}
                        {(isBusinessMode || type === 'video') && (
                             <div>
                                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">
                                    {isBusinessMode ? 'Promotional Link / Shop URL' : 'Add Link (Optional)'}
                                </label>
                                <input 
                                    value={linkUrl}
                                    onChange={e => setLinkUrl(e.target.value)}
                                    placeholder="https://myshop.com/product"
                                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl p-3 outline-none focus:ring-2 focus:ring-brand-500"
                                />
                             </div>
                        )}

                        {isBusinessMode && (
                            <div>
                                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">Flash Deal Image</label>
                                <div className="flex items-center space-x-3">
                                    {flashDealImage ? (
                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                                            <img src={flashDealImage} alt="Deal" className="w-full h-full object-cover" />
                                            <button onClick={() => setFlashDealImage(null)} className="absolute top-0 right-0 bg-black/50 text-white p-0.5 rounded-bl">✕</button>
                                        </div>
                                    ) : (
                                        <label className="w-16 h-16 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <span className="text-2xl text-gray-400">+</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                                if(e.target.files?.[0]) setFlashDealImage(URL.createObjectURL(e.target.files[0]));
                                            }} />
                                        </label>
                                    )}
                                    <span className="text-xs text-gray-400">Upload a product image to display as an overlay.</span>
                                </div>
                            </div>
                        )}

                        {type === 'short' && (
                            <div>
                                <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">Privacy</label>
                                <div className="flex space-x-2">
                                    <button 
                                        onClick={() => setPrivacy('public')}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium border ${privacy === 'public' ? 'bg-brand-50 border-brand-500 text-brand-700' : 'border-gray-200 text-gray-500'}`}
                                    >
                                        Public
                                    </button>
                                    <button 
                                        onClick={() => setPrivacy('group')}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium border ${privacy === 'group' ? 'bg-brand-50 border-brand-500 text-brand-700' : 'border-gray-200 text-gray-500'}`}
                                    >
                                        Group Only
                                    </button>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">Upload File</label>
                            {!file ? (
                                <div className="h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors relative group text-center p-2">
                                    <input 
                                        type="file" 
                                        accept={type === 'short' ? ".mp4,.mov,.avi,.mkv,.mpeg,.webm,video/*" : ".mp4,.mov,.avi,.mkv,.mpeg,.webm,.mp3,video/*,audio/*"}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                        onChange={(e) => {
                                            if(e.target.files?.[0]) {
                                                const f = e.target.files[0];
                                                setFile(URL.createObjectURL(f));
                                                setMediaType(f.type.startsWith('audio') ? 'audio' : 'video');
                                            }
                                        }} 
                                    />
                                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mb-2 group-hover:bg-brand-100 dark:group-hover:bg-gray-500 transition-colors">
                                        <svg className="w-6 h-6 text-gray-500 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                    </div>
                                    <span className="font-bold text-gray-600 dark:text-gray-300">
                                        {type === 'short' ? 'Select Video' : 'Select Video or MP3'}
                                    </span>
                                    <span className="text-[10px] mt-1 text-gray-500 dark:text-gray-400 px-4">
                                        Accepted Formats: MP4, MOV, AVI, MKV, MPEG, WebM{type === 'video' ? ', MP3' : ''}
                                    </span>
                                </div>
                            ) : (
                                <div className="relative h-24 bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center border border-brand-500/50">
                                    <div className="text-center">
                                        <span className="block text-brand-600 dark:text-brand-400 font-bold mb-1">✓ {mediaType === 'audio' ? 'Audio' : 'Video'} Selected</span>
                                        <button onClick={() => setFile(null)} className="text-xs text-red-500 hover:underline">Change File</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button onClick={() => setStep(2)} disabled={!title || !file || (mediaType === 'audio' && !thumbnail)} className="w-full mt-2">
                            {mediaType === 'audio' && !thumbnail ? 'Cover Image Required' : 'Next: Trim & Post'}
                        </Button>
                    </>
                ) : (
                    /* Step 2: Music Trimmer */
                    <div className="space-y-6 animate-fade-in">
                        {/* Video/Audio Preview */}
                        {file && (
                            <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-md flex items-center justify-center">
                                {mediaType === 'video' ? (
                                    <video 
                                        ref={videoPreviewRef}
                                        src={file}
                                        className="w-full h-full object-contain"
                                        onLoadedMetadata={(e) => setVideoDuration(e.currentTarget.duration)}
                                        onTimeUpdate={handleTimeUpdate}
                                        autoPlay
                                        muted={selectedMusic !== 'No Music'}
                                        playsInline
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
                                        {thumbnail ? (
                                            <img src={thumbnail} alt="Cover" className="w-32 h-32 rounded-lg object-cover mb-4 shadow-lg border border-gray-700" />
                                        ) : (
                                            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                                <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                                            </div>
                                        )}
                                        <audio 
                                            ref={audioPreviewRef}
                                            src={file}
                                            controls
                                            className="w-3/4"
                                            onLoadedMetadata={(e) => setVideoDuration(e.currentTarget.duration)}
                                            onTimeUpdate={handleTimeUpdate}
                                            autoPlay
                                        />
                                    </div>
                                )}
                                
                                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                                    Preview: {formatTime(startTime)} - {formatTime(endTime)}
                                </div>
                            </div>
                        )}

                        <div>
                             <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">Select Background Music</label>
                             <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
                                {['No Music', 'Trending Pop', 'Chill LoFi', 'Upbeat Rock', 'Electronic'].map(track => (
                                    <button 
                                        key={track}
                                        onClick={() => setSelectedMusic(track)}
                                        className={`px-4 py-2 rounded-full whitespace-nowrap text-sm border ${selectedMusic === track ? 'bg-brand-500 text-white border-brand-500' : 'border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-300'}`}
                                    >
                                        {track}
                                    </button>
                                ))}
                             </div>
                        </div>

                        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl">
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                                <span>Trimmer</span>
                                <span>{formatTime(endTime - startTime)} selected</span>
                            </div>
                            {/* Visual Trimmer Representation */}
                            <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded-lg relative overflow-hidden cursor-crosshair">
                                <div className="absolute inset-0 flex items-center justify-around opacity-30 pointer-events-none">
                                    {[...Array(40)].map((_, i) => (
                                        <div key={i} className="w-1 bg-gray-800 dark:bg-white" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
                                    ))}
                                </div>
                                {/* Selection Box */}
                                <div 
                                    className="absolute top-0 bottom-0 bg-brand-500/30 border-x-4 border-brand-500 z-10"
                                    style={{ left: `${trimStart}%`, right: `${100 - trimEnd}%` }}
                                ></div>
                                {/* Inactive areas */}
                                <div className="absolute top-0 bottom-0 left-0 bg-black/40" style={{ width: `${trimStart}%` }}></div>
                                <div className="absolute top-0 bottom-0 right-0 bg-black/40" style={{ width: `${100 - trimEnd}%` }}></div>
                            </div>
                            
                            <div className="mt-4 relative h-6">
                                 <input 
                                    type="range" min="0" max="100" value={trimStart}
                                    onChange={e => setTrimStart(Math.min(parseInt(e.target.value), trimEnd - 5))}
                                    className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer z-20"
                                 />
                                 <input 
                                    type="range" min="0" max="100" value={trimEnd}
                                    onChange={e => setTrimEnd(Math.max(parseInt(e.target.value), trimStart + 5))}
                                    className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer z-20"
                                 />
                                 {/* Visual Sliders Track (Fake) */}
                                 <div className="absolute top-2 left-0 right-0 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                                 <div 
                                    className="absolute top-2 h-1 bg-brand-500"
                                    style={{ left: `${trimStart}%`, right: `${100 - trimEnd}%` }}
                                 ></div>
                            </div>
                        </div>

                        <div className="flex space-x-2 pt-2">
                             <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">Back</Button>
                             <Button onClick={handleSubmit} isLoading={loading} className="flex-1">Post</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

// --- Comment Sheet ---
const CommentSheet: React.FC<{ visible: boolean; onClose: () => void; comments: Comment[] }> = ({ visible, onClose, comments }) => {
    const [newComment, setNewComment] = useState('');
    const [localComments, setLocalComments] = useState(comments);

    const handleSend = () => {
        if(!newComment.trim()) return;
        setLocalComments([...localComments, {
            id: Date.now().toString(),
            user: 'Me',
            text: newComment,
            avatar: '👤',
            timeAgo: 'Just now'
        }]);
        setNewComment('');
    };

    if(!visible) return null;

    return (
        <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-end">
            <div className="bg-white dark:bg-gray-900 w-full h-[60%] rounded-t-3xl p-4 flex flex-col animate-slide-up shadow-2xl">
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white">{localComments.length} Comments</h3>
                    <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                    {localComments.map(c => (
                        <div key={c.id} className="flex space-x-3">
                            <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">{c.avatar}</div>
                            <div>
                                <div className="flex items-baseline space-x-2">
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{c.user}</span>
                                    <span className="text-xs text-gray-400">{c.timeAgo}</span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{c.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-2 flex items-center space-x-2">
                    <input 
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Add a comment..." 
                        className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <button onClick={handleSend} className="p-2 text-brand-600 font-bold">Post</button>
                </div>
            </div>
        </div>
    );
};

// --- Updated Share Modal ---
const ShareModal: React.FC<{ url: string; title: string; onClose: () => void }> = ({ url, title, onClose }) => {
    const [isSharing, setIsSharing] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        // Show visual feedback instead of alert for better UX
        const btn = document.getElementById('copy-btn-text');
        if(btn) btn.innerText = "Copied!";
        setTimeout(() => onClose(), 800);
    };

    const handleShareToStatus = () => {
        setIsSharing(true);
        // Simulate network request to post to status
        setTimeout(() => {
            setIsSharing(false);
            alert("Successfully shared to your status!");
            onClose();
        }, 1500);
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title, url });
                onClose();
            } catch (err) { console.error(err); }
        } else {
            alert('Sharing not supported on this browser');
        }
    };

    const openSocial = (platform: string) => {
        const text = encodeURIComponent(`Check out this video: ${title}`);
        const link = encodeURIComponent(url);
        let shareUrl = '';
        // Use more robust API links
        if (platform === 'whatsapp') shareUrl = `https://api.whatsapp.com/send?text=${text}%20${link}`;
        if (platform === 'twitter') shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${link}`;
        if (platform === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${link}`;
        
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-md" onClick={onClose}>
             <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm animate-scale-click shadow-2xl" onClick={e => e.stopPropagation()}>
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-bold dark:text-white">Share Video</h3>
                     <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 text-2xl leading-none">&times;</button>
                 </div>
                 
                 {/* Internal Actions */}
                 <div className="flex space-x-3 mb-6">
                     <button onClick={handleCopy} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl flex flex-col items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                         <svg className="w-6 h-6 mb-1 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                         <span id="copy-btn-text" className="text-xs font-bold text-gray-600 dark:text-gray-300">Copy Link</span>
                     </button>
                     <button onClick={handleShareToStatus} disabled={isSharing} className="flex-1 py-3 bg-brand-50 dark:bg-brand-900/30 rounded-xl flex flex-col items-center justify-center hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors relative overflow-hidden">
                         {isSharing ? (
                             <div className="flex flex-col items-center">
                                 <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-1"></div>
                                 <span className="text-xs font-bold text-brand-700 dark:text-brand-300">Posting...</span>
                             </div>
                         ) : (
                             <>
                                <div className="w-6 h-6 mb-1 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs font-bold">+</div>
                                <span className="text-xs font-bold text-brand-700 dark:text-brand-300">My Status</span>
                             </>
                         )}
                     </button>
                 </div>

                 {/* External Apps */}
                 <div className="grid grid-cols-4 gap-4 text-center">
                     <button onClick={() => openSocial('whatsapp')} className="flex flex-col items-center group">
                         <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                             <span className="text-xl">💬</span>
                         </div>
                         <span className="text-[10px] mt-1 dark:text-gray-300">WhatsApp</span>
                     </button>
                     <button onClick={() => openSocial('twitter')} className="flex flex-col items-center group">
                         <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                             <span className="text-xl">𝕏</span>
                         </div>
                         <span className="text-[10px] mt-1 dark:text-gray-300">Twitter</span>
                     </button>
                     <button onClick={() => openSocial('facebook')} className="flex flex-col items-center group">
                         <div className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                             <span className="text-xl">f</span>
                         </div>
                         <span className="text-[10px] mt-1 dark:text-gray-300">Facebook</span>
                     </button>
                     <button onClick={handleNativeShare} className="flex flex-col items-center group">
                         <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-200 shadow-lg group-hover:scale-110 transition-transform">
                             <span className="text-xl">•••</span>
                         </div>
                         <span className="text-[10px] mt-1 dark:text-gray-300">More</span>
                     </button>
                 </div>
             </div>
        </div>
    );
};

interface VideoFeedProps {
    onOpenAdPortal?: () => void;
}

// --- Youtube-style Feed ---
export const VideoFeed: React.FC<VideoFeedProps> = ({ onOpenAdPortal }) => {
  const [showUpload, setShowUpload] = useState(false);
  const [activeComments, setActiveComments] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Extended Category List for Scrolling Demo
  const categories = [
      'All', 'Music', 'Gaming', 'Movies', 'Sports', 'Comedy', 
      'Tech', 'Fashion', 'Live', 'News', 'Learning', 'DIY', 
      'Travel', 'Food', 'Fitness', 'Automotive', 'Science', 'Extra'
  ];

  const [videos, setVideos] = useState<VideoItem[]>([
    { id: '1', title: 'Big Buck Bunny Trailer', author: 'Blender Foundation', views: '1.2M', timeAgo: '2 years ago', thumbnail: 'bg-blue-200', videoUrl: SAMPLE_VIDEOS[0], likesCount: 1200, comments: MOCK_COMMENTS, category: 'Movies' },
    { id: '2', title: 'Elephant Dream', author: 'Orange Open Movie', views: '500K', timeAgo: '5 years ago', thumbnail: 'bg-green-200', videoUrl: SAMPLE_VIDEOS[2], likesCount: 4500, comments: MOCK_COMMENTS, category: 'Movies' },
    { id: '3', title: 'Gaming Highlights 2024', author: 'ProGamer', views: '200K', timeAgo: '1 day ago', thumbnail: 'bg-red-200', videoUrl: SAMPLE_VIDEOS[1], likesCount: 3000, comments: [], category: 'Gaming' },
    { id: '4', title: 'Top 10 Tech Gadgets', author: 'TechReview', views: '800K', timeAgo: '3 days ago', thumbnail: 'bg-purple-200', videoUrl: SAMPLE_VIDEOS[0], likesCount: 8500, comments: [], category: 'Tech' },
    { id: '5', title: 'Relaxing Music Mix', author: 'ChillVibes', views: '1.5M', timeAgo: '1 week ago', thumbnail: 'bg-yellow-200', videoUrl: SAMPLE_VIDEOS[2], likesCount: 12000, comments: [], category: 'Music' },
  ]);

  const handleUpload = (newItem: VideoItem) => {
      setVideos([newItem, ...videos]);
      setShowUpload(false);
  };

  const handleLike = (id: string) => {
      setVideos(prev => prev.map(v => v.id === id ? { 
          ...v, 
          likesCount: v.isLiked ? v.likesCount - 1 : v.likesCount + 1,
          isLiked: !v.isLiked 
      } : v));
  };

  const filteredVideos = activeCategory === 'All' 
    ? videos 
    : videos.filter(v => v.category === activeCategory);

  // Drag to Scroll Logic
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  // Add controls for side-buttons
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Check scroll position to toggle arrows
  const checkScroll = () => {
      if (scrollRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
          setShowLeftArrow(scrollLeft > 10);
          setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
      }
  };

  useEffect(() => {
      checkScroll();
      window.addEventListener('resize', checkScroll);
      return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const slide = (direction: 'left' | 'right') => {
      if (scrollRef.current) {
          const scrollAmount = 300;
          scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
          // We need a timeout to check scroll after animation, or rely on onScroll event
          setTimeout(checkScroll, 350);
      }
  };

  const onMouseDown = (e: React.MouseEvent) => {
      if (!scrollRef.current) return;
      setIsDragging(true);
      setStartX(e.pageX - scrollRef.current.offsetLeft);
      setScrollLeft(scrollRef.current.scrollLeft);
  };

  const onMouseLeave = () => {
      setIsDragging(false);
  };

  const onMouseUp = () => {
      setIsDragging(false);
  };

  const onMouseMove = (e: React.MouseEvent) => {
      if (!isDragging || !scrollRef.current) return;
      e.preventDefault();
      const x = e.pageX - scrollRef.current.offsetLeft;
      const walk = (x - startX) * 2; // Scroll fast
      scrollRef.current.scrollLeft = scrollLeft - walk;
      checkScroll();
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-full p-4 pb-20 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm z-10 pt-2 pb-4 transition-colors duration-300">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-brand-900 dark:text-white">Trending Videos</h1>
            <div className="flex space-x-2">
                {onOpenAdPortal && (
                    <button 
                        type="button"
                        onClick={onOpenAdPortal}
                        className="flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-2 rounded-full font-medium hover:bg-purple-200 dark:hover:bg-purple-800/40 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                        <span className="text-xs">Ads Manager</span>
                    </button>
                )}
                <button 
                    onClick={() => setShowUpload(true)}
                    className="flex items-center space-x-2 bg-brand-100 dark:bg-gray-700 text-brand-700 dark:text-white px-4 py-2 rounded-full font-medium hover:bg-brand-200 dark:hover:bg-gray-600 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    <span>Upload</span>
                </button>
            </div>
        </div>
        
        {/* Category Dragbar with Sliding Controls */}
        <div className="relative group">
            {showLeftArrow && (
                <button 
                    onClick={() => slide('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-gray-800/90 p-1.5 rounded-full shadow-md text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-opacity"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
            )}

            <div 
                ref={scrollRef}
                className={`flex space-x-2 overflow-x-auto no-scrollbar pb-2 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={onMouseDown}
                onMouseLeave={onMouseLeave}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}
                onScroll={checkScroll}
            >
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => { if(!isDragging) setActiveCategory(cat); }}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 transform active:scale-95 flex-shrink-0 ${
                            activeCategory === cat 
                            ? 'bg-brand-900 text-white shadow-md scale-105' 
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {showRightArrow && (
                <button 
                    onClick={() => slide('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-gray-800/90 p-1.5 rounded-full shadow-md text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-opacity"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            )}
        </div>
      </div>
      
      <div className="space-y-6">
        {filteredVideos.length === 0 ? (
            <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">📹</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">No videos found</h3>
                <p className="text-gray-500">Try a different category or upload a new video.</p>
            </div>
        ) : (
            filteredVideos.map(video => (
                <div key={video.id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 group">
                    <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 group-hover:opacity-95 transition-opacity cursor-pointer">
                        {video.videoUrl ? (
                            <video src={video.videoUrl} className="w-full h-full object-cover" controls preload="metadata" />
                        ) : (
                            <div className={`w-full h-full ${video.thumbnail || 'bg-gray-300'} flex items-center justify-center`}>
                                <span className="text-gray-500 dark:text-gray-400 font-bold">No Preview</span>
                            </div>
                        )}
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-mono">
                            {formatTime(120)} {/* Mock duration */}
                        </div>
                    </div>
                    <div className="p-4 flex space-x-3">
                         <div className="flex-shrink-0">
                             <div className="w-10 h-10 bg-brand-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-lg shadow-sm border border-white dark:border-gray-600">
                                 {video.author[0].toUpperCase()}
                             </div>
                         </div>
                         <div className="flex-1 min-w-0">
                             <h3 className="font-bold text-gray-900 dark:text-white leading-tight mb-1 truncate pr-4">{video.title}</h3>
                             <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                                 <span>{video.author}</span>
                                 <BadgeIcon type="verified" />
                                 <span className="mx-1">•</span>
                                 <span>{video.views} views</span>
                                 <span className="mx-1">•</span>
                                 <span>{video.timeAgo}</span>
                             </div>
                             <div className="flex items-center space-x-4 pt-2 border-t border-gray-5 dark:border-gray-700">
                                 <button onClick={() => handleLike(video.id)} className={`flex items-center space-x-1 transition-colors ${video.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}>
                                     <svg className={`w-5 h-5 ${video.isLiked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                     <span className="text-xs font-bold">{formatCount(video.likesCount)}</span>
                                 </button>
                                 <button onClick={() => setActiveComments(activeComments === video.id ? null : video.id)} className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                     <span className="text-xs font-bold">{video.comments.length}</span>
                                 </button>
                                 <button 
                                    className="flex items-center space-x-1 text-gray-500 hover:text-brand-500 transition-colors ml-auto"
                                    onClick={() => {
                                        if (navigator.share) navigator.share({ title: video.title, url: video.videoUrl });
                                        else alert("Link copied!");
                                    }}
                                 >
                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                 </button>
                             </div>
                         </div>
                    </div>
                    <CommentSheet visible={activeComments === video.id} onClose={() => setActiveComments(null)} comments={video.comments} />
                </div>
            ))
        )}
      </div>

      {showUpload && (
        <UploadModal 
          type="video" 
          onClose={() => setShowUpload(false)} 
          onUpload={handleUpload} 
        />
      )}
    </div>
  );
};

// --- Animations: Floating Emojis ---
const FloatingEmojis: React.FC<{ active: boolean }> = ({ active }) => {
    const [emojis, setEmojis] = useState<{ id: number; x: number; y: number }[]>([]);

    useEffect(() => {
        if (active) {
            const newEmoji = { id: Date.now(), x: Math.random() * 80 + 10, y: 80 };
            setEmojis(prev => [...prev, newEmoji]);
            setTimeout(() => setEmojis(prev => prev.filter(e => e.id !== newEmoji.id)), 1000);
        }
    }, [active]);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
            {emojis.map(e => (
                <div 
                    key={e.id}
                    className="absolute text-4xl animate-float-up"
                    style={{ left: `${e.x}%`, bottom: '150px' }}
                >
                    ❤️
                </div>
            ))}
        </div>
    );
};

// --- Updated Shorts Player ---
const ShortsPlayer: React.FC<{ 
    short: ShortItem, 
    isGlobalMuted: boolean, 
    onToggleGlobalMute: () => void,
    onView: () => void,
    onUpdateShort: (id: string, updates: Partial<ShortItem>) => void
}> = ({ short, isGlobalMuted, onToggleGlobalMute, onView, onUpdateShort }) => {
    const [showComments, setShowComments] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [animateLike, setAnimateLike] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Sync global mute
    useEffect(() => {
        if (videoRef.current) videoRef.current.muted = isGlobalMuted;
    }, [isGlobalMuted]);

    // Track View
    useEffect(() => {
        const timer = setTimeout(() => {
             onView();
        }, 3000); // Count as view after 3s
        return () => clearTimeout(timer);
    }, []);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const handleDoubleTap = (e: React.MouseEvent) => {
        // Simple double click simulation handled by parent onClick? 
        // For now, let's just use click to play/pause, but double click to like
        if (e.detail === 2) {
            handleLike();
        } else {
            togglePlay();
        }
    };

    const handleLike = () => {
        setAnimateLike(true);
        setTimeout(() => setAnimateLike(false), 500);
        onUpdateShort(short.id, {
            isLiked: !short.isLiked,
            likesCount: short.isLiked ? short.likesCount - 1 : short.likesCount + 1,
            isDisliked: false // Clear dislike if liking
        });
    };

    const handleDislike = () => {
        onUpdateShort(short.id, {
            isDisliked: !short.isDisliked,
            dislikesCount: short.dislikesCount ? (short.isDisliked ? short.dislikesCount - 1 : short.dislikesCount + 1) : 1,
            isLiked: false // Clear like if disliking
        });
    };

    const handleFollow = () => {
        onUpdateShort(short.id, { isFollowed: !short.isFollowed });
    };

    return (
        <div className="w-full h-[calc(100vh-64px)] md:h-full snap-start relative flex items-center justify-center bg-black overflow-hidden group">
            {short.videoUrl ? (
                <video 
                    ref={videoRef}
                    src={short.videoUrl} 
                    className="w-full h-full object-cover" 
                    autoPlay 
                    loop 
                    muted={isGlobalMuted}
                    playsInline 
                    onClick={handleDoubleTap}
                />
            ) : (
                <div className={`w-full h-full ${short.color} flex items-center justify-center`} onClick={handleDoubleTap}>
                    <span className="text-white font-bold text-2xl">{short.title}</span>
                </div>
            )}

            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                     <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                     </div>
                </div>
            )}

            {/* Animation Overlay */}
            <FloatingEmojis active={animateLike} />

            {/* Mute Toggle */}
            <div className="absolute top-20 right-4 z-20">
                <button onClick={(e) => { e.stopPropagation(); onToggleGlobalMute(); }} className="bg-black/40 p-3 rounded-full text-white backdrop-blur-md hover:bg-black/60 transition-all shadow-lg active:scale-90">
                    {isGlobalMuted ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                    )}
                </button>
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none z-10"></div>

            {/* Content Info */}
            <div className="absolute bottom-24 left-4 right-16 text-white z-20">
                <div className="flex items-center space-x-2 mb-2">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-black font-bold">
                        {short.author[1].toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-bold text-sm drop-shadow-md">{short.author}</h3>
                        {short.musicTrack && (
                             <div className="flex items-center space-x-1 text-xs opacity-90">
                                 <svg className="w-3 h-3 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                                 <span>{short.musicTrack}</span>
                             </div>
                        )}
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleFollow(); }}
                        className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${short.isFollowed ? 'bg-gray-600 text-white' : 'bg-red-500 text-white'}`}
                    >
                        {short.isFollowed ? 'Following' : 'Follow'}
                    </button>
                </div>
                <p className="text-sm font-medium drop-shadow-md line-clamp-2">{short.title}</p>
                {short.isAd && (
                    <div className="mt-2">
                        <span className="bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded mr-2">Ad</span>
                        {short.adLink && <a href={short.adLink} target="_blank" rel="noreferrer" className="text-yellow-300 text-xs font-bold hover:underline">Shop Now &rarr;</a>}
                    </div>
                )}
            </div>

            {/* Right Sidebar Actions */}
            <div className="absolute bottom-24 right-2 flex flex-col space-y-6 items-center text-white z-20">
                
                {/* LIKE */}
                <button onClick={(e) => { e.stopPropagation(); handleLike(); }} className="flex flex-col items-center group">
                    <div className={`w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-transform active:scale-90 group-hover:bg-black/60`}>
                        <svg className={`w-6 h-6 ${short.isLiked ? 'text-red-500 fill-current' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </div>
                    <span className="text-xs font-bold mt-1 shadow-black drop-shadow-md">{formatCount(short.likesCount)}</span>
                </button>

                {/* DISLIKE */}
                <button onClick={(e) => { e.stopPropagation(); handleDislike(); }} className="flex flex-col items-center group">
                    <div className={`w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-transform active:scale-90 group-hover:bg-black/60`}>
                        <svg className={`w-6 h-6 ${short.isDisliked ? 'text-white fill-current' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" /></svg>
                    </div>
                    {short.dislikesCount !== undefined && <span className="text-xs font-bold mt-1 shadow-black drop-shadow-md">{formatCount(short.dislikesCount)}</span>}
                </button>

                {/* COMMENTS */}
                <button onClick={(e) => { e.stopPropagation(); setShowComments(true); }} className="flex flex-col items-center group">
                    <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-transform active:scale-90 group-hover:bg-black/60">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>
                    </div>
                    <span className="text-xs font-bold mt-1 shadow-black drop-shadow-md">{formatCount(short.comments.length)}</span>
                </button>

                {/* SHARE */}
                <button onClick={(e) => { e.stopPropagation(); setShowShare(true); }} className="flex flex-col items-center group">
                    <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-transform active:scale-90 group-hover:bg-black/60">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    </div>
                    <span className="text-xs font-bold mt-1 shadow-black drop-shadow-md">Share</span>
                </button>
                
                {/* Rotating Album Art */}
                 <div className="w-10 h-10 rounded-full bg-gray-800 border-2 border-gray-700 overflow-hidden animate-spin-slow mt-2">
                     <div className="w-full h-full bg-gradient-to-tr from-gray-700 to-gray-900 flex items-center justify-center">
                         <span className="text-[10px]">🎵</span>
                     </div>
                 </div>
            </div>

            {/* Flash Deal Overlay */}
            {short.isAd && short.flashDealImage && (
                <div className="absolute top-20 right-4 w-20 h-24 bg-white rounded-lg shadow-xl overflow-hidden transform rotate-6 border-2 border-yellow-400 animate-pulse z-10">
                     <img src={short.flashDealImage} alt="Deal" className="w-full h-full object-cover" />
                     <div className="absolute bottom-0 inset-x-0 bg-red-600 text-white text-[8px] font-bold text-center py-1">
                         50% OFF
                     </div>
                </div>
            )}

            <CommentSheet visible={showComments} onClose={() => setShowComments(false)} comments={short.comments} />
            
            {showShare && (
                <ShareModal 
                    url={short.shareUrl || window.location.href} 
                    title={short.title} 
                    onClose={() => setShowShare(false)} 
                />
            )}
        </div>
    );
};

// --- History View ---
const HistoryView: React.FC<{ history: string[], videos: ShortItem[], onClose: () => void }> = ({ history, videos, onClose }) => {
    return (
        <div className="fixed inset-0 z-[70] bg-white dark:bg-gray-900 flex flex-col animate-slide-up">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0">
                <h2 className="text-xl font-bold dark:text-white">Watch History</h2>
                <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                {history.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">No videos watched yet.</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {history.map((id, idx) => {
                            const vid = videos.find(v => v.id === id);
                            if (!vid) return null;
                            return (
                                <div key={`${id}-${idx}`} className="aspect-[9/16] bg-gray-800 rounded-lg overflow-hidden relative">
                                    {vid.videoUrl ? (
                                        <video src={vid.videoUrl} className="w-full h-full object-cover opacity-50" />
                                    ) : (
                                        <div className={`w-full h-full ${vid.color}`}></div>
                                    )}
                                    <div className="absolute bottom-2 left-2 text-white font-bold text-xs">{vid.title}</div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export const ShortsFeed: React.FC = () => {
    const [shorts, setShorts] = useState<ShortItem[]>([
        { id: '1', title: 'POV: You discover a hidden gem 🌊', author: '@traveler', color: 'bg-blue-400', likesCount: 45000, comments: MOCK_COMMENTS, videoUrl: SAMPLE_VIDEOS[2], musicTrack: 'Ocean Waves - LoFi' },
        { id: '2', title: 'Wait for the drop! 🎵', author: '@music_prod', color: 'bg-purple-500', likesCount: 12000, comments: [], videoUrl: SAMPLE_VIDEOS[0], musicTrack: 'Original Sound' },
        { id: '3', title: 'Quick & Easy Recipe 🥘', author: '@chef_mike', color: 'bg-green-400', likesCount: 8500, comments: MOCK_COMMENTS, videoUrl: SAMPLE_VIDEOS[1], musicTrack: 'Cooking Vibes' },
    ]);
    const [showUpload, setShowUpload] = useState(false);
    const [isGlobalMuted, setIsGlobalMuted] = useState(true);
    
    // History Tracking
    const [history, setHistory] = useState<string[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    const toggleGlobalMute = () => {
        setIsGlobalMuted(prev => !prev);
    };

    const handleUpdateShort = (id: string, updates: Partial<ShortItem>) => {
        setShorts(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const addToHistory = (id: string) => {
        setHistory(prev => {
            // Avoid duplicates at the end
            if (prev[prev.length - 1] === id) return prev;
            return [...prev, id];
        });
    };

    return (
        <div className="relative h-full bg-black">
            {/* Header Overlay */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 pt-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
                <div className="flex items-center space-x-2">
                     <h1 className="text-xl font-bold text-white drop-shadow-md">Shorts</h1>
                     <button onClick={() => setShowHistory(true)} className="pointer-events-auto text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-white">History</button>
                </div>
                <button 
                    onClick={() => setShowUpload(true)} 
                    className="pointer-events-auto bg-white/20 hover:bg-white/30 backdrop-blur-md p-2 rounded-full text-white transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
            </div>

            {/* Scroll Container */}
            <div className="h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth">
                {shorts.map(short => (
                    <ShortsPlayer 
                        key={short.id} 
                        short={short} 
                        isGlobalMuted={isGlobalMuted} 
                        onToggleGlobalMute={toggleGlobalMute}
                        onView={() => addToHistory(short.id)}
                        onUpdateShort={handleUpdateShort}
                    />
                ))}
            </div>

             {/* Upload Modal */}
             {showUpload && (
                <UploadModal 
                    type="short" 
                    onClose={() => setShowUpload(false)} 
                    onUpload={(item) => { 
                        const newShort: ShortItem = {
                            ...item,
                            color: 'bg-gray-800', 
                            likesCount: 0,
                            comments: []
                        };
                        setShorts([newShort, ...shorts]); 
                        setShowUpload(false); 
                    }} 
                />
            )}

            {/* History Modal */}
            {showHistory && <HistoryView history={history} videos={shorts} onClose={() => setShowHistory(false)} />}
        </div>
    );
};
