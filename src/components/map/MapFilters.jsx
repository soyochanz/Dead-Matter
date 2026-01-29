import React from 'react';
import { X, Filter, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { personalIcons, mapIcons } from '@/utils/mapIcons';

const MapFilters = ({ categories, activeFilters, onToggleFilter, isOpen, onClose, isMissionMode, missionNpcs, selectedNpcFilter, onSelectNpcFilter }) => {

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
        // HIDE KEYS from filters
        if (cat.name.toLowerCase().includes('key')) return acc;

        const group = cat.group_name || 'Other';
        if (!acc[group]) acc[group] = [];
        acc[group].push(cat);
        return acc;
    }, {});

    // Ordered groups
    const orderedGroups = ['landmarks', 'military', 'industrial', 'civilian', 'medical', 'misc', 'Other']
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
                className={`fixed top-0 right-0 h-full w-[350px] max-w-[90vw] bg-neutral-900/98 backdrop-blur-2xl border-l border-white/10 z-[4000] shadow-2xl transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-neutral-900/50">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 ${isMissionMode ? 'bg-amber-600/20 text-amber-500' : 'bg-red-600/20 text-red-500'}`}>
                            <Filter size={18} className="md:w-5 md:h-5" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg md:text-xl font-bold text-white tracking-tight truncate">{isMissionMode ? 'Mission Filters' : 'Filters'}</h2>
                            <p className="text-[10px] md:text-xs text-neutral-400 truncate">{isMissionMode ? 'Filter by Mission Giver' : 'Toggle map markers'}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10 text-neutral-400 hover:text-white shrink-0">
                        <X size={20} />
                    </Button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto h-[calc(100%-88px)] p-6 space-y-8 pb-20">

                    {isMissionMode ? (
                        // MISSION MODE FILTERS (NPC List)
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
                                <span>👥</span> Mission Givers
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                                {missionNpcs && missionNpcs.map(npcName => (
                                    <button
                                        key={npcName}
                                        onClick={() => onSelectNpcFilter(npcName)}
                                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${selectedNpcFilter === npcName
                                            ? 'bg-amber-500/10 border-amber-500 text-white'
                                            : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10'
                                            }`}
                                    >
                                        <span className="font-semibold">{npcName}</span>
                                        {selectedNpcFilter === npcName && <Check size={16} className="text-amber-500" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        // STANDARD MARKER FILTERS
                        <>
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

                            {/* Zones / Towns Toggle */}
                            <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mt-2">
                                <span className="flex items-center gap-3 font-semibold text-amber-400">
                                    📍 Zones / Towns
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={isGroupChecked('meta')}
                                        onChange={(e) => handleGroupToggle('meta', e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
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
                                // Sort: Loot at bottom, alphabetical otherwise
                                let cats = groupedCategories[group] || [];
                                cats = [...cats].sort((a, b) => {
                                    const aLoot = a.name.toLowerCase().includes('loot');
                                    const bLoot = b.name.toLowerCase().includes('loot');
                                    if (aLoot && !bLoot) return 1;
                                    if (!aLoot && bLoot) return -1;
                                    return a.name.localeCompare(b.name);
                                });

                                // Special rendering list (for Civilian Resources)
                                let renderItems = cats;
                                if (group === 'civilian') {
                                    const resources = cats.filter(c => {
                                        const n = c.name.toLowerCase();
                                        return (n.includes('water') || n.includes('gas') || n.includes('fuel') || n.includes('butane') || n.includes('propane')) && !n.includes('station');
                                    });
                                    const others = cats.filter(c => !resources.includes(c));
                                    renderItems = [...others];
                                    if (resources.length > 0) {
                                        renderItems.push({ isHeader: true, label: 'Resources' });
                                        renderItems.push(...resources);
                                    }
                                }

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
                                            {renderItems.map((item, idx) => {
                                                if (item.isHeader) {
                                                    return <div key={`header-${idx}`} className="text-xs font-bold text-gray-500 uppercase mt-2 mb-1 pl-1">{item.label}</div>;
                                                }
                                                const cat = item;
                                                return (
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

                                                        {(() => {
                                                            const name = cat.name.toLowerCase();
                                                            let bgColor = '#262626'; // Default neutral
                                                            let iconContent = null;
                                                            let isImg = false;
                                                            let textColor = '#ffffff';

                                                            // 1. Orange
                                                            if (name.includes('factory')) { bgColor = '#f97316'; iconContent = mapIcons.factory; }
                                                            else if (name.includes('hangar')) { bgColor = '#f97316'; iconContent = mapIcons.hangar; }

                                                            // 2. Green
                                                            else if (name.includes('bunker') && name.includes('civilian')) { bgColor = '#22c55e'; iconContent = mapIcons.bunker; }
                                                            else if (name.includes('deer')) { bgColor = '#22c55e'; iconContent = mapIcons.tree; }
                                                            else if (name.includes('fire')) { bgColor = '#22c55e'; iconContent = mapIcons.fire; }
                                                            else if (name.includes('gas station')) { bgColor = '#22c55e'; iconContent = personalIcons.gas.svg; }
                                                            else if (name.includes('golf')) { bgColor = '#22c55e'; iconContent = mapIcons.golf; }
                                                            else if (name.includes('school')) { bgColor = '#22c55e'; iconContent = mapIcons.school; }

                                                            // 3. Pink
                                                            else if (name.includes('hospital')) { bgColor = '#ec4899'; iconContent = mapIcons.hospital; }
                                                            else if (name.includes('nera tent')) { bgColor = '#ec4899'; iconContent = mapIcons.tent; }

                                                            // 3.5 Gold (Keys) - ALREADY HIDDEN but fallback check
                                                            else if (name.includes('key')) { bgColor = '#eab308'; iconContent = mapIcons.key; }

                                                            // 4. Blue (Vehicles)
                                                            else if (name === 'vehicles') { bgColor = '#3b82f6'; iconContent = mapIcons.car; }
                                                            else if (name === 'trailers') { bgColor = '#3b82f6'; iconContent = mapIcons.trailer; }
                                                            else if (name.includes('lootable vehicle')) { bgColor = '#a3a3a3'; iconContent = mapIcons.car; }

                                                            // 5. White/NPC
                                                            else if (name.includes('npc') || name.includes('vendors') || name === 'traders') { bgColor = '#ffffff'; iconContent = mapIcons.person; textColor = '#000000'; }

                                                            // 6. Cyan (Water) & Amber (Gas Source/Propane)
                                                            else if (name.includes('water') && !name.includes('tower')) { bgColor = '#06b6d4'; iconContent = personalIcons.water.svg; }
                                                            else if (name.includes('gas source') || name.includes('butane') || name.includes('propane') || name.includes('fuel')) { bgColor = '#f97316'; iconContent = mapIcons.propane; }

                                                            // 7. Red Group
                                                            else if (name.includes('shooting range')) { bgColor = '#ef4444'; iconContent = mapIcons.target; }
                                                            else if (name.includes('helicrash')) { bgColor = '#ef4444'; iconContent = mapIcons.helicopter; }
                                                            else if (name.includes('military bunker')) { bgColor = '#ef4444'; iconContent = mapIcons.bunker; }
                                                            else if (name.includes('barracks')) { bgColor = '#ef4444'; iconContent = mapIcons.barracks; }
                                                            else if (name.includes('military base')) { bgColor = '#ef4444'; iconContent = mapIcons.helmet; }
                                                            else if (name.includes('camping tent')) { bgColor = '#ef4444'; iconContent = mapIcons.tent; }

                                                            // 8. Loot
                                                            else if (name.includes('loot') && name.includes('civilian')) { bgColor = '#22c55e'; iconContent = null; }
                                                            else if (name.includes('loot') && name.includes('medical')) { bgColor = '#ec4899'; iconContent = mapIcons.medical; }
                                                            else if (name.includes('loot') && name.includes('military')) { bgColor = '#ef4444'; iconContent = null; }
                                                            else if (name.includes('loot') && name.includes('industrial')) { bgColor = '#f97316'; iconContent = mapIcons.loot; }

                                                            // 9. Generic Red Checks
                                                            else if (['military base', 'camping tents'].some(k => name.includes(k))) { bgColor = '#ef4444'; isImg = true; }

                                                            // Fallback
                                                            else { isImg = true; }

                                                            if (isImg && cat.icon_url) {
                                                                const hasColor = bgColor !== '#262626';
                                                                return (
                                                                    <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 border border-white/5 overflow-hidden" style={{ backgroundColor: hasColor ? bgColor : '#171717' }}>
                                                                        <img
                                                                            src={cat.icon_url}
                                                                            alt={cat.name}
                                                                            className={`w-5 h-5 object-contain ${hasColor || group === 'landmarks' || cat.name === 'Trailers' ? 'invert brightness-0' : ''}`}
                                                                        />
                                                                    </div>
                                                                );
                                                            }

                                                            if (iconContent) {
                                                                return (
                                                                    <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 border border-white/5 shadow-sm" style={{ backgroundColor: bgColor, color: textColor }}>
                                                                        <div style={{ width: '20px', height: '20px' }} dangerouslySetInnerHTML={{ __html: iconContent }} />
                                                                    </div>
                                                                );
                                                            }
                                                            if (bgColor !== '#262626' && !isImg && !iconContent) {
                                                                return <div className="w-8 h-8 rounded-md shrink-0 border border-white/5 shadow-sm" style={{ backgroundColor: bgColor }} />;
                                                            }
                                                            return <div className="w-8 h-8 rounded-md bg-neutral-800 shrink-0 border border-white/10" />;
                                                        })()}

                                                        <span className={`text-sm font-medium transition-colors ${activeFilters[cat.id] ? 'text-gray-200' : 'text-gray-500'}`}>
                                                            {cat.name}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default MapFilters;
