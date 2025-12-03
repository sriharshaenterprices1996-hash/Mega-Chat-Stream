import React, { useCallback, useState } from 'react';

interface UploaderProps {
  onImageSelected: (base64: string) => void;
}

export const Uploader: React.FC<UploaderProps> = ({ onImageSelected }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) onImageSelected(result);
    };
    reader.readAsDataURL(file);
  }, [onImageSelected]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`
        relative group border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 cursor-pointer
        ${isDragging ? 'border-brand-800 bg-brand-50' : 'border-brand-300 hover:border-brand-800 hover:bg-white'}
      `}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input 
        type="file" 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        accept="image/*"
        onChange={onInputChange}
      />
      
      <div className="flex flex-col items-center pointer-events-none relative z-0">
        <div className={`
          w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mb-6 text-brand-800
          transition-transform duration-300 group-hover:scale-110 group-hover:bg-brand-200
        `}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="font-serif text-2xl text-brand-900 mb-2">Upload your item</h3>
        <p className="text-brand-800 opacity-60 max-w-xs mx-auto mb-6">
          Drag and drop a clear photo of your clothing item, or click to browse.
        </p>
        <span className="px-6 py-2.5 bg-brand-900 text-white rounded-full font-medium shadow-lg group-hover:bg-brand-800 transition-colors">
            Select Image
        </span>
      </div>
    </div>
  );
};