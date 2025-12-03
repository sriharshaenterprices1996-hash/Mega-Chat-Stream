import { GoogleGenAI, Type } from "@google/genai";
import { Message, GeneratedOutfit } from "../types";

// Initialize the Google GenAI client with the API key from the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Sends a chat message to the Gemini model and returns the response.
 */
export const sendChatMessage = async (history: Message[], newMessage: string): Promise<string> => {
  if (!process.env.API_KEY) {
      console.warn("API Key is missing in process.env.API_KEY");
      return "Error: API Key is not configured.";
  }

  try {
    const recentHistory = history.slice(-10);
    const contents = [
      ...recentHistory.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      })),
      { role: 'user', parts: [{ text: newMessage }] }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: "You are a helpful, witty, and concise AI assistant in a social chat application called 'Mega Chat'. Keep responses relatively short and conversational.",
      },
    });

    return response.text || "I'm speechless!";

  } catch (error) {
    console.error("Chat API Error:", error);
    return "Sorry, I'm having trouble connecting to the AI service right now.";
  }
};

/**
 * Analyzes an uploaded clothing image and generates 3 outfit suggestions.
 */
export const generateOutfitOptions = async (base64Image: string): Promise<GeneratedOutfit[]> => {
  if (!process.env.API_KEY) {
    throw new Error("No API Key configured");
  }

  try {
    const match = base64Image.match(/^data:(.+);base64,(.+)$/);
    if (!match) throw new Error("Invalid image data");
    const mimeType = match[1];
    const data = match[2];

    // Step 1: Analyze and Generate Descriptions for 3 Looks
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType, data } },
          { text: "Act as a professional fashion stylist. Analyze the clothing item in this image. Create 3 distinct outfit options featuring this item: 1) Casual Day Out, 2) Business/Professional, and 3) Night Out/Party. For each, provide a catchy title, a description of the matching pieces (shoes, accessories, etc.), and a visual prompt that describes a flat-lay photography composition of the complete outfit." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ['Casual', 'Business', 'Night Out'] },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              visual_prompt: { type: Type.STRING }
            }
          }
        }
      }
    });

    const options = JSON.parse(response.text || "[]");
    
    // Step 2: Generate Visualizations (in parallel)
    // We use the original image + the visual prompt to generate the outfit visualization
    const outfitsWithImages = await Promise.all(options.map(async (opt: any) => {
        try {
            const visualPrompt = `Flat-lay fashion photography of a complete outfit. ${opt.visual_prompt}. High quality, white background, clean composition.`;
            
            const imgResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                         { inlineData: { mimeType, data } }, // Reference the original item
                         { text: visualPrompt }
                    ]
                }
            });

            let imageUrl = '';
            for (const part of imgResponse.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    imageUrl = `data:image/png;base64,${part.inlineData.data}`;
                    break;
                }
            }

            return {
                type: opt.type,
                title: opt.title,
                description: opt.description,
                imageUrl: imageUrl || base64Image // Fallback to original if gen fails
            };

        } catch (e) {
            console.error(`Failed to generate image for ${opt.type}`, e);
            return {
                type: opt.type,
                title: opt.title,
                description: opt.description,
                imageUrl: base64Image // Fallback
            };
        }
    }));

    return outfitsWithImages;

  } catch (error) {
    console.error("Outfit Generation Error:", error);
    throw new Error("Failed to generate outfits");
  }
};

/**
 * Generates an App Icon using Imagen.
 */
export const generateAppIcon = async (prompt: string): Promise<string> => {
  if (!process.env.API_KEY) throw new Error("No API Key configured");

  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `App icon design, modern UI, vector style, rounded corners, high quality, minimal, ${prompt}`,
      config: {
        numberOfImages: 1,
        aspectRatio: '1:1',
        outputMimeType: 'image/jpeg',
      },
    });

    const imageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${imageBytes}`;

  } catch (error) {
    console.error("Icon Generation Error:", error);
    throw new Error("Failed to generate icon");
  }
};

/**
 * Generates a short AI video/animation using Veo.
 */
export const generateAiVideo = async (prompt: string): Promise<string> => {
    if (!process.env.API_KEY) throw new Error("No API Key configured");

    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!videoUri) throw new Error("No video URI returned");

        const vidResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
        const blob = await vidResponse.blob();
        return URL.createObjectURL(blob);

    } catch (error) {
        console.error("Video Gen Error:", error);
        throw new Error("Failed to generate video");
    }
};

/**
 * Generates a styled avatar from a source image.
 */
export const generateStyledAvatar = async (base64Image: string, style: string): Promise<string> => {
    if (!process.env.API_KEY) throw new Error("No API Key configured");

    try {
        const match = base64Image.match(/^data:(.+);base64,(.+)$/);
        if (!match) throw new Error("Invalid image data");
        const mimeType = match[1];
        const data = match[2];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image', 
            contents: {
                parts: [
                    { inlineData: { mimeType, data } },
                    { text: `Transform this person into a ${style} style avatar. Keep the facial features recognizable but apply the artistic style strongly. High quality, white background, square aspect ratio.` }
                ]
            }
        });

        let imageBase64 = '';
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                imageBase64 = part.inlineData.data;
                return `data:image/png;base64,${imageBase64}`;
            }
        }
        
        throw new Error("Model did not return an image.");

    } catch (error) {
        console.error("Avatar Gen Error:", error);
        throw new Error("Failed to generate avatar");
    }
};