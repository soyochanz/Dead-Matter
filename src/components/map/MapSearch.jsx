import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

const MapSearch = ({ markers, onLocationSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        const filtered = markers.filter(m =>
            m.title.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
        setIsOpen(true);
    }, [query, markers]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (marker) => {
        setQuery(marker.title);
        setIsOpen(false);
        onLocationSelect(marker);
    };

    return (
        <div ref={wrapperRef} className="relative w-full max-w-[500px]">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/15 rounded-xl px-4 py-2 transition-all hover:bg-[#14161c90] hover:border-white/25 hover:shadow-lg">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search locations..."
                    className="flex-1 h-9 bg-transparent border-none outline-none text-white text-[15px] font-medium placeholder-gray-400"
                    onFocus={() => query && setIsOpen(true)}
                />
                <button
                    className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg text-white transition-all hover:bg-red-500 hover:scale-110"
                    onClick={() => {
                        // Could trigger search or clear functionality
                        if (query) {
                            const match = markers.find(m => m.title.toLowerCase().includes(query.toLowerCase()));
                            if (match) handleSelect(match);
                        }
                    }}
                >
                    <Search size={18} />
                </button>
            </div>

            {isOpen && results.length > 0 && (
                <ul className="absolute top-full left-0 right-0 mt-2 bg-[#0e1116f2] backdrop-blur-xl border border-white/15 rounded-xl py-2 shadow-2xl z-[5000] max-h-64 overflow-y-auto custom-scrollbar">
                    {results.map((marker, idx) => (
                        <li
                            key={marker.id || idx}
                            onClick={() => handleSelect(marker)}
                            className="px-4 py-3 cursor-pointer text-white font-medium hover:bg-red-500 transition-colors"
                        >
                            {marker.title}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MapSearch;
