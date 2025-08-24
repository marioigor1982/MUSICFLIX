import { GoogleGenAI, Type } from "@google/genai";
import type { Song } from '../types';

export interface YouTubeSearchResult {
  videoId: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
}

const API_KEY = process.env.API_KEY;

// Check if the API key is available. If not, log a warning.
if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled and placeholder content will be used.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });
const imageModel = 'imagen-3.0-generate-002';
const textModel = 'gemini-2.5-flash';

const getSongTitleForPrompt = (song: Song): string => {
  if (song.artist && song.artist.toLowerCase() !== 'unknown artist') {
    return `${song.name} by ${song.artist}`;
  }
  return song.name;
};

export const getYouTubeInfo = async (url: string): Promise<{ name: string, artist: string }> => {
    if (!API_KEY) return { name: 'YouTube Video', artist: 'From URL' };
    try {
        const prompt = `From this YouTube URL, what is the video title and the channel name? URL: ${url}`;
        const response = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: "The title of the YouTube video." },
                        artist: { type: Type.STRING, description: "The name of the YouTube channel." }
                    }
                }
            }
        });
        
        const jsonStr = response.text.trim();
        const jsonResponse = JSON.parse(jsonStr);
        return jsonResponse;

    } catch (error) {
        console.error("Error getting YouTube info:", error);
        return { name: 'YouTube Video', artist: 'Unknown Artist' };
    }
};

export const searchYouTube = async (query: string): Promise<YouTubeSearchResult[]> => {
    if (!API_KEY) return [];
    try {
        const prompt = `Search for music videos on YouTube for the query: "${query}". Provide up to 8 relevant results. Include official music videos if possible.`;
        const response = await ai.models.generateContent({
            model: textModel,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            videoId: { type: Type.STRING, description: "The unique YouTube video ID." },
                            title: { type: Type.STRING, description: "The title of the YouTube video." },
                            artist: { type: Type.STRING, description: "The name of the artist or YouTube channel." },
                            thumbnailUrl: { type: Type.STRING, description: "A URL for the video's high-quality thumbnail image, specifically using 'https://i.ytimg.com/vi/VIDEO_ID/hqdefault.jpg'." }
                        },
                        required: ["videoId", "title", "artist", "thumbnailUrl"]
                    }
                }
            }
        });
        
        const jsonStr = response.text.trim();
        const jsonResponse = JSON.parse(jsonStr);
        return Array.isArray(jsonResponse) ? jsonResponse : [];

    } catch (error) {
        console.error("Error searching YouTube videos with Gemini:", error);
        return [];
    }
};


export const generateArtwork = async (song: Song): Promise<string> => {
  if (!API_KEY) return `https://picsum.photos/seed/${song.id}/500/500`;
  try {
    const songTitle = getSongTitleForPrompt(song);
    const prompt = `Cinematic, atmospheric album cover art for the song "${songTitle}". Abstract digital painting, moody, rich colors, no text.`;
    
    const response = await ai.models.generateImages({
        model: imageModel,
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    return `https://picsum.photos/seed/${song.id}/500/500`;
  } catch (error) {
    console.error("Error generating artwork:", error);
    return `https://picsum.photos/seed/error_${song.id}/500/500`;
  }
};

export const generateDescription = async (song: Song): Promise<string> => {
   if (!API_KEY) return "Explore your personal soundscape. Add your local music library to begin the experience.";
  try {
    const songTitle = getSongTitleForPrompt(song);
    const prompt = `Write a short, dramatic, one-sentence description for the song titled "${songTitle}". Make it sound like a movie summary on a streaming service like Netflix.`;
    
    const response = await ai.models.generateContent({
        model: textModel,
        contents: prompt,
        config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating description:", error);
    return "An epic journey of sound and emotion awaits.";
  }
};