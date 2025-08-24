export interface Song {
  id: string;
  file?: File;
  name: string;
  artist: string;
  url: string;
  artwork?: string;
  description?: string;
  isGenerating?: boolean;
  type: 'local' | 'youtube';
}