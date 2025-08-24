import React, { useState, useEffect } from 'react';
import { UploadIcon, YouTubeIcon, SearchIcon, BellIcon, CaretDownIcon } from './icons';
import Logo from './Logo';

interface HeaderProps {
  onFilesAdded: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAddYouTubeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onFilesAdded, onAddYouTubeClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleAddMusicClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 p-4 sm:px-8 md:px-12 flex justify-between items-center transition-all duration-500 ${scrolled ? 'bg-[#141414]' : 'bg-gradient-to-b from-black/70 to-transparent'}`}>
      <div className="flex items-center gap-8">
        <Logo className="h-7 sm:h-8 w-auto" />
        <nav className="hidden lg:flex items-center gap-4">
          <a href="#" className="text-white font-semibold text-sm hover:text-gray-300 transition-colors">Home</a>
          <a href="#" className="text-white text-sm hover:text-gray-300 transition-colors">My Library</a>
          <a href="#" className="text-white text-sm hover:text-gray-300 transition-colors">Trending</a>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <input
          type="file"
          multiple
          accept="audio/*"
          ref={fileInputRef}
          onChange={onFilesAdded}
          className="hidden"
        />
        <button onClick={handleAddMusicClick} aria-label="Add local music" className="text-white hover:text-gray-300 transition-colors"><UploadIcon className="w-6 h-6"/></button>
        <button onClick={onAddYouTubeClick} aria-label="Add music from YouTube" className="text-red-500 hover:text-red-400 transition-colors"><YouTubeIcon className="w-7 h-7"/></button>
        
        <button aria-label="Search" className="text-white hover:text-gray-300 transition-colors hidden sm:block"><SearchIcon className="w-6 h-6"/></button>
        <button aria-label="Notifications" className="text-white hover:text-gray-300 transition-colors hidden sm:block"><BellIcon className="w-6 h-6"/></button>
        <div className="flex items-center gap-2 cursor-pointer">
            <img src={`https://i.pravatar.cc/150?u=musicflix-user`} alt="profile" className="w-8 h-8 rounded-md" />
            <CaretDownIcon className="w-5 h-5 text-white hidden md:block"/>
        </div>
      </div>
    </header>
  );
};

export default Header;
