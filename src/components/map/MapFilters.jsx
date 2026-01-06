import React from 'react';
import { X, Filter, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MapFilters = ({ categories, activeFilters, onToggleFilter, isOpen, onClose }) => {

    // Helper for group order and aesthetic metadata
    const groupMetadata = {
        'landmarks': { label: 'Landmarks', icon: '🗺️', color: 'text-amber-400' },
        'military': { label: 'Military', icon: '🎯', color: 'text-red-500' },
        'industrial': { label: 'Industrial', icon: '🏭', color: 'text-orange-500' },
        'civilian': { label: 'Civilian', icon: '🏠', color: 'text-green-400' },
        'medical': { label: 'Medical', icon: '🏥', color: 'text-pink-400' },
        'misc': { label: 'Misc & NPCs', icon: '🧩', color: 'text-purple-400' },
        'meta': { label: 'Zones / Text', icon: '📍', color: 'text-gray-400' },
    };

    // Group categories
    const groupedCategories = categories.reduce((acc, cat) => {
        const group = cat.group_name || 'Other';
        if (!acc[group]) acc[group] = [];
        acc[group].push(cat);
        return acc;
    }, {});

    // Ordered groups
    const orderedGroups = ['landmarks', 'military', 'industrial', 'civilian', 'medical', 'misc', 'meta', 'Other']
        .filter(g => groupedCategories[g] && groupedCategories[g].length > 0);

    const handleGroupToggle = (group, isChecked) => {
        const catsInGroup = groupedCategories[group] || [];
        catsInGroup.forEach(cat => onToggleFilter(cat.id, isChecked));
    };

    const isGroupChecked = (group) => {
        const cats = groupedCategories[group] || [];
        return cats.length > 0 && cats.every(c => activeFilters[c.id]);
    };

    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 z-[3999]" onClick={onClose} />
            )}

            <div
                className={`fixed top-0 right-0 h-full w-[350px] max-w-[85vw] bg-neutral-900/95 backdrop-blur-xl border-l border-white/10 z-[4000] shadow-2xl transition-transform duration-300 ease-bun
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-neutral-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center text-red-500">
                            <Filter size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Filters</h2>
                            <p className="text-xs text-neutral-400">Toggle map markers</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10 text-neutral-400 hover:text-white">
                        <X size={20} />
                    </Button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto h-[calc(100%-88px)] p-6 space-y-8 pb-20">

                    {/* Safe Zones Toggle */}
                    <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <span className="flex items-center gap-3 font-semibold text-emerald-400">
                            🛡️ Safe Zones
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={activeFilters['safe-zones'] !== false}
                                onChange={(e) => onToggleFilter('safe-zones', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                    </div>

                    {/* Personal Markers Toggle */}
                    <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        <span className="flex items-center gap-3 font-semibold text-blue-400">
                            ⭐ My Markers
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={activeFilters['personal'] !== false}
                                onChange={(e) => onToggleFilter('personal', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                    </div>

                    {orderedGroups.map(group => {
                        const meta = groupMetadata[group] || { label: group, icon: '📍', color: 'text-white' };
                        const allChecked = isGroupChecked(group);
                        const cats = groupedCategories[group].sort((a, b) => a.name.localeCompare(b.name));

                        return (
                            <div key={group} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${meta.color}`}>
                                        <span className="text-lg">{meta.icon}</span> {meta.label}
                                    </h3>
                                    <button
                                        onClick={() => handleGroupToggle(group, !allChecked)}
                                        className="text-[10px] font-medium bg-white/5 hover:bg-white/10 text-neutral-400 px-2 py-1 rounded transition-colors uppercase"
                                    >
                                        {allChecked ? 'Hide All' : 'Show All'}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    {cats.map(cat => (
                                        <label key={cat.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors select-none">
                                            <div className="relative flex items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={!!activeFilters[cat.id]}
                                                    onChange={(e) => onToggleFilter(cat.id, e.target.checked)}
                                                    className="appearance-none w-5 h-5 rounded border border-neutral-600 bg-neutral-800 checked:bg-red-600 checked:border-red-600 transition-all cursor-pointer"
                                                />
                                                <Check size={12} className={`absolute text-white pointer-events-none transition-opacity ${activeFilters[cat.id] ? 'opacity-100' : 'opacity-0'}`} />
                                            </div>

                                            {cat.icon_url && (
                                                <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0 border border-white/5">
                                                    <img
                                                        src={cat.icon_url}
                                                        alt={cat.name}
                                                        // Only invert Landmarks
                                                        className={`w-5 h-5 object-contain ${group === 'landmarks' ? 'invert brightness-0' : ''} ${cat.name === 'Trailers' ? 'invert' : ''}`}
                                                    />
                                                </div>
                                            )}

                                            <span className={`text-sm font-medium transition-colors ${activeFilters[cat.id] ? 'text-gray-200' : 'text-gray-500'}`}>
                                                {cat.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default MapFilters;
