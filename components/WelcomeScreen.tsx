import React, { useState, useEffect } from 'react';
import { MusicNoteIcon, YouTubeIcon } from './icons';
import Logo from './Logo';

interface WelcomeScreenProps {
  onFilesAdded: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAddYouTubeClick: () => void;
}

const backgroundImages = [
  'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/1916824/pexels-photo-1916824.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/2240763/pexels-photo-2240763.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/96380/pexels-photo-96380.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/1587927/pexels-photo-1587927.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/210887/pexels-photo-210887.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/894156/pexels-photo-894156.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/2272854/pexels-photo-2272854.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/1485637/pexels-photo-1485637.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/1626481/pexels-photo-1626481.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/7524836/pexels-photo-7524836.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/3359734/pexels-photo-3359734.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/209948/pexels-photo-209948.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/2700582/pexels-photo-2700582.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/1370545/pexels-photo-1370545.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/3783471/pexels-photo-3783471.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/811838/pexels-photo-811838.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/1649691/pexels-photo-1649691.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/164743/pexels-photo-164743.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/1713953/pexels-photo-1713953.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/1246437/pexels-photo-1246437.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/154147/pexels-photo-154147.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/625644/pexels-photo-625644.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/3394660/pexels-photo-3394660.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/2111015/pexels-photo-2111015.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/196652/pexels-photo-196652.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/2147029/pexels-photo-2147029.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/1120162/pexels-photo-1120162.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/696644/pexels-photo-696644.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/45243/saxophone-music-instrument-gold-45243.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/3756766/pexels-photo-3756766.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/3587478/pexels-photo-3587478.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  'https://images.pexels.com/photos/3945659/pexels-photo-3945659.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
];


const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onFilesAdded, onAddYouTubeClick }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000); // Change image every 5 seconds
    return () => clearTimeout(timer);
  }, [currentImageIndex]);


  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-center p-4 overflow-hidden">
        {/* Background Image Slideshow */}
        <div className="absolute inset-0 w-full h-full">
            {backgroundImages.map((src, index) => (
            <img
                key={src}
                src={src}
                alt="Cinematic background"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
            />
            ))}
        </div>
      
        {/* Overlay */}
        <div className="absolute inset-0 w-full h-full bg-black/60"></div>

      <input
        type="file"
        multiple
        accept="audio/*"
        ref={fileInputRef}
        onChange={onFilesAdded}
        className="hidden"
      />
      {/* Content */}
      <div className="relative max-w-2xl bg-black/20 backdrop-blur-sm p-8 rounded-xl">
        <Logo className="w-full max-w-lg mx-auto mb-6" />
        <p className="text-lg md:text-xl text-gray-300 mb-8">
          Your personal music universe, reimagined. Upload local files or add from YouTube and watch as AI crafts unique artwork for every track.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
            onClick={handleButtonClick}
            className="bg-red-600 hover:bg-red-500 text-white font-bold text-lg py-3 px-8 rounded-md transition-transform duration-300 transform hover:scale-105"
            >
            Select Your Music
            </button>
             <button
                onClick={onAddYouTubeClick}
                className="bg-white hover:bg-gray-200 text-black font-bold text-lg py-3 px-8 rounded-md transition-transform duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
                <YouTubeIcon className="w-6 h-6 text-red-600"/>
                Add from YouTube
            </button>
        </div>
        <div className="mt-16 flex justify-center items-center space-x-4 text-gray-500">
            <MusicNoteIcon className="w-12 h-12" />
        </div>
        <p className="text-sm text-gray-600 mt-4">
            All files are processed locally in your browser. Nothing is uploaded to any server.
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;