import React, { useState } from 'react';
import { Uploader } from './Uploader';
import { OutfitCard } from './OutfitCard';
import { Button } from './Button';
import { GeneratedOutfit } from '../types';
import { generateOutfitOptions, generateAppIcon, generateAiVideo, generateStyledAvatar } from '../services/geminiService';
import { convertSvgToPng } from '../utils/imageUtils';

// Simple SVG placeholders for example items
const EXAMPLE_ITEMS = [
  {
    name: 'Red Summer Dress',
    svg: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2Y0M2YzYyI+PHBhdGggZD0iTTEyIDJMNCA2djJoM3YxMmgyVjhoMnYxMmgyVjhoM1Y2TDEyIDJ6Ii8+PC9zdmc+`
  },
  {
    name: 'Blue Denim Jacket',
    svg: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzNiODJmNiI+PHBhdGggZD0iTTQgNmw0LTRoOGw0IDQtMiAxNEg2TDQgNnptOCAydjEyIi8+PC9zdmc+`
  },
  {
    name: 'Green Sneakers',
    svg: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzEwYjk4MSI+PHBhdGggZD0iTTIgMThsNC02aDEybC00IDZIMnptMTYtNmwwLTYtNC0yLTQgMmwtMiA0SDR2NmgyMHYtNmgtMnoiLz48L3N2Zz4=`
  }
];

const ICON_PROMPTS = [
  "Chat bubble in teal and white gradient",
  "Play button with neon glow",
  "Lightning bolt for short videos",
  "Abstract community connection nodes"
];

const VIDEO_STYLES = [
    "Cinematic", "3D Render", "Anime", "Claymation", "Pixel Art", "Cyberpunk"
];

interface StylistInterfaceProps {
    onUpdateAvatar?: (url: string) => void;
}

export const StylistInterface: React.FC<StylistInterfaceProps> = ({ onUpdateAvatar }) => {
  const [mode, setMode] = useState<'outfit' | 'icon' | 'motion' | 'avatar'>('outfit');
  
  // Outfit State
  const [outfits, setOutfits] = useState<GeneratedOutfit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Icon State
  const [iconPrompt, setIconPrompt] = useState('');
  const [generatedIcon, setGeneratedIcon] = useState<string | null>(null);

  // Motion State
  const [motionPrompt, setMotionPrompt] = useState('');
  const [motionStyle, setMotionStyle] = useState('Cinematic');
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);

  // Avatar State
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [generatedAvatar, setGeneratedAvatar] = useState<string | null>(null);
  const [avatarStyle, setAvatarStyle] = useState('Cotton Plushie');

  // --- Outfit Handlers ---
  const handleImageSelected = async (base64: string) => {
    setLoading(true);
    setError(null);
    setOutfits([]);

    try {
      const results = await generateOutfitOptions(base64);
      setOutfits(results);
    } catch (err) {
      console.error(err);
      setError("Sorry, we couldn't generate outfits right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = async (svgUrl: string) => {
    setLoading(true);
    setError(null);
    // Temporary Loading State
    setOutfits([{ type: 'Preparing', title: 'Loading...', description: 'Converting example image...', imageUrl: '', loading: true }]);

    try {
      const pngBase64 = await convertSvgToPng(svgUrl);
      setOutfits([]); // Clear loading state
      await handleImageSelected(pngBase64);
    } catch (e) {
      console.error(e);
      setError("Failed to process example image.");
      setLoading(false);
      setOutfits([]);
    }
  };

  const handleReset = () => {
    setOutfits([]);
    setError(null);
  };

  // --- Icon Handlers ---
  const handleGenerateIcon = async () => {
    if (!iconPrompt.trim()) return;
    setLoading(true);
    setError(null);
    setGeneratedIcon(null);

    try {
      const result = await generateAppIcon(iconPrompt);
      setGeneratedIcon(result);
    } catch (err) {
      console.error(err);
      setError("Failed to generate icon. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Motion Handlers ---
  const handleGenerateMotion = async () => {
      if (!motionPrompt.trim()) return;
      setLoading(true);
      setError(null);
      setGeneratedVideo(null);

      const fullPrompt = `${motionStyle} style, high quality, ${motionPrompt}`;

      try {
          const result = await generateAiVideo(fullPrompt);
          setGeneratedVideo(result);
      } catch (err) {
          console.error(err);
          setError("Failed to generate video. (Note: Veo requires a paid API key).");
      } finally {
          setLoading(false);
      }
  };

  // --- Avatar Handlers ---
  const handleAvatarUpload = (base64: string) => {
      setAvatarImage(base64);
      setGeneratedAvatar(null);
  };

  const handleGenerateAvatar = async () => {
      if (!avatarImage) return;
      setLoading(true);
      setError(null);
      
      try {
          const result = await generateStyledAvatar(avatarImage, avatarStyle);
          setGeneratedAvatar(result);
      } catch (err) {
          console.error(err);
          setError("Failed to generate avatar.");
      } finally {
          setLoading(false);
      }
  };

  const handleAutoUpdateProfile = () => {
      if (generatedAvatar && onUpdateAvatar) {
          onUpdateAvatar(generatedAvatar);
          alert("Profile Avatar Updated Successfully!");
      }
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 flex flex-col overflow-y-auto pb-24 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 p-4 shadow-sm sticky top-0 z-10 border-b border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-brand-900 dark:text-brand-400">AI Studio</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Create content with AI.</p>
        
        {/* Mode Switcher */}
        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mt-4 overflow-x-auto">
          {['outfit', 'icon', 'motion', 'avatar'].map((m) => (
             <button
                key={m}
                onClick={() => setMode(m as any)}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all whitespace-nowrap capitalize ${mode === m ? 'bg-white dark:bg-gray-600 shadow text-brand-700 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
             >
                {m}
             </button>
          ))}
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col max-w-7xl mx-auto w-full">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm border border-red-100 dark:border-red-800">
            {error}
          </div>
        )}

        {/* --- OUTFIT MODE --- */}
        {mode === 'outfit' && (
          <>
            {outfits.length === 0 && !loading ? (
              <div className="flex-1 flex flex-col justify-center animate-fade-in max-w-lg mx-auto w-full">
                 <Uploader onImageSelected={handleImageSelected} />
                 
                 <div className="mt-8">
                   <div className="flex items-center justify-center space-x-2 mb-4">
                     <div className="h-px bg-gray-200 dark:bg-gray-700 w-12"></div>
                     <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Or try an example</span>
                     <div className="h-px bg-gray-200 dark:bg-gray-700 w-12"></div>
                   </div>
                   
                   <div className="grid grid-cols-3 gap-3">
                     {EXAMPLE_ITEMS.map((item, idx) => (
                       <button 
                         key={idx}
                         onClick={() => handleExampleClick(item.svg)}
                         disabled={loading}
                         className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:border-brand-400 dark:hover:border-brand-500 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group active:scale-95"
                       >
                         <div className="w-12 h-12 mb-2 p-1 transition-transform group-hover:scale-110">
                           <img src={item.svg} alt={item.name} className="w-full h-full object-contain drop-shadow-sm" />
                         </div>
                         <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300 text-center leading-tight">{item.name}</span>
                       </button>
                     ))}
                   </div>
                 </div>
              </div>
            ) : (
              <div className="flex flex-col h-full space-y-6 animate-slide-up">
                {loading ? (
                    <div className="text-center py-20">
                         <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-800 rounded-full animate-spin mx-auto mb-6"></div>
                         <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Analyzing your style...</h2>
                         <p className="text-gray-500">Creating 3 distinct looks for you.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Virtual Stylist Results</h2>
                            <Button onClick={handleReset} variant="secondary" className="!py-2 !px-4 !text-sm">Style New Item</Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {outfits.map((outfit, index) => (
                                <div key={index} className="flex flex-col h-full">
                                    <div className="flex-grow">
                                        <OutfitCard outfit={outfit} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
              </div>
            )}
          </>
        )}

        {/* --- ICON GEN MODE --- */}
        {mode === 'icon' && (
          <div className="animate-fade-in flex flex-col h-full max-w-lg mx-auto w-full">
             <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Describe your icon</label>
                <div className="relative">
                  <textarea 
                    value={iconPrompt}
                    onChange={(e) => setIconPrompt(e.target.value)}
                    placeholder="E.g. A futuristic robot head, neon colors, minimal style..."
                    className="w-full h-32 p-4 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-500 outline-none resize-none text-sm"
                  />
                  {loading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {ICON_PROMPTS.map((p, i) => (
                    <button 
                      key={i}
                      onClick={() => setIconPrompt(p)}
                      className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900 dark:hover:text-brand-300 transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
             </div>

             <Button 
                onClick={handleGenerateIcon} 
                disabled={loading || !iconPrompt.trim()}
                isLoading={loading}
                className="w-full mb-8"
             >
                Generate Icon
             </Button>

             {generatedIcon && (
               <div className="animate-slide-up border-t border-gray-100 dark:border-gray-700 pt-8 text-center">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Icon</h3>
                  <div className="w-48 h-48 mx-auto bg-gray-100 dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl border-4 border-white dark:border-gray-700 mb-4 group relative">
                     <img src={generatedIcon} alt="Generated Icon" className="w-full h-full object-cover" />
                     <a 
                       href={generatedIcon} 
                       download="app-icon.jpg"
                       className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-medium"
                     >
                       Download
                     </a>
                  </div>
                  <p className="text-xs text-gray-400">Click image to download</p>
               </div>
             )}
          </div>
        )}

        {/* --- MOTION MODE (VIDEO) --- */}
        {mode === 'motion' && (
            <div className="animate-fade-in flex flex-col h-full max-w-lg mx-auto w-full">
                <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Video Style</label>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {VIDEO_STYLES.map(style => (
                            <button
                                key={style}
                                onClick={() => setMotionStyle(style)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                                    motionStyle === style
                                    ? 'bg-brand-500 text-white border-brand-500'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                                }`}
                            >
                                {style}
                            </button>
                        ))}
                    </div>

                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Describe the scene</label>
                    <div className="relative">
                        <textarea 
                            value={motionPrompt}
                            onChange={(e) => setMotionPrompt(e.target.value)}
                            placeholder="E.g. A cyberpunk city with flying cars, neon lights..."
                            className="w-full h-32 p-4 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl focus:ring-2 focus:ring-brand-500 outline-none resize-none text-sm"
                        />
                         {loading && (
                            <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                </div>
                <Button 
                    onClick={handleGenerateMotion} 
                    disabled={loading || !motionPrompt.trim()}
                    isLoading={loading}
                    className="w-full mb-8"
                >
                    Generate {motionStyle} Video
                </Button>

                {generatedVideo && (
                    <div className="animate-slide-up border-t border-gray-100 dark:border-gray-700 pt-8 text-center">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Generated Clip</h3>
                        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-xl mb-4">
                            <video src={generatedVideo} controls autoPlay loop className="w-full h-full object-cover" />
                        </div>
                        <a 
                           href={generatedVideo}
                           download="generated-video.mp4" 
                           className="text-brand-600 hover:underline text-sm font-medium"
                        >
                            Download Video
                        </a>
                    </div>
                )}
            </div>
        )}

        {/* --- AVATAR MODE --- */}
        {mode === 'avatar' && (
            <div className="animate-fade-in flex flex-col h-full max-w-lg mx-auto w-full">
                {!avatarImage ? (
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Create Your AI Avatar</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Upload a selfie to get started.</p>
                        <Uploader onImageSelected={handleAvatarUpload} />
                    </div>
                ) : (
                    <div className="space-y-6">
                         {/* Preview Original */}
                         <div className="flex items-center space-x-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                             <img src={avatarImage} alt="Original" className="w-16 h-16 rounded-full object-cover border-2 border-white" />
                             <div>
                                 <p className="text-sm font-bold dark:text-white">Your Photo</p>
                                 <button onClick={() => setAvatarImage(null)} className="text-xs text-red-500 hover:underline">Change Photo</button>
                             </div>
                         </div>

                         {/* Style Selection */}
                         <div>
                             <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Choose Style</label>
                             <div className="grid grid-cols-2 gap-3">
                                 {['Cotton Plushie', '3D Cartoon', 'Anime Style', 'Clay Animation'].map((style) => (
                                     <button
                                        key={style}
                                        onClick={() => setAvatarStyle(style)}
                                        className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                                            avatarStyle === style 
                                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 ring-1 ring-brand-500' 
                                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-brand-300'
                                        }`}
                                     >
                                         {style}
                                     </button>
                                 ))}
                             </div>
                         </div>

                         {/* Action Buttons */}
                         <div className="space-y-3">
                            <Button 
                                onClick={handleGenerateAvatar} 
                                isLoading={loading} 
                                className="w-full"
                            >
                                Generate {avatarStyle} Avatar
                            </Button>
                         </div>
                         
                         {/* Result */}
                         {generatedAvatar && (
                             <div className="animate-slide-up bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-brand-100 dark:border-gray-700 text-center">
                                 <h3 className="font-bold text-gray-900 dark:text-white mb-4">Your New Avatar</h3>
                                 <div className="relative w-40 h-40 mx-auto mb-4">
                                     <img src={generatedAvatar} alt="Generated Avatar" className="w-full h-full rounded-full object-cover border-4 border-brand-200 dark:border-brand-800 shadow-md" />
                                     <div className="absolute bottom-0 right-0 bg-green-500 w-8 h-8 rounded-full border-4 border-white dark:border-gray-800"></div>
                                 </div>
                                 
                                 <div className="flex space-x-3">
                                     <Button onClick={handleAutoUpdateProfile} className="flex-1 !text-sm">
                                         Update Profile Auto
                                     </Button>
                                     <a 
                                        href={generatedAvatar} 
                                        download="my-avatar.png"
                                        className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                                     >
                                         Download
                                     </a>
                                 </div>
                             </div>
                         )}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};