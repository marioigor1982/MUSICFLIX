
import React from 'react';
import type { Song } from '../types';
import MusicCard from './MusicCard';

interface MusicLibraryProps {
  songs: Song[];
  onPlay: (song: Song) => void;
  currentSong: Song | null;
  isPlaying: boolean;
}

const MusicLibrary: React.FC<MusicLibraryProps> = ({ songs, onPlay, currentSong, isPlaying }) => {
  return (
    <div className="px-4 sm:px-8 md:px-12 py-8">
      <h2 className="text-2xl font-bold mb-4">My Library</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
        {songs.map((song) => (
          <MusicCard 
            key={song.id}
            song={song}
            onPlay={onPlay}
            isPlaying={currentSong?.id === song.id && isPlaying}
          />
        ))}
      </div>
    </div>
  );
};

export default MusicLibrary;
