import React, { useState, useEffect } from 'react';
import { YouTubeSearchResult, searchYouTube } from '../services/geminiService';
import { SpinnerIcon } from './icons';

interface YouTubeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (url: string) => void;
    isAdding: boolean;
}

const YouTubeModal: React.FC<YouTubeModalProps> = ({ isOpen, onClose, onAdd, isAdding }) => {
    const [view, setView] = useState<'search' | 'url'>('search');
    const [query, setQuery] = useState('');
    const [url, setUrl] = useState('');
    const [results, setResults] = useState<YouTubeSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && view === 'search') {
            // timeout to allow modal to render before focusing
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [isOpen, view]);

    if (!isOpen) return null;

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setIsSearching(true);
        setResults([]);
        try {
            const searchResults = await searchYouTube(query);
            setResults(searchResults);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setIsSearching(false);
        }
    };
    
    const handleAddFromSearch = (result: YouTubeSearchResult) => {
        if (isAdding) return;
        const videoUrl = `https://www.youtube.com/watch?v=${result.videoId}`;
        onAdd(videoUrl);
    };

    const handleAddFromUrl = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
            onAdd(url);
        }
    };

    const handleClose = () => {
        if (isAdding) return;
        setQuery('');
        setUrl('');
        setResults([]);
        setIsSearching(false);
        onClose();
    };

    const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
        <button
            onClick={onClick}
            disabled={isAdding}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
                active ? 'text-white border-b-2 border-red-500' : 'text-gray-400 hover:text-white'
            }`}
        >
            {children}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in" style={{ animationDuration: '0.3s'}} onClick={handleClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">Add Music from YouTube</h2>
                </div>

                <div className="flex border-b border-gray-700 px-6">
                    <TabButton active={view === 'search'} onClick={() => setView('search')}>Search</TabButton>
                    <TabButton active={view === 'url'} onClick={() => setView('url')}>Add from URL</TabButton>
                </div>

                {view === 'search' && (
                    <div className="p-6">
                        <form onSubmit={handleSearch}>
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Search for a song or artist..."
                                className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                                disabled={isAdding || isSearching}
                            />
                        </form>
                        <div className="mt-4 h-80 overflow-y-auto pr-2">
                             {isSearching && (
                                <div className="flex justify-center items-center h-full">
                                    <SpinnerIcon className="w-8 h-8 text-gray-400" />
                                </div>
                            )}
                            {!isSearching && results.length === 0 && (
                                <div className="flex justify-center items-center h-full text-gray-500">
                                    <p>Search results will appear here.</p>
                                </div>
                            )}
                            <ul className="space-y-3">
                                {results.map(result => (
                                    <li key={result.videoId} onClick={() => handleAddFromSearch(result)} className={`flex items-center gap-4 p-2 rounded-md transition-colors ${isAdding ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-700'}`}>
                                        <img src={result.thumbnailUrl} alt={result.title} className="w-24 h-16 object-cover rounded-md flex-shrink-0" />
                                        <div className="overflow-hidden">
                                            <p className="text-white font-semibold truncate">{result.title}</p>
                                            <p className="text-sm text-gray-400 truncate">{result.artist}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
                
                {view === 'url' && (
                    <div className="p-6">
                        <form onSubmit={handleAddFromUrl}>
                             <input
                                type="text"
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                placeholder="Paste YouTube URL here"
                                className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                                disabled={isAdding}
                                autoFocus
                            />
                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={handleClose} disabled={isAdding} className="py-2 px-4 text-gray-300 hover:text-white rounded-md transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={!url.trim() || isAdding} className="py-2 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                                    {isAdding ? 'Adding...' : 'Add Song'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

            </div>
        </div>
    );
};

export default YouTubeModal;
