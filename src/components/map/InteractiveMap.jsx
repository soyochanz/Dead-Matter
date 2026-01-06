import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, LayersControl, Circle, ZoomControl, Polyline, CircleMarker } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/lib/mySupabaseClient'; // Ensure this path is correct
import { useMapData } from '@/hooks/useMapData';
import MapPopup from './MapPopup';
import MapFilters from './MapFilters';
import MapSearch from './MapSearch';
import GroupManager from './GroupManager';
import { Loader2, Menu, X, Compass, ChevronLeft, ChevronRight } from 'lucide-react';
import { personalIcons, personalColors, mapIcons } from '@/utils/mapIcons';

// Fix for default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- Custom Icons Helper ---
const createCustomIcon = (url, size = [30, 30], className = 'precise-icon') => {
    return L.icon({
        iconUrl: url,
        iconSize: size,
        iconAnchor: [size[0] / 2, size[1]], // Bottom center
        popupAnchor: [0, -size[1] / 2],
        className: className
    });
};
// ... (keep createDivIcon, createClusterIcon) ...

// --- TIPS CONSTANT ---
const MAP_TIPS = [
    {
        id: 'loot',
        icon: '⚠️',
        title: 'Loot Color Info',
        text: 'The marker color represents the <strong>primary</strong> loot type in that area. However, fully exploring a zone may reveal additional loot categories mixed in.',
        theme: 'yellow'
    },
    {
        id: 'locked',
        icon: '🔐',
        title: 'Locked Zones',
        text: 'Some high-value areas require a specific key to enter. These are marked with a <strong>Gold Key Badge</strong> on the map pin.',
        theme: 'amber'
    },
    {
        id: 'groups',
        icon: '👥',
        title: 'Groups & Sharing',
        text: 'Create groups to share marker locations with your friends! Use the "Groups" panel on the left to manage your squad.',
        theme: 'blue'
    }
];

// --- Subcomponents for Map Logic ---

// Component to handle mouse coordinates and display them independently
const MouseCoordinatesDisplay = () => {
    const [coords, setCoords] = useState({ lat: 0, lng: 0 });
    useMapEvents({ mousemove: (e) => setCoords(e.latlng) });
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0e1116f2] backdrop-blur-[20px] border border-white/15 rounded-2xl px-5 py-3 z-[1000] shadow-2xl flex flex-col items-center gap-1 pointer-events-none">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Coordinates</span>
            <span className="text-sm font-bold text-white font-mono">{coords.lat.toFixed(5)} / {coords.lng.toFixed(5)}</span>
        </div>
    );
};

// Component to fly to location
const MapFlyTo = ({ location }) => {
    const map = useMap();
    useEffect(() => {
        if (location) map.flyTo([location.lat, location.lng], 18, { duration: 1.5 });
    }, [location, map]);
    return null;
};

// Helper component to capture map clicks and context menu
const ClickHelper = ({ setClickedCoords, adminMode, onMapClick, onContextMenu }) => {
    useMapEvents({
        click: (e) => {
            if (adminMode && onMapClick) onMapClick(e.latlng);
            else setClickedCoords(e.latlng);
        },
        contextmenu: (e) => {
            if (!adminMode && onContextMenu) onContextMenu(e.latlng);
        }
    });
    return null;
};

// --- Personal Markers Config ---


