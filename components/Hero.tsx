import React, { useEffect, useState } from 'react';
import type { Song } from '../types';
import { SpinnerIcon, PlayIcon, PauseIcon, InfoIcon, VolumeUpIcon, VolumeOffIcon } from './icons';

interface HeroProps {
  song: Song | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  onPlayPause: () => void;
  onSeek: (value: number) => void;
  onVolumeChange: (value: number) => void;
  initialVolume: number;
  playerContainerRef: React.RefObject<HTMLDivElement>;
}

const Hero: React.FC<HeroProps> = ({ song, isPlaying, progress, duration, onPlayPause, onSeek, onVolumeChange, initialVolume, playerContainerRef }) => {
  const [volume, setVolume] = useState(initialVolume);
  const [isMuted, setIsMuted] = useState(initialVolume === 0);

  useEffect(() => {
    onVolumeChange(isMuted ? 0 : volume);
  }, [volume, isMuted, onVolumeChange]);

  const toggleMute = () => {
    if (isMuted && volume === 0) {
        setVolume(0.5);
        setIsMuted(false);
    } else {
        setIsMuted(!isMuted);
    }
  };
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSeek(Number(e.target.value));
  };

  if (!song) {
    return <div className="h-[75vh] min-h-[500px] max-h-[800px] w-full bg-gray-900/50"></div>;
  }

  const artworkUrl = song.artwork || `https://picsum.photos/seed/${song.id}/1600/900`;
  const progressBarPercentage = duration > 0 ? (progress / duration) * 100 : 0;
  const isYouTube = song.type === 'youtube';

  return (
    <div className="relative w-full h-[75vh] min-h-[500px] max-h-[800px] text-white">
      <div className="absolute inset-0 overflow-hidden">
        {isYouTube ? (
            <div ref={playerContainerRef} className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full" />
        ) : (
            <img src={artworkUrl} alt={song.name} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent"></div>
      </div>
      
      <div className="relative h-full flex flex-col justify-center p-4 sm:p-8 md:p-12">
        <div className="w-full md:w-1/2 lg:w-2/5">
            <h2 className="text-4xl md:text-6xl font-extrabold text-white shadow-lg tracking-tight animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {song.name}
            </h2>
            <h3 className="text-xl md:text-2xl text-gray-300 shadow-md mt-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {song.artist}
            </h3>
            <div className="mt-4 max-w-lg animate-fade-in" style={{ animationDelay: '0.6s' }}>
                {song.isGenerating ? (
                    <div className="flex items-center gap-2 text-gray-400">
                        <SpinnerIcon className="w-5 h-5"/>
                        <span>Generating AI description...</span>
                    </div>
                ) : (
                    <p className="text-gray-200 line-clamp-3 text-shadow">"{song.description}"</p>
                )}
            </div>
            <div className="flex items-center gap-3 mt-8 animate-fade-in" style={{ animationDelay: '0.8s' }}>
                <button onClick={onPlayPause} className="flex items-center justify-center gap-2 bg-white text-black font-bold py-2.5 px-8 rounded-md hover:bg-gray-300 transition-colors text-lg">
                    {isPlaying ? <PauseIcon className="w-6 h-6"/> : <PlayIcon className="w-6 h-6" />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
                <button className="flex items-center justify-center gap-2 bg-white/30 backdrop-blur-sm text-white font-bold py-2.5 px-8 rounded-md hover:bg-white/40 transition-colors text-lg">
                    <InfoIcon className="w-6 h-6"/>
                    <span>More Info</span>
                </button>
            </div>
        </div>
      </div>

      <div className="absolute right-0 bottom-24 flex items-center gap-4 p-4 sm:p-8 md:p-12">
            <button onClick={toggleMute} aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"} className="border-2 border-white/40 rounded-full w-10 h-10 flex items-center justify-center hover:border-white transition-colors">
                {isMuted || volume === 0 ? <VolumeOffIcon className="w-5 h-5" /> : <VolumeUpIcon className="w-5 h-5" />}
            </button>
            <div className="bg-black/50 border border-white/40 px-2 py-1 text-sm">
                AI-G
            </div>
      </div>
      
      {isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-8 flex items-end">
            <div className="w-full px-4 sm:px-8 md:px-12 pb-2">
                <input 
                    type="range" 
                    min="0" 
                    max={duration || 100} 
                    value={progress} 
                    onChange={handleSeek} 
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer range-sm group"
                    style={{'--progress-percentage': `${progressBarPercentage}%`} as React.CSSProperties}
                />
            </div>
        </div>
      )}
    </div>
  );
};

export default Hero;