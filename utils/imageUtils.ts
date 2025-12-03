/**
 * Converts an SVG Data URI to a PNG Data URI using an HTML Canvas.
 * This is necessary because many AI vision models (including Gemini) do not support SVG input directly.
 * 
 * @param svgDataUrl The base64 data URI of the SVG
 * @param size The target dimension (width/height) for the square output image (default: 512px)
 * @returns Promise resolving to the PNG base64 data URI
 */
export const convertSvgToPng = (svgDataUrl: string, size: number = 512): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // 1. Fill with white background
      // (Transparent backgrounds can sometimes cause issues with vision models depending on how they interpret alpha)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 2. Draw the SVG centered with some padding
      const padding = size * 0.2; // 20% padding
      const drawSize = size - (padding * 2);
      
      try {
        ctx.drawImage(img, padding, padding, drawSize, drawSize);
        // 3. Export as PNG
        const pngDataUrl = canvas.toDataURL('image/png');
        resolve(pngDataUrl);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = (err) => {
      reject(new Error(`Failed to load SVG image: ${err}`));
    };
    
    img.src = svgDataUrl;
  });
};