import React, { useEffect, useState } from 'react';
import { MapPin, Navigation, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/lib/mySupabaseClient';

const MapPopup = ({ marker, tags, keys = [] }) => {

    const isLocked = marker.requires_key;

    // Resolve multiple keys
    const requiredKeyIds = marker.required_key_ids || (marker.required_key_id ? [marker.required_key_id] : []);
    const requiredKeyNames = requiredKeyIds.map(id => keys.find(k => k.id === id)?.name || 'Unknown Key');
    const requiredKeyText = requiredKeyNames.length > 0 ? requiredKeyNames.join(', ') : 'Unknown Key';

    const infectedColors = {
        high: '#ef4444',   // red-500
        medium: '#f97316', // orange-500
        low: '#22c55e',    // green-500
        none: '#94a3b8'    // slate-400
    };
    const infectedLevel = marker.infected_level?.toLowerCase() || 'none';
    const infectedColor = infectedColors[infectedLevel] || infectedColors.none;

    // Format infected text
    const infectedText = infectedLevel === 'none' ? 'Empty' : (infectedLevel.charAt(0).toUpperCase() + infectedLevel.slice(1));

    const hasImage = !!marker.image_url;



    return (
        <div className="flex flex-col text-white font-sans bg-[#0e1116] rounded-[15px] overflow-hidden min-w-[300px]">
            {/* Hero Image Section */}
            {hasImage && (
                <div className="relative w-full h-48 group bg-black/40 overflow-hidden">
                    {/* Blurred Background Layer */}
                    <img
                        src={marker.image_url}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover blur-md opacity-30 scale-110"
                    />

                    {/* Main Image Layer (Fully Visible) */}
                    <img
                        src={marker.image_url}
                        alt={marker.title}
                        className="relative w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 z-10"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e1116] via-transparent to-transparent opacity-60 z-20" />

                    {/* Floating Title on Image */}
                    <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="text-xl font-bold leading-tight text-white drop-shadow-md">{marker.title}</h3>
                    </div>
                </div>
            )}

            {/* Content Body */}
            <div className={`px-4 pb-4 ${hasImage ? 'pt-1' : 'pt-4'}`}>
                {/* Title (if no image) */}
                {!hasImage && (
                    <h3 className="text-xl font-bold mb-2 text-white">{marker.title}</h3>
                )}

                {isLocked && (
                    <div className="mb-3 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2">
                        <div className="text-amber-500">🔐</div>
                        <div>
                            <span className="block text-xs font-bold text-amber-500 uppercase tracking-wider">Locked Area</span>
                            <span className="text-sm text-amber-200">Requires: <span className="font-semibold text-white">{requiredKeyText}</span></span>
                        </div>
                    </div>
                )}

                {/* Description */}
                {marker.description && (
                    <p className="text-sm text-gray-400 leading-relaxed mb-4">
                        {marker.description}
                    </p>
                )}

                {/* Tags & Linked Items Grid */}
                <div className="space-y-4">

                    {/* Loot Tags */}
                    {tags && tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {tags.map((tag) => (
                                <span
                                    key={tag.id}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-white/5 border border-white/10 text-gray-200"
                                >
                                    <span
                                        className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]"
                                        style={{ backgroundColor: tag.color || '#ffffff', color: tag.color || '#ffffff' }}
                                    />
                                    {tag.label}
                                </span>
                            ))}
                        </div>
                    )}



                    {/* Stats Row */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        {/* Infected Indicator */}
                        {marker.infected_level && (
                            <div className="flex items-center gap-2" title={`Infection Level: ${marker.infected_level}`}>
                                <div className="flex gap-0.5">
                                    {[1, 2, 3].map(i => {
                                        let active = false;
                                        if (infectedLevel === 'low' && i <= 1) active = true;
                                        if (infectedLevel === 'medium' && i <= 2) active = true;
                                        if (infectedLevel === 'high' && i <= 3) active = true;

                                        return (
                                            <div
                                                key={i}
                                                className={`w-1 h-3 rounded-full transition-all ${active ? '' : 'opacity-20'}`}
                                                style={{ backgroundColor: active ? infectedColor : '#fff' }}
                                            />
                                        );
                                    })}
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                                    Infected Population: <span style={{ color: infectedColor }}>{infectedText}</span>
                                </span>
                            </div>
                        )}

                        {/* Coords */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono bg-black/20 px-2 py-1 rounded ml-auto">
                            <MapPin className="w-3 h-3" />
                            {marker.lat?.toFixed(4)}, {marker.lng?.toFixed(4)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapPopup;
