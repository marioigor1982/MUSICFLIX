

import React, { useEffect, useState } from 'react';
import type { Song } from '../types';
import { PlayIcon, PauseIcon, SkipNextIcon, SkipPreviousIcon, VolumeUpIcon, VolumeOffIcon, SpinnerIcon } from './icons';

interface PlayerProps {
  song: Song | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (value: number) => void;
  onVolumeChange: (value: number) => void;
  initialVolume: number;
}

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return '0:00';
  const flooredSeconds = Math.floor(seconds);
  const min = Math.floor(flooredSeconds / 60);
  const sec = flooredSeconds % 60;
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};

const Player: React.FC<PlayerProps> = ({ song, isPlaying, progress, duration, onPlayPause, onNext, onPrev, onSeek, onVolumeChange, initialVolume }) => {
  const [volume, setVolume] = useState(initialVolume);
  const [isMuted, setIsMuted] = useState(false);
  const artworkUrl = song?.artwork || `https://picsum.photos/seed/${song?.id}/80/80`;

  useEffect(() => {
      onVolumeChange(isMuted ? 0 : volume);
  }, [volume, isMuted, onVolumeChange]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSeek(Number(e.target.value));
  };
  
  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if(newVolume > 0) setIsMuted(false);
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  

  if (!song) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-gray-800/95 backdrop-blur-sm shadow-2xl z-50 flex items-center px-4">
      <div className="flex items-center w-1/4">
        {song.isGenerating ? (
            <div className="w-16 h-16 bg-gray-700 rounded-md flex items-center justify-center">
                <SpinnerIcon className="w-6 h-6"/>
            </div>
        ) : (
            <img src={artworkUrl} alt={song.name} className="w-16 h-16 object-cover rounded-md" />
        )}
        <div className="ml-4">
          <p className="font-bold text-white truncate w-32 md:w-64">{song.name}</p>
          <p className="text-sm text-gray-400 truncate w-32 md:w-64">{song.artist}</p>
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-center w-2/4">
        <div className="flex items-center gap-4">
          <button onClick={onPrev} className="text-gray-400 hover:text-white transition-colors"><SkipPreviousIcon className="w-7 h-7" /></button>
          <button onClick={onPlayPause} className="w-12 h-12 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition-transform">
            {isPlaying ? <PauseIcon className="w-7 h-7" /> : <PlayIcon className="w-7 h-7" />}
          </button>
          <button onClick={onNext} className="text-gray-400 hover:text-white transition-colors"><SkipNextIcon className="w-7 h-7" /></button>
        </div>
        <div className="flex items-center gap-2 w-full max-w-lg mt-1">
          <span className="text-xs text-gray-400">{formatTime(progress)}</span>
          <input type="range" min="0" max={duration} value={progress} onChange={handleSeek} className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer range-sm" />
          <span className="text-xs text-gray-400">{formatTime(duration)}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-end w-1/4">
        <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
          {isMuted || volume === 0 ? <VolumeOffIcon className="w-6 h-6" /> : <VolumeUpIcon className="w-6 h-6" />}
        </button>
        <input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onChange={handleVolume} className="w-24 h-1 ml-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-sm" />
      </div>
    </div>
  );
};

export default Player;