const InteractiveMap = ({ adminMode = false, disableUI = false, onMapClick, onMarkerClick, refreshTrigger = 0, markers: propMarkers, lootTags: propLootTags, categories: propCategories, keys: propKeys, missions: propMissions, manualPolylines = [] }) => {
    // Note: refreshTrigger increments after save, triggering re-fetch in hook
    const [internalRefresh, setInternalRefresh] = useState(0);
    const [showTips, setShowTips] = useState(true);
    const [currentTipIndex, setCurrentTipIndex] = useState(0);
    const [isMissionMode, setIsMissionMode] = useState(false); // Mission Mode State
    const [selectedNpcFilter, setSelectedNpcFilter] = useState('All'); // Mission Filter State
    const combinedRefresh = refreshTrigger + internalRefresh;

    // Disable internal fetching if markers are provided via props (Admin mode)
    const { markers: hookMarkers, personalMarkers, groups, keys: fetchedKeys, categories: hookCategories, lootTags: hookLootTags, missions: hookMissions, loading: dataLoading, error: dataError } = useMapData(combinedRefresh, { enabled: !propMarkers });

    // Use props if provided, otherwise fallback to hook
    const markers = propMarkers || hookMarkers || [];
    const categories = propCategories || hookCategories || [];
    const lootTags = propLootTags || hookLootTags || [];
    const keys = propKeys || fetchedKeys || [];
    const missions = propMissions || hookMissions || [];
    const [activeFilters, setActiveFilters] = useState({});
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    // mouseCoords moved to isolated component to prevent re-renders
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [clickedCoords, setClickedCoords] = useState(null);

    // Personal Marker State (Part 1 - Part 2 is below)
    const [isPersonalDialogOpen, setIsPersonalDialogOpen] = useState(false);
    const [personalMarkerPos, setPersonalMarkerPos] = useState(null);
    const [personalFormData, setPersonalFormData] = useState({ title: '', icon: 'star', color: '#ff0000', group: 'private' });
    const [isSavingPersonal, setIsSavingPersonal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
    }, []);

    // Initialize filters
    useEffect(() => {
        if (categories.length > 0) {
            const initialFilters = { 'safe-zones': true, 'personal': true }; // Enable personal by default
            categories.forEach(cat => {
                initialFilters[cat.id] = true;
            });
            setActiveFilters(initialFilters);
        }
    }, [categories]);

    const handleToggleFilter = (catId, isChecked) => {
        setActiveFilters(prev => ({ ...prev, [catId]: isChecked }));
    };

    const [zoomLevel, setZoomLevel] = useState(16);

    // --- ICON HELPER FUNCTIONS (Moved to component scope for access in Mission Loop) ---
    // Helper 3: Small Circular Icon (Water, Keys)
    const createCircleIcon = (content, color) => {
        const size = 24;
        return L.divIcon({
            html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                <div style="width: 14px; height: 14px; color: white;">${content}</div>
            </div>`,
            className: 'circle-marker',
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
        });
    };

    // Helper 1: Pin Style (Glass Teardrop)
    const createPinIcon = (content, color, locked = false) => {
        const badge = locked ? `<div style="position: absolute; top: -5px; right: -5px; width: 15px; height: 15px; background: #fbbf24; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1.5px solid #1a1a1a; box-shadow: 0 2px 4px rgba(0,0,0,0.5); z-index: 10; color: #1a1a1a;">
            <svg viewBox="0 0 24 24" fill="currentColor" style="width: 10px; height: 10px;"><path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
        </div>` : '';

        return L.divIcon({
            html: `<div style="position: relative;">
                <div style="background-color: #0f172aa6; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; display: flex; align-items: center; justify-content: center; border: 2px solid ${color}; color: ${color}; box-shadow: 0 0 12px ${color}80; backdrop-filter: blur(2px); transform: rotate(-45deg);">
                    <div style="width: 18px; height: 18px; transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">${content}</div>
                </div>
                ${badge}
            </div>`,
            className: 'pin-marker',
            iconSize: [32, 32],
            iconAnchor: [16, 42]
        });
    };

    // Helper 2: No Border Style (NPCs - Transparent)
    const createNoBorderIcon = (content, color) => {
        return L.divIcon({
            html: `<div style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; color: ${color}; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.8));">
                <div style="width: 30px; height: 30px;">${content}</div>
            </div>`,
            className: 'npc-marker',
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        });
    };

    // Helper 3: Dot Style (Loot)
    const createDotIcon = (color) => {
        return L.divIcon({
            html: `<div style="width: 12px; height: 12px; background-color: ${color}; border-radius: 50%; box-shadow: 0 0 0 1px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3);"></div>`,
            className: 'loot-dot',
            iconSize: [12, 12],
            iconAnchor: [6, 6]
        });
    };
    const ZoomTracker = () => {
        useMapEvents({ zoomend: (e) => setZoomLevel(e.target.getZoom()) });
        return null;
    };

    const visibleMarkers = useMemo(() => {
        return markers.filter(m => {
            if (!activeFilters[m.category_id]) return false;
            const cat = categories.find(c => c.id === m.category_id);
            if (cat?.name === 'Zones (Minor)' && zoomLevel < 18) return false;
            return true;
        });
    }, [markers, activeFilters, categories, zoomLevel]);

    const visiblePersonalMarkers = useMemo(() => {
        if (!activeFilters['personal']) return [];
        return personalMarkers || [];
    }, [personalMarkers, activeFilters]);

    // Group markers for clustering
    const { civilianLoot, medicalLoot, militaryLoot, industrialLoot, unclusteredMarkers } = useMemo(() => {
        const grouped = {
            civilianLoot: [],
            medicalLoot: [],
            militaryLoot: [],
            industrialLoot: [],
            unclusteredMarkers: []
        };

        visibleMarkers.forEach(marker => {
            const category = categories.find(c => c.id === marker.category_id);
            const catName = category?.name?.toLowerCase() || '';

            // Mission Mode Filtering
            if (isMissionMode) {
                const isNPC = catName.includes('npc') || catName.includes('vendor') || catName === 'traders';
                // Check for 'zones' (meta) or significant landmarks if needed. User said "nombres de las locations".
                // Usually 'zones' category covers the text labels.
                // Assuming 'zones' implies names.
                const isZone = catName.includes('zone') || category?.group_name === 'meta';

                if (!isNPC && !isZone) return; // Skip everything else
            }

            const isLoot = (marker.title.toLowerCase().includes('loot') || category?.name.toLowerCase().includes('loot'));
            const groupName = category?.group_name;

            if (isLoot && groupName === 'civilian') {
                grouped.civilianLoot.push(marker);
            } else if (isLoot && groupName === 'medical') {
                grouped.medicalLoot.push(marker);
            } else if (isLoot && groupName === 'military') {
                grouped.militaryLoot.push(marker);
            } else if (isLoot && groupName === 'industrial') {
                grouped.industrialLoot.push(marker);
            } else {
                grouped.unclusteredMarkers.push(marker);
            }
        });

        return grouped;
    }, [visibleMarkers, categories, isMissionMode]);

    const getIconForMarker = (marker) => {
        const category = categories.find(c => c.id === marker.category_id);
        const catName = category?.name?.toLowerCase() || '';
        const isLoot = (marker.title.toLowerCase().includes('loot') || catName.includes('loot'));
        const isLocked = marker.requires_key || ['federal stockpile bunker'].some(k => marker.title?.toLowerCase().includes(k));



        // 1. Loot (Colored Dots)
        if (category?.group_name === 'military' && isLoot) return createDotIcon('#ef4444');
        if (category?.group_name === 'industrial' && isLoot) return createDotIcon('#f97316');
        if (category?.group_name === 'civilian' && isLoot) return createDotIcon('#22c55e');
        if (category?.group_name === 'medical' && isLoot) return createDotIcon('#ec4899');

        // 2. Zones (Unchanged)
        if (catName.includes('zones')) {
            const isMinor = catName.includes('minor');
            return L.divIcon({
                className: `zone-label ${isMinor ? 'zone-minor' : 'zone-major'}`,
                html: `<span>${marker.title}</span>`,
                iconSize: [200, 20],
                iconAnchor: [100, 10]
            });
        }

        // 3. Orange Group (Factory, Hangar)
        if (catName.includes('factory')) return createPinIcon(mapIcons.factory, '#f97316', isLocked);
        if (catName.includes('hangar')) return createPinIcon(mapIcons.hangar, '#f97316', isLocked);

        // 4. Green Group
        if (catName.includes('bunker') && catName.includes('civilian')) return createPinIcon(mapIcons.bunker, '#22c55e', isLocked);
        if (catName.includes('deer stand')) return createPinIcon(mapIcons.tree, '#22c55e', isLocked);
        if (catName.includes('firestation')) return createPinIcon(mapIcons.fire, '#22c55e', isLocked);
        if (catName.includes('gas station')) return createPinIcon(personalIcons.gas.svg, '#22c55e', isLocked);
        if (catName.includes('golf')) return createPinIcon(mapIcons.golf, '#22c55e', isLocked);
        if (catName.includes('school')) return createPinIcon(mapIcons.school, '#22c55e', isLocked);

        // 5. Pink Group (Hospital, Nera Tent)
        if (catName.includes('hospital')) return createPinIcon(mapIcons.hospital, '#ec4899', isLocked);
        if (catName.includes('nera tent')) return createPinIcon(mapIcons.tent, '#ec4899', isLocked);

        // 6. Vehicles
        if (catName === 'vehicles') {
            const carSvg = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>`;
            return createPinIcon(carSvg, '#3b82f6', isLocked);
        }

        // 7. Trailers
        if (catName === 'trailers') {
            const simpleTrailer = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 7h-8v8h8V7zm2-2h-8c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM7 11H4v4h3v-4zm-3 6h3c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1z"/></svg>`;
            return createPinIcon(simpleTrailer, '#3b82f6', isLocked);
        }

        // 8. NPCs (No Border, White)
        if (catName.includes('npc') || catName.includes('vendors') || catName === 'traders') {
            return createNoBorderIcon(mapIcons.person, '#ffffff');
        }

        // 9. Special Circles (Water, Keys, Butane)
        if (catName.includes('water') && !catName.includes('tower')) return createCircleIcon(personalIcons.water.svg, '#06b6d4'); // Cyan
        if (catName.includes('key')) return createCircleIcon(mapIcons.key, '#eab308'); // Gold
        if (catName.includes('butane') || catName.includes('propane') || catName.includes('fuel') || (catName.includes('gas') && !catName.includes('station'))) return createCircleIcon(mapIcons.propane, '#f97316'); // Orange

        // 10. Red Group (Specific & Generic Military)
        if (catName.includes('shooting range')) return createPinIcon(mapIcons.target, '#ef4444');
        if (catName.includes('helicrash')) return createPinIcon(mapIcons.helicopter, '#ef4444');
        if (catName.includes('military bunker')) return createPinIcon(mapIcons.bunker, '#ef4444', isLocked);
        if (catName.includes('barracks')) return createPinIcon(mapIcons.barracks, '#ef4444');
        if (catName.includes('military base')) return createPinIcon(mapIcons.helmet, '#ef4444');
        if (catName.includes('camping tent')) return createPinIcon(mapIcons.tent, '#ef4444');

        const redGroup = ['military'];
        if (redGroup.some(k => catName.includes(k))) {
            const iconUrl = category?.icon_url;
            const content = iconUrl ? `<img src="${iconUrl}" style="width: 18px; height: 18px; filter: invert(1);" />` : personalIcons.skull.svg;
            return createPinIcon(content, '#ef4444');
        }

        // 11. Landmarks
        if (category?.group_name === 'landmarks') {
            const iconUrl = category?.icon_url;
            if (iconUrl) return createCustomIcon(iconUrl, [37, 37], 'precise-icon');
        }

        // 12. Fallback
        const iconUrl = category?.icon_url;
        if (iconUrl) {
            const content = `<img src="${iconUrl}" style="width: 18px; height: 18px; filter: invert(1);" />`;
            return createPinIcon(content, '#94a3b8');
        }

        return new L.Icon.Default();
    };

    const createDivIcon = (colorClassName) => {
        // Mapping class names to colors for simplicity or keeping class logic if global CSS exists
        // But better to use style directly for React
        let color = '#fff';
        if (colorClassName.includes('red')) color = '#e24a4a';
        if (colorClassName.includes('orange')) color = '#f5a623';
        if (colorClassName.includes('green')) color = '#7ee24a';
        if (colorClassName.includes('purple')) color = '#b860f0';
        if (colorClassName.includes('pink')) color = '#ec4899';

        return L.divIcon({
            html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
            className: 'precise-icon'
        });
    };

    const createClusterIcon = (cluster, className, color) => {
        return L.divIcon({
            html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color}80;"></div>`,
            className: className,
            iconSize: [16, 16]
        });
    };

    const getPersonalIcon = (marker) => {
        const iconDef = personalIcons[marker.icon_name] || personalIcons.star;
        // REDESIGN: "Glass Jewel" - Elegant, Dark, Frosted Diamond with Glowing Border
        return L.divIcon({
            html: `<div style="
                background-color: rgba(15, 23, 42, 0.6);
                width: 36px;
                height: 36px;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid ${marker.color};
                color: ${marker.color};
                box-shadow: 0 0 15px ${marker.color}80, inset 0 0 10px ${marker.color}20;
                backdrop-filter: blur(4px);
                transform: rotate(45deg);
            ">
                <div style="
                    width: 22px;
                    height: 22px;
                    transform: rotate(-45deg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    filter: drop-shadow(0 0 2px rgba(255,255,255,0.5));
                ">${iconDef.svg}</div>
            </div>`,
            className: 'personal-marker-icon', // Ensure CSS doesn't override transformation
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });
    };

    const [isMyMarkersOpen, setIsMyMarkersOpen] = useState(false);

    const handleFlyToMarker = (marker) => {
        setSelectedLocation({ lat: marker.lat, lng: marker.lng }); // Triggers MapFlyTo
        setIsMyMarkersOpen(false); // Optional: close sidebar on selection
    };

    const handleContextMenu = (latlng) => {
        if (!currentUser) return; // Only if logged in
        setPersonalMarkerPos(latlng);
        setPersonalFormData({ title: '', icon: 'star', color: '#ff0000', group: 'private' });
        setIsPersonalDialogOpen(true);
    };

    const handleSavePersonal = async () => {
        if (!currentUser || !personalMarkerPos) return;
        setIsSavingPersonal(true);

        const payload = {
            user_id: currentUser.id,
            lat: personalMarkerPos.lat,
            lng: personalMarkerPos.lng,
            title: personalFormData.title,
            icon_name: personalFormData.icon,
            color: personalFormData.color,
            visibility: personalFormData.group === 'private' ? 'private' : 'group',
            group_id: personalFormData.group === 'private' ? null : personalFormData.group
        };

        const { error } = await supabase.from('user_personal_markers').insert(payload);
        setIsSavingPersonal(false);
        if (!error) {
            setIsPersonalDialogOpen(false);
            setInternalRefresh(prev => prev + 1); // Trigger fetch
        } else {
            console.error(error);
            alert("Failed to save marker: " + error.message);
        }
    };

    const handleDeletePersonal = async (id) => {
        if (!confirm("Delete this marker?")) return;
        const { error } = await supabase.from('user_personal_markers').delete().eq('id', id);
        if (!error) setInternalRefresh(prev => prev + 1);
    };

    // --- MISSION FILTERS LOGIC ---
    const missionNpcs = useMemo(() => {
        if (!missions.length) return [];
        const uniqueNpcs = new Set(missions.map(m => {
            const npc = markers.find(mark => mark.id === m.npc_id);
            return npc ? npc.title : null;
        }).filter(Boolean));
        return ['All', ...Array.from(uniqueNpcs).sort()];
    }, [missions, markers]);

    const filteredMissions = useMemo(() => {
        if (selectedNpcFilter === 'All') return missions;
        return missions.filter(m => {
            const npcMarker = markers.find(mark => mark.id === m.npc_id);
            return npcMarker && npcMarker.title === selectedNpcFilter;
        });
    }, [missions, selectedNpcFilter, markers]);

    if (dataError) return <div className="text-red-500 text-center p-10">Error loading map data: {dataError}</div>;

    return (
        <div className="relative w-full h-full flex flex-col font-sans bg-[#0f0f0f] text-white overflow-hidden">
            {/* ... (Keep existing styles) ... */}
            <style>{`
                /* ... existing styles ... */
                .leaflet-popup-content-wrapper {
                    background: rgba(14, 17, 22, 0.95) !important;
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 16px !important;
                    color: white !important;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
                    padding: 0 !important;
                }
                .leaflet-popup-content { margin: 0 !important; width: 320px !important; }
                .leaflet-popup-tip { background: rgba(14, 17, 22, 0.95) !important; border: 1px solid rgba(255, 255, 255, 0.15); }
                .leaflet-container { background: #0f0f0f; font-family: 'Inter', sans-serif; }
                .leaflet-control-attribution { background: rgba(0,0,0,0.5) !important; color: #aaa !important; }
                .zone-label {
                    background: transparent; border: none; font-family: 'Oswald', sans-serif; font-weight: 700;
                    color: rgba(255, 255, 255, 0.9); text-shadow: 0 2px 4px rgba(0,0,0,0.8);
                    text-transform: uppercase; white-space: nowrap; pointer-events: none;
                    text-align: center; display: flex; justify-content: center; align-items: center;
                }
                .zone-major { font-size: 16px; letter-spacing: 1px; }
                .zone-minor { font-size: 12px; opacity: 0.8; }
                .zone-major { font-size: 16px; letter-spacing: 1px; }
                .zone-minor { font-size: 12px; opacity: 0.8; }
                
                /* Cluster Styles */
                .custom-cluster-marker {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    border: 2px solid rgba(255,255,255,0.9);
                    opacity: 0.9;
                    transition: all 0.2s ease;
                }
                .custom-cluster-marker:hover {
                    transform: scale(1.3);
                    opacity: 1;
                    z-index: 1000;
                    border-color: white;
                }
            `}</style>

            {/* --- SIDEBAR: MY MARKERS --- */}
            {!disableUI && (
                <div className={`fixed top-0 left-0 h-full w-[320px] z-[4500] bg-[#0a0a0c]/95 backdrop-blur-xl border-r border-white/10 shadow-2xl transition-transform duration-300 flex flex-col ${isMyMarkersOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <span>⭐</span> My Markers
                        </h2>
                        <button onClick={() => setIsMyMarkersOpen(false)} className="bg-white/5 hover:bg-white/10 p-1.5 rounded-lg transition-colors"><Menu className="w-5 h-5 rotate-180" /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {/* Markers List */}
                        <div>
                            <h3 className="text-xs font-bold text-neutral-500 uppercase mb-3">Your Locations</h3>
                            <div className="space-y-3">
                                {personalMarkers.length === 0 ? (
                                    <div className="text-center text-neutral-500 py-4 text-sm bg-white/5 rounded-lg">
                                        <p>No markers yet.</p>
                                        <p className="mt-1 text-xs">Right-click map to add.</p>
                                    </div>
                                ) : (
                                    personalMarkers.map(pm => {
                                        const IconObj = personalIcons[pm.icon_name] || personalIcons.star;
                                        const groupName = pm.group_id ? groups.find(g => g.id === pm.group_id)?.name : null;

                                        return (
                                            <div key={pm.id} onClick={() => handleFlyToMarker(pm)} className="group flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 cursor-pointer transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/40 text-black border border-white/10" style={{ color: pm.color }}>
                                                        <div dangerouslySetInnerHTML={{ __html: IconObj.svg }} className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex flex-col items-start text-left">
                                                        <span className="font-semibold text-sm text-gray-200 group-hover:text-white truncate max-w-[140px]">{pm.title}</span>
                                                        <span className="text-[10px] text-gray-500 uppercase tracking-wide flex items-center gap-1">
                                                            {IconObj.label}
                                                            {groupName && <span className="text-blue-400 bg-blue-500/10 px-1 rounded ml-1">{groupName}</span>}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeletePersonal(pm.id); }}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-500/20 rounded transition-all"
                                                    title="Delete"
                                                >
                                                    <Loader2 className="w-4 h-4" style={{ display: 'none' }} />
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Group Manager */}
                        <div className="pt-4 border-t border-white/10">
                            <h3 className="text-xs font-bold text-neutral-500 uppercase mb-3">Groups</h3>
                            <GroupManager
                                currentUser={currentUser}
                                groups={groups}
                                onGroupUpdate={() => setInternalRefresh(prev => prev + 1)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* --- TOP MENU (Floating Island) --- */}
            {!disableUI && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-[3000] flex items-center gap-3 pointer-events-none">
                    <div className="flex-1 bg-[#0e1116]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-2 flex items-center gap-4 pointer-events-auto">
                        <div className="flex items-center gap-3 pl-3 pr-2 border-r border-white/10">
                            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
                            </div>
                            <span className="hidden md:inline text-white font-bold text-sm tracking-wide">MAP</span>
                        </div>

                        {/* My Markers Button */}
                        <button
                            onClick={() => setIsMyMarkersOpen(!isMyMarkersOpen)}
                            className={`flex lg:hidden xl:flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 font-semibold text-sm border
                            ${isMyMarkersOpen
                                    ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border-white/10'
                                }`}
                        >
                            <span className="text-base">⭐</span> <span className="hidden sm:inline">My Markers</span>
                        </button>

                        <div className="flex-1">
                            <MapSearch markers={markers} categories={categories} onLocationSelect={setSelectedLocation} />
                        </div>

                        {/* Mission Mode Button */}
                        <button
                            onClick={() => setIsMissionMode(!isMissionMode)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 border ${isMissionMode ? 'bg-amber-500 text-black border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-white/5 text-gray-300 hover:bg-white/10 border-white/10'}`}
                            title="Mission Mode"
                        >
                            <Compass className="w-4 h-4" />
                            <span className="hidden sm:inline">Missions</span>
                        </button>

                        <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${isFilterOpen ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}>
                            <Menu className="w-4 h-4" />
                            <span className="hidden sm:inline">Filters</span>
                        </button>
                    </div>
                </div>
            )}

            {/* --- MAP --- */}
            <div className="w-full h-full absolute inset-0 z-0">
                <MapContainer center={[0.01221, 0.01914]} zoom={16} minZoom={17} maxZoom={20} style={{ height: '100%', width: '100%', background: '#1a1a1a' }} zoomControl={false}>
                    <ZoomControl position="bottomright" />
                    <TileLayer url="https://deadmatterdb.com/leaflet/{z}/{x}/{y}.webp" minZoom={0} maxZoom={20} tms={false} />

                    <MouseCoordinatesDisplay />
                    <ZoomTracker />
                    <MapFlyTo location={selectedLocation} />

                    {(activeFilters['safe-zones'] || isMissionMode) && (
                        <>
                            <Circle center={[0.01464, 0.00776]} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.1 }} radius={40} />
                            <Circle center={[0.00560, 0.01299]} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.1 }} radius={30} />
                        </>
                    )}

                    <ClickHelper setClickedCoords={setClickedCoords} adminMode={adminMode} onMapClick={onMapClick} onContextMenu={handleContextMenu} />

                    {/* CLUSTER: CIVILIAN (Green) */}
                    <MarkerClusterGroup
                        iconCreateFunction={(cluster) => createClusterIcon(cluster, 'civilian-cluster', '#10b981')}
                        maxClusterRadius={30}
                        disableClusteringAtZoom={18}
                        spiderfyOnMaxZoom={false}
                        animate={false}
                    >
                        {civilianLoot.map(marker => (
                            <Marker key={marker.id} position={[marker.lat, marker.lng]} icon={getIconForMarker(marker)} eventHandlers={{ click: (e) => { if (adminMode && onMarkerClick) { L.DomEvent.stopPropagation(e.originalEvent || e); onMarkerClick(marker); } } }}>
                                {!adminMode && (
                                    <Popup closeButton={false} offset={[0, -10]}>
                                        <MapPopup marker={marker} tags={lootTags.filter(t => t.marker_id === marker.id)} keys={keys} />
                                    </Popup>
                                )}
                            </Marker>
                        ))}
                    </MarkerClusterGroup>

                    {/* CLUSTER: MEDICAL (Purple) */}
                    <MarkerClusterGroup
                        iconCreateFunction={(cluster) => createClusterIcon(cluster, 'medical-cluster', '#a855f7')}
                        maxClusterRadius={30}
                        disableClusteringAtZoom={18}
                        spiderfyOnMaxZoom={false}
                        animate={true}
                    >
                        {medicalLoot.map(marker => (
                            <Marker key={marker.id} position={[marker.lat, marker.lng]} icon={getIconForMarker(marker)} eventHandlers={{ click: (e) => { if (adminMode && onMarkerClick) { L.DomEvent.stopPropagation(e.originalEvent || e); onMarkerClick(marker); } } }}>
                                {!adminMode && (
                                    <Popup closeButton={false} offset={[0, -10]}>
                                        <MapPopup marker={marker} tags={lootTags.filter(t => t.marker_id === marker.id)} keys={keys} />
                                    </Popup>
                                )}
                            </Marker>
                        ))}
                    </MarkerClusterGroup>

                    {/* CLUSTER: MILITARY (Red) */}
                    <MarkerClusterGroup
                        iconCreateFunction={(cluster) => createClusterIcon(cluster, 'military-cluster', '#ef4444')}
                        maxClusterRadius={30}
                        disableClusteringAtZoom={18}
                        spiderfyOnMaxZoom={false}
                        animate={true}
                    >
                        {militaryLoot.map(marker => (
                            <Marker key={marker.id} position={[marker.lat, marker.lng]} icon={getIconForMarker(marker)} eventHandlers={{ click: (e) => { if (adminMode && onMarkerClick) { L.DomEvent.stopPropagation(e.originalEvent || e); onMarkerClick(marker); } } }}>
                                {!adminMode && (
                                    <Popup closeButton={false} offset={[0, -10]}>
                                        <MapPopup marker={marker} tags={lootTags.filter(t => t.marker_id === marker.id)} keys={keys} />
                                    </Popup>
                                )}
                            </Marker>
                        ))}
                    </MarkerClusterGroup>

                    {/* CLUSTER: INDUSTRIAL (Orange) */}
                    <MarkerClusterGroup
                        iconCreateFunction={(cluster) => createClusterIcon(cluster, 'industrial-cluster', '#f97316')}
                        maxClusterRadius={30}
                        disableClusteringAtZoom={18}
                        spiderfyOnMaxZoom={false}
                        animate={true}
                    >
                        {industrialLoot.map(marker => (
                            <Marker key={marker.id} position={[marker.lat, marker.lng]} icon={getIconForMarker(marker)} eventHandlers={{ click: (e) => { if (adminMode && onMarkerClick) { L.DomEvent.stopPropagation(e.originalEvent || e); onMarkerClick(marker); } } }}>
                                {!adminMode && (
                                    <Popup closeButton={false} offset={[0, -10]}>
                                        <MapPopup marker={marker} tags={lootTags.filter(t => t.marker_id === marker.id)} keys={keys} />
                                    </Popup>
                                )}
                            </Marker>
                        ))}
                    </MarkerClusterGroup>

                    {/* UNCLUSTERED MARKERS */}
                    {unclusteredMarkers.map(marker => {
                        const markerTags = lootTags.filter(t => t.marker_id === marker.id);
                        const category = categories.find(c => c.id === marker.category_id);
                        const isZone = category?.name === 'Zones (Major)' || category?.name === 'Zones (Minor)';

                        return (
                            <Marker
                                key={marker.id}
                                position={[marker.lat, marker.lng]}
                                icon={getIconForMarker(marker)}
                                interactive={!isZone} // Disable interactions for zones
                                eventHandlers={!isZone ? { click: (e) => { if (adminMode && onMarkerClick) { L.DomEvent.stopPropagation(e.originalEvent || e); onMarkerClick(marker); } } } : {}}
                            >
                                {!adminMode && !isZone && (
                                    <Popup closeButton={false} offset={[0, -10]}>
                                        <MapPopup marker={marker} tags={markerTags} keys={keys} />
                                    </Popup>
                                )}
                            </Marker>
                        );
                    })}



                    {/* MANUAL POLYLINES (ADMIN PREVIEW) */}
                    {manualPolylines.map((positions, idx) => (
                        <Polyline key={`manual-poly-${idx}`} positions={positions} pathOptions={{ color: '#f59e0b', dashArray: '5, 10', weight: 2 }} />
                    ))}

                    {/* MISSION MODE ENTITIES */}
                    {(isMissionMode && !adminMode) && (
                        <>
                            {/* NPC FILTERS UI */}
                            {!disableUI && (
                                <div className="fixed top-[70px] left-1/2 -translate-x-1/2 z-[4000] flex gap-2 overflow-x-auto max-w-[90%] p-2 no-scrollbar pointer-events-auto">
                                    {missionNpcs.map(npcName => (
                                        <button
                                            key={npcName}
                                            onClick={() => setSelectedNpcFilter(npcName)}
                                            className={`
                                                px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-lg border backdrop-blur-md transition-all
                                                ${selectedNpcFilter === npcName
                                                    ? 'bg-amber-500 text-black border-amber-400 scale-105'
                                                    : 'bg-black/90 text-white/80 border-white/10 hover:bg-black hover:border-amber-500/50'}
                                            `}
                                        >
                                            {npcName}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {filteredMissions.map(mission => {
                                const steps = mission.mission_steps || [];
                                if (steps.length === 0) return null;
                                const sortedSteps = [...steps].sort((a, b) => a.step_order - b.step_order);
                                const startStep = sortedSteps[0];

                                // Path Positions
                                // Path Positions
                                const startNpcMarker = markers?.find(m => m.id === mission.start_npc_id);
                                const npcMarker = markers?.find(m => m.id === mission.npc_id);

                                const pathPositions = [];
                                if (startNpcMarker) pathPositions.push([startNpcMarker.lat, startNpcMarker.lng]);
                                sortedSteps.forEach(s => pathPositions.push([s.lat, s.lng]));
                                if (npcMarker) pathPositions.push([npcMarker.lat, npcMarker.lng]);

                                // Determine Start Position & Icon
                                const startPos = startNpcMarker ? [startNpcMarker.lat, startNpcMarker.lng] : [startStep.lat, startStep.lng];
                                const startIcon = startNpcMarker
                                    ? createNoBorderIcon(mapIcons.person, '#fbbf24') // Or specific NPC icon if available
                                    : createPinIcon('👑', '#fbbf24');

                                return (
                                    <React.Fragment key={mission.id}>
                                        {/* 1. PATH LINE (Thicker & Brighter) */}
                                        <Polyline
                                            positions={pathPositions}
                                            pathOptions={{
                                                color: '#fbbf24',
                                                weight: 4,
                                                opacity: 0.9,
                                                dashArray: '8, 8',
                                                lineCap: 'round'
                                            }}
                                        />

                                        {/* 2. START MARKER */}
                                        <Marker position={startPos} icon={startIcon} zIndexOffset={1000}>
                                            <Popup minWidth={300} maxWidth={300} className="mission-popup">
                                                <div className="p-0">
                                                    <div className="bg-amber-600/20 p-3 rounded-t border-b border-amber-500/30">
                                                        <h3 className="font-bold text-amber-500 text-lg leading-none">{mission.title}</h3>
                                                        <p className="text-xs text-amber-200 mt-1">{mission.content || mission.description}</p>
                                                    </div>
                                                    <div className="p-3 max-h-[300px] overflow-y-auto space-y-4">
                                                        {sortedSteps.map((step, i) => (
                                                            <div key={step.id} className="relative pl-4 border-l-2 border-amber-500/30 pb-2 last:pb-0">
                                                                <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                                                <h4 className="font-bold text-white text-sm">Step {step.step_order}: {step.title}</h4>
                                                                {step.image_url && (
                                                                    <img src={step.image_url} alt="Step" className="w-full h-32 object-cover rounded-md my-2 border border-white/10" />
                                                                )}
                                                                <p className="text-xs text-gray-300">{step.description}</p>
                                                            </div>
                                                        ))}
                                                        {npcMarker && (
                                                            <div className="relative pl-4 border-l-2 border-amber-500/30 pt-2">
                                                                <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                                                <h4 className="font-bold text-green-400 text-sm">Final: Report to {npcMarker.title}</h4>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>

                                        {/* 3. STEP MARKERS (Intermediate Pins) - Hide Last Step */}
                                        {sortedSteps.slice(0, -1).map((step, idx) => (
                                            <Marker
                                                key={`${mission.id}-step-${idx}`}
                                                position={[step.lat, step.lng]}
                                                icon={createPinIcon(step.step_order, '#fbbf24')}
                                            >
                                                <Popup closeButton={false} offset={[0, -5]}>
                                                    <div className="text-center">
                                                        <strong className="text-amber-500 block text-xs uppercase tracking-wide">Step {step.step_order}</strong>
                                                        <span className="text-sm font-bold text-white">{step.title}</span>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        ))}
                                    </React.Fragment>
                                );
                            })}
                        </>
                    )}

                    {/* Personal Markers */}
                    {visiblePersonalMarkers.map(pm => {
                        const IconObj = personalIcons[pm.icon_name] || personalIcons.star;
                        return (
                            <Marker key={pm.id} position={[pm.lat, pm.lng]} icon={getPersonalIcon(pm)}>
                                <Popup closeButton={false} offset={[0, -10]}>
                                    <div className="p-1 min-w-[150px]">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-black/20" style={{ color: pm.color }}>
                                                <div dangerouslySetInnerHTML={{ __html: IconObj.svg }} className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-base leading-tight">{pm.title}</h3>
                                                <p className="text-xs text-neutral-400 mt-1">{IconObj.label}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeletePersonal(pm.id)} className="w-full mt-3 py-1.5 text-xs font-semibold text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded border border-red-500/20 transition-colors">
                                            Delete Marker
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}

                </MapContainer>



                {clickedCoords && (
                    <div className="fixed bottom-[90px] left-1/2 -translate-x-1/2 bg-[#0e1116f2] backdrop-blur-[20px] border border-white/15 rounded-2xl px-6 py-3.5 z-[1000] shadow-2xl flex flex-col items-center gap-1 cursor-pointer hover:scale-105 transition-transform" onClick={() => navigator.clipboard.writeText(`${clickedCoords.lat.toFixed(5)}, ${clickedCoords.lng.toFixed(5)}`)}>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Click to copy</span>
                        <span className="text-sm font-bold text-orange-400 font-mono">{clickedCoords.lat.toFixed(5)}, {clickedCoords.lng.toFixed(5)}</span>
                    </div>
                )}

                {/* --- Personal Marker Dialog --- */}
                {isPersonalDialogOpen && (
                    <div className="fixed inset-0 z-[5000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-[#0e1116] border border-white/10 rounded-2xl w-full max-w-sm p-5 shadow-2xl">
                            <h3 className="text-lg font-bold text-white mb-1">New Personal Marker</h3>
                            <p className="text-sm text-neutral-400 mb-4">Visible only to you</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-neutral-500 uppercase block mb-1.5">Label</label>
                                    <input autoFocus value={personalFormData.title} onChange={e => setPersonalFormData({ ...personalFormData, title: e.target.value })} placeholder="e.g., My Base" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white/30" />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-neutral-500 uppercase block mb-1.5">Visibility</label>
                                    <select
                                        value={personalFormData.group}
                                        onChange={e => setPersonalFormData({ ...personalFormData, group: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 appearance-none"
                                    >
                                        <option value="private">Private (Only Me)</option>
                                        {groups.map(g => (
                                            <option key={g.id} value={g.id}>Group: {g.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-neutral-500 uppercase block mb-1.5">Icon</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {Object.entries(personalIcons).map(([key, def]) => (
                                            <button
                                                key={key}
                                                onClick={() => setPersonalFormData({ ...personalFormData, icon: key })}
                                                className={`h-10 rounded-lg flex items-center justify-center border transition-all ${personalFormData.icon === key ? 'bg-white/10 border-white text-white' : 'bg-transparent border-white/10 text-neutral-500 hover:bg-white/5'}`}
                                                title={def.label}
                                            >
                                                <div dangerouslySetInnerHTML={{ __html: def.svg }} className="w-5 h-5 pointer-events-none" />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-neutral-500 uppercase block mb-1.5">Color</label>
                                    <div className="flex flex-wrap gap-2">
                                        {personalColors.map(color => (
                                            <button key={color} onClick={() => setPersonalFormData({ ...personalFormData, color })} className={`w-8 h-8 rounded-full border-2 transition-transform ${personalFormData.color === color ? 'border-white scale-110' : 'border-transparent hover:scale-110'}`} style={{ backgroundColor: color }} />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setIsPersonalDialogOpen(false)} className="flex-1 py-2 rounded-lg font-semibold text-neutral-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
                                    <button onClick={handleSavePersonal} disabled={!personalFormData.title || isSavingPersonal} className="flex-1 py-2 rounded-lg font-semibold text-black bg-white hover:bg-neutral-200 disabled:opacity-50 transition-colors">
                                        {isSavingPersonal ? 'Saving...' : 'Create Marker'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!disableUI && (
                    <MapFilters
                        categories={categories}
                        activeFilters={activeFilters}
                        onToggleFilter={handleToggleFilter}
                        isOpen={isFilterOpen}
                        onClose={() => setIsFilterOpen(false)}
                        isMissionMode={isMissionMode}
                        missionNpcs={missionNpcs}
                        selectedNpcFilter={selectedNpcFilter}
                        onSelectNpcFilter={setSelectedNpcFilter}
                    />
                )}
                {dataLoading && (
                    <div className="absolute inset-0 z-[5000] flex items-center justify-center bg-black/50 backdrop-blur-sm"><Loader2 className="w-12 h-12 text-red-500 animate-spin" /></div>
                )}

                {/* Tips Carousel */}
                {!disableUI && showTips && (
                    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[4000] bg-black/80 backdrop-blur-md border border-white/10 text-white px-4 py-3 rounded-xl shadow-2xl max-w-md w-[90%] animate-in fade-in slide-in-from-top-4">
                        {(() => {
                            const tip = MAP_TIPS[currentTipIndex];
                            // Theme colors
                            let titleColor = 'text-white';
                            if (tip.theme === 'yellow') titleColor = 'text-yellow-400';
                            if (tip.theme === 'amber') titleColor = 'text-amber-400';
                            if (tip.theme === 'blue') titleColor = 'text-blue-400';

                            return (
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-start gap-3">
                                        <div className="text-xl mt-0.5 shrink-0">{tip.icon}</div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <strong className={`block text-sm mb-1 ${titleColor}`}>{tip.title}</strong>
                                                <button onClick={() => setShowTips(false)} className="text-white/30 hover:text-white transition-colors p-1 -mt-1 -mr-1">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: tip.text }} />
                                        </div>
                                    </div>

                                    {/* Navigation Dots & Arrows */}
                                    <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/5">
                                        <button
                                            onClick={() => setCurrentTipIndex(prev => prev === 0 ? MAP_TIPS.length - 1 : prev - 1)}
                                            className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>

                                        <div className="flex gap-1.5">
                                            {MAP_TIPS.map((_, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentTipIndex ? 'bg-white scale-125' : 'bg-white/20'}`}
                                                />
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => setCurrentTipIndex(prev => prev === MAP_TIPS.length - 1 ? 0 : prev + 1)}
                                            className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}



                {/* --- VERSION LABEL --- */}
                {!disableUI && (
                    <div className="fixed bottom-4 right-4 z-[4000] bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full pointer-events-none">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Game Version: <span className="text-red-500">0.12.2</span>
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InteractiveMap;
