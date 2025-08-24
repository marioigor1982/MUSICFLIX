
import React from 'react';
import type { Song } from '../types';
import { MusicNoteIcon, PlayIcon, SpinnerIcon } from './icons';

interface MusicCardProps {
  song: Song;
  onPlay: (song: Song) => void;
  isPlaying: boolean;
}

const MusicCard: React.FC<MusicCardProps> = ({ song, onPlay, isPlaying }) => {
  const artworkUrl = song.artwork || `https://picsum.photos/seed/${song.id}/400/400`;

  return (
    <div className="group relative rounded-lg overflow-hidden shadow-lg cursor-pointer bg-gray-800 transform hover:-translate-y-1 transition-all duration-300" onClick={() => onPlay(song)}>
      <div className="aspect-w-1 aspect-h-1 w-full">
        {song.isGenerating ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-700 animate-pulse">
                <SpinnerIcon className="w-10 h-10 text-gray-400" />
            </div>
        ) : (
            <img src={artworkUrl} alt={song.name} className="w-full h-full object-cover" />
        )}
      </div>
      
      <div className={`absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        {isPlaying ? (
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                <MusicNoteIcon className="w-8 h-8 text-white animate-pulse" />
            </div>
        ) : (
            <div className="w-16 h-16 bg-red-600 bg-opacity-80 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <PlayIcon className="w-8 h-8 text-white" />
            </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/70 to-transparent">
        <h3 className="font-bold text-white truncate">{song.name}</h3>
        <p className="text-sm text-gray-400 truncate">{song.artist}</p>
      </div>
    </div>
  );
};

export default MusicCard;
