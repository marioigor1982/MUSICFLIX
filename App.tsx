import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Song } from './types';
import { getYouTubeInfo, generateArtwork, generateDescription } from './services/geminiService';
import Header from './components/Header';
import WelcomeScreen from './components/WelcomeScreen';
import Hero from './components/Hero';
import MusicLibrary from './components/MusicLibrary';
import YouTubeModal from './components/YouTubeModal';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const App: React.FC = () => {
    const [songs, setSongs] = useState<Song[]>([]);
    const [currentSongIndex, setCurrentSongIndex] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.75);
    const [ytPlayer, setYtPlayer] = useState<any>(null);
    const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);
    const [isAddingYouTubeUrl, setIsAddingYouTubeUrl] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);
    const progressIntervalRef = useRef<number | null>(null);
    const heroPlayerContainerRef = useRef<HTMLDivElement>(null);
    const hiddenPlayerContainerRef = useRef<HTMLDivElement>(null);

    const currentSong = currentSongIndex !== null ? songs[currentSongIndex] : null;
    const heroSong = currentSong ?? (songs.length > 0 ? songs[0] : null);

    const extractYouTubeID = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    useEffect(() => {
        const setupYtPlayer = () => {
            if (window.YT && window.YT.Player) {
                const player = new window.YT.Player('youtube-player', {
                    height: '100%',
                    width: '100%',
                    playerVars: { 
                        'playsinline': 1,
                        'controls': 0,
                        'showinfo': 0,
                        'rel': 0,
                        'modestbranding': 1,
                        'autoplay': 1,
                        'mute': 1,
                    },
                    events: {
                        onReady: (event: any) => {
                            event.target.setVolume(volume * 100);
                            setYtPlayer(event.target);
                        },
                        onStateChange: onPlayerStateChange,
                    }
                });
            }
        };

        if (!window.YT) {
            window.onYouTubeIframeAPIReady = setupYtPlayer;
        } else {
            setupYtPlayer();
        }

        return () => {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, []);
    
    useEffect(() => {
        const heroContainer = heroPlayerContainerRef.current;
        const hiddenContainer = hiddenPlayerContainerRef.current;
        const playerIframe = ytPlayer?.getIframe();

        if (!playerIframe || !hiddenContainer) return;
        
        const ytPlayerWrapper = hiddenContainer.querySelector('#youtube-player-wrapper');

        if (heroSong?.type === 'youtube' && heroContainer) {
            if (playerIframe.parentElement !== heroContainer) {
                heroContainer.appendChild(playerIframe);
            }
        } else {
            if (ytPlayerWrapper && playerIframe.parentElement !== ytPlayerWrapper) {
                ytPlayerWrapper.appendChild(playerIframe);
            }
        }
    }, [heroSong, ytPlayer]);


    const onPlayerStateChange = (event: any) => {
        if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            setDuration(ytPlayer.getDuration());
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = window.setInterval(() => {
                setProgress(ytPlayer.getCurrentTime());
            }, 250);
        } else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        } else if (event.data === window.YT.PlayerState.ENDED) {
            if (currentSong?.id === heroSong?.id && currentSong.type === 'youtube' && ytPlayer) {
                ytPlayer.playVideo(); // Replay the video from the start to loop
            } else {
                playNext();
            }
        }
    };

    const parseFileName = (fileName: string) => {
        let name = fileName.replace(/\.[^/.]+$/, "");
        let artist = "Unknown Artist";
        const parts = name.split(' - ');
        if (parts.length > 1) {
            artist = parts[0].trim();
            name = parts[1].trim();
        }
        return { name, artist };
    };

    const handleFilesAdded = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const newSongs: Song[] = Array.from(files).map(file => {
            const { name, artist } = parseFileName(file.name);
            return {
                id: `${file.name}-${file.lastModified}-${file.size}`,
                file,
                name,
                artist,
                url: URL.createObjectURL(file),
                isGenerating: true,
                type: 'local',
            };
        });

        setSongs(prevSongs => [...prevSongs, ...newSongs]);
    };
    
     const handleAddYouTubeUrl = async (url: string) => {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
        if (!youtubeRegex.test(url)) {
            alert("Please enter a valid YouTube URL.");
            return;
        }

        setIsAddingYouTubeUrl(true);
        try {
            const videoId = extractYouTubeID(url);
            if (!videoId) {
                alert("Could not extract video ID from URL.");
                setIsAddingYouTubeUrl(false);
                return;
            }
            const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            const videoInfo = await getYouTubeInfo(url);
            const newSong: Song = {
                id: `yt-${new Date().getTime()}`,
                url: url,
                name: videoInfo.name,
                artist: videoInfo.artist,
                type: 'youtube',
                isGenerating: true,
                artwork: thumbnail,
            };
            
            setSongs(prevSongs => [...prevSongs, newSong]);
            setIsYouTubeModalOpen(false);

        } catch (error) {
            console.error("Failed to add YouTube URL", error);
        } finally {
            setIsAddingYouTubeUrl(false);
        }
    };

    useEffect(() => {
        const songToProcess = songs.find(s => s.isGenerating);

        if (songToProcess) {
            const processSong = async () => {
                try {
                    const [artwork, description] = await Promise.all([
                        generateArtwork(songToProcess),
                        generateDescription(songToProcess)
                    ]);
                     setSongs(prevSongs => prevSongs.map(s => 
                        s.id === songToProcess.id 
                        ? { ...s, artwork, description, isGenerating: false } 
                        : s
                    ));
                } catch(error) {
                    console.error(`Failed to process song: ${songToProcess.name}`, error);
                    // Mark as not generating even if it fails to prevent getting stuck
                    setSongs(prevSongs => prevSongs.map(s => 
                        s.id === songToProcess.id ? { ...s, isGenerating: false } : s
                    ));
                }
            };
            processSong();
        }
    }, [songs]);

    useEffect(() => {
        if (!currentSong) return;

        if (currentSong.type === 'local') {
            ytPlayer?.pauseVideo();
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

            if (audioRef.current) {
                if(audioRef.current.src !== currentSong.url) audioRef.current.src = currentSong.url;
                isPlaying ? audioRef.current.play().catch(e => console.error("Audio play error", e)) : audioRef.current.pause();
            }
        } else if (currentSong.type === 'youtube' && ytPlayer) {
            audioRef.current?.pause();
            const videoId = extractYouTubeID(currentSong.url);
            if (!videoId) return;

            const currentYtVideoId = ytPlayer.getVideoData ? ytPlayer.getVideoData().video_id : null;
            if (currentYtVideoId !== videoId) {
                ytPlayer.loadVideoById(videoId);
            } else {
                 isPlaying ? ytPlayer.playVideo() : ytPlayer.pauseVideo();
            }
        }
    }, [currentSong, isPlaying, ytPlayer]);


    const handlePlaySong = useCallback((songToPlay: Song) => {
        const songIndex = songs.findIndex(s => s.id === songToPlay.id);
        if (songIndex !== -1) {
            if(currentSongIndex === songIndex) {
                 setIsPlaying(prev => !prev);
            } else {
                setCurrentSongIndex(songIndex);
                setIsPlaying(true);
            }
        }
    }, [songs, currentSongIndex]);

    const handleHeroPlayPause = useCallback(() => {
        if (!heroSong) return;

        const heroSongIndex = songs.findIndex(s => s.id === heroSong.id);
        if (heroSongIndex === -1) return;

        if (currentSong?.id === heroSong.id) {
            setIsPlaying(p => !p);
        } else {
            setCurrentSongIndex(heroSongIndex);
            setIsPlaying(true);
        }
    }, [currentSong, songs, heroSong]);
    
    const playNext = useCallback(() => {
        if (songs.length === 0) return;
        const nextIndex = (currentSongIndex ?? -1) + 1;
        setCurrentSongIndex(nextIndex % songs.length);
        setIsPlaying(true);
    }, [currentSongIndex, songs.length]);
    
    const playPrev = useCallback(() => {
        if (songs.length === 0) return;
        const prevIndex = (currentSongIndex ?? 0) - 1;
        setCurrentSongIndex((prevIndex + songs.length) % songs.length);
        setIsPlaying(true);
    }, [currentSongIndex, songs.length]);

    const handleSeek = (value: number) => {
        if (!currentSong) return;
        if (currentSong.type === 'local' && audioRef.current) {
            audioRef.current.currentTime = value;
        } else if (currentSong.type === 'youtube' && ytPlayer) {
            ytPlayer.seekTo(value, true);
        }
        setProgress(value);
    };
    
    const handleVolumeChange = (value: number) => {
        if (audioRef.current) audioRef.current.volume = value;
        if (ytPlayer?.setVolume) {
             if (value > 0 && ytPlayer.isMuted()) {
                ytPlayer.unMute();
            } else if (value === 0 && !ytPlayer.isMuted()) {
                ytPlayer.mute();
            }
            ytPlayer.setVolume(value * 100);
        }
        setVolume(value);
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        
        const onTimeUpdate = () => currentSong?.type === 'local' && setProgress(audio.currentTime);
        const onLoadedMetadata = () => currentSong?.type === 'local' && setDuration(audio.duration);
        const onEnded = () => currentSong?.type === 'local' && playNext();

        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('loadedmetadata', onLoadedMetadata);
        audio.addEventListener('ended', onEnded);
        
        return () => {
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
            audio.removeEventListener('ended', onEnded);
        };
    }, [currentSong, playNext]);

    return (
        <div className="min-h-screen">
            <div ref={hiddenPlayerContainerRef} className="fixed -z-20 top-[-9999px] left-[-9999px]">
                <div id="youtube-player-wrapper">
                    <div id="youtube-player"></div>
                </div>
            </div>
            <audio ref={audioRef} />
             <YouTubeModal 
                isOpen={isYouTubeModalOpen} 
                onClose={() => setIsYouTubeModalOpen(false)} 
                onAdd={handleAddYouTubeUrl}
                isAdding={isAddingYouTubeUrl}
            />
            
            {songs.length === 0 ? (
                <WelcomeScreen onFilesAdded={handleFilesAdded} onAddYouTubeClick={() => setIsYouTubeModalOpen(true)} />
            ) : (
                <>
                    <Header onFilesAdded={handleFilesAdded} onAddYouTubeClick={() => setIsYouTubeModalOpen(true)} />
                    <main>
                        <Hero 
                            song={heroSong}
                            isPlaying={currentSong?.id === heroSong?.id ? isPlaying : false}
                            progress={currentSong?.id === heroSong?.id ? progress : 0}
                            duration={currentSong?.id === heroSong?.id ? duration : 0}
                            onPlayPause={handleHeroPlayPause}
                            onSeek={handleSeek}
                            onVolumeChange={handleVolumeChange}
                            initialVolume={volume}
                            playerContainerRef={heroPlayerContainerRef}
                        />
                        <MusicLibrary 
                            songs={songs} 
                            onPlay={handlePlaySong} 
                            currentSong={currentSong}
                            isPlaying={isPlaying}
                        />
                    </main>
                </>
            )}
        </div>
    );
};

export default App;