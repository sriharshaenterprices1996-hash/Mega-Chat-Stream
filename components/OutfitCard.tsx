import React, { useState } from 'react';
import { GeneratedOutfit } from '../types';

interface OutfitCardProps {
  outfit: GeneratedOutfit;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({ outfit }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  
  // Hover Zoom State
  const [isHovering, setIsHovering] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!outfit.imageUrl) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setCursorPos({ x, y });
  };

  return (
    <>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-brand-100 flex flex-col h-full">
        <div className="relative aspect-square bg-brand-50 overflow-hidden group">
          {outfit.loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-800">
              <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-800 rounded-full animate-spin mb-4"></div>
              <p className="text-sm font-medium tracking-wide animate-pulse">Designing {outfit.type} Look...</p>
            </div>
          ) : outfit.imageUrl ? (
            <div 
              className="w-full h-full cursor-zoom-in relative overflow-hidden"
              onClick={() => setIsZoomed(true)}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onMouseMove={handleMouseMove}
              title="Hover to inspect details, Click to open full screen"
            >
              <img 
                src={outfit.imageUrl} 
                alt={`${outfit.type} Outfit`} 
                className={`w-full h-full object-cover transition-transform duration-100 ease-out`}
                style={{
                    transformOrigin: `${cursorPos.x}% ${cursorPos.y}%`,
                    transform: isHovering ? 'scale(2.5)' : 'scale(1)'
                }}
              />
              
              {/* Zoom hint overlay (only visible when not hovering to avoid obstruction) */}
              {!isHovering && (
                <div className="absolute bottom-3 right-3 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                </div>
              )}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-brand-300">
              <span className="text-sm">Image unavailable</span>
            </div>
          )}
          
          <div className="absolute top-4 left-4 pointer-events-none">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-bold tracking-widest text-brand-900 uppercase rounded-full shadow-sm">
              {outfit.type}
            </span>
          </div>
        </div>

        <div className="p-6 flex-grow flex flex-col">
          <h3 className="font-serif text-xl font-semibold text-brand-900 mb-3">{outfit.type}</h3>
          <p className="text-brand-800 text-sm leading-relaxed flex-grow opacity-80">
            {outfit.description}
          </p>
        </div>
      </div>

      {/* Full Screen Zoom Modal */}
      {isZoomed && outfit.imageUrl && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out animate-fade-in backdrop-blur-sm"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <img 
              src={outfit.imageUrl} 
              alt="Zoomed Detail" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-scale-in"
              style={{ maxHeight: '90vh' }}
            />
            
            <button 
              className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors backdrop-blur-md"
              onClick={(e) => { e.stopPropagation(); setIsZoomed(false); }}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};