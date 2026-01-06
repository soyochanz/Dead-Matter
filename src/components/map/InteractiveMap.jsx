import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, LayersControl, Circle, ZoomControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/lib/mySupabaseClient'; // Ensure this path is correct
import { useMapData } from '@/hooks/useMapData';
import MapPopup from './MapPopup';
import MapFilters from './MapFilters';
import MapSearch from './MapSearch';
import GroupManager from './GroupManager';
import { Loader2, Menu } from 'lucide-react';

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
const personalIcons = {
    // Basics
    star: { label: 'Interest', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>' },
    home: { label: 'Base', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>' },
    flag: { label: 'Rally', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>' },
    map: { label: 'Location', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/></svg>' },

    // Combat
    skull: { label: 'Danger', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="9" r="2"/><circle cx="15" cy="9" r="2"/><path d="M12 2C7.58 2 4 5.58 4 10c0 2.42 1.09 4.6 2.82 6.09L6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2l-.82-2.91C18.91 14.6 20 12.42 20 10c0-4.42-3.58-8-8-8zm-3 8c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm.5 4H8.5v-1h7v1z"/></svg>' },
    sword: { label: 'Attack', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-4H6v-2h4V7h2v4h4v2h-4v4z"/></svg>' }, // Crosshair/Target style
    shield: { label: 'Defense', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>' },
    target: { label: 'Target', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-8c0 2.21 1.79 4 4 4s4-1.79 4-4-1.79-4-4-4-4 1.79-4 4z"/></svg>' },

    // Resources
    loot: { label: 'Loot', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z"/></svg>' }, // Diamond/Gem shape is better: M12 2l-9.5 5.5 3 13.5h13l3-13.5L12 2zm0 2.2l6.5 3.8h-13L12 4.2z
    car: { label: 'Vehicle', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>' },
    gas: { label: 'Fuel', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33a2.5 2.5 0 002.5 2.5c.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77z"/></svg>' },
    medical: { label: 'Meds', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8.5 13h-1v-2.5H7v-1h2.5V10h1v2.5H13v1h-2.5V16z"/></svg>' }, // First aid cross similar
    food: { label: 'Food', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>' },
    water: { label: 'Water', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm0 18c-3.31 0-6-2.63-6-6.2 0-2.42 1.94-5.32 5-8.49l1-1.02 1 1.02c3.06 3.17 5 6.07 5 8.49 0 3.57-2.69 6.2-6 6.2z"/></svg>' },

    // Misc
    ammo: { label: 'Ammo', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 2h10v6l-5 5-5-5zM7 22l3.5-12h3l3.5 12z"/></svg>' }, // Rough bullet shape
    chat: { label: 'Note', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>' }
};

const personalColors = [
    '#ef4444', // Red
    '#f97316', // Orange
    '#f59e0b', // Amber
    '#eab308', // Yellow
    '#84cc16', // Lime
    '#22c55e', // Green
    '#10b981', // Emerald
    '#14b8a6', // Teal
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
    '#a855f7', // Purple
    '#d946ef', // Fuchsia
    '#ec4899', // Pink
    '#f43f5e', // Rose
    '#ffffff', // White
    '#94a3b8'  // Slate
];

const InteractiveMap = ({ adminMode = false, disableUI = false, onMapClick, onMarkerClick, refreshTrigger = 0, markers: propMarkers, lootTags: propLootTags, categories: propCategories }) => {
    // Note: refreshTrigger increments after save, triggering re-fetch in hook
    const [internalRefresh, setInternalRefresh] = useState(0);
    const combinedRefresh = refreshTrigger + internalRefresh;

    // Disable internal fetching if markers are provided via props (Admin mode)
    const { markers: hookMarkers, personalMarkers, groups, categories: hookCategories, lootTags: hookLootTags, loading: dataLoading, error: dataError } = useMapData(combinedRefresh, { enabled: !propMarkers });

    // Use props if provided, otherwise fallback to hook
    const markers = propMarkers || hookMarkers;
    const lootTags = propLootTags || hookLootTags;
    const categories = propCategories || hookCategories;
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
    }, [visibleMarkers, categories]);

    const getIconForMarker = (marker) => {
        // Find category
        const category = categories.find(c => c.id === marker.category_id);
        const isLoot = (marker.title.toLowerCase().includes('loot') || category?.name.toLowerCase().includes('loot'));

        // Custom Black Icons for Vehicles
        if (category?.name === 'Vehicles') {
            const carSvg = `<svg viewBox="0 0 24 24" fill="#000000" stroke="#000000" stroke-width="1"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>`;
            return L.divIcon({
                html: `<div style="width: 32px; height: 32px; filter: drop-shadow(0 0 4px rgba(255,255,255,0.5)); transform: translate(-4px, -4px);">${carSvg}</div>`,
                className: 'vehicle-marker',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });
        }

        // Removed hardcoded Trailers logic to use DB icon

        if (category?.group_name === 'military' && isLoot) return createDivIcon('red-icon');
        if (category?.group_name === 'industrial' && isLoot) return createDivIcon('orange-icon');
        if (category?.group_name === 'civilian' && isLoot) return createDivIcon('green-icon');
        if (category?.group_name === 'medical' && isLoot) return createDivIcon('purple-icon');

        if (category?.name === 'Zones (Major)' || category?.name === 'Zones (Minor)') {
            const isMinor = category.name === 'Zones (Minor)';
            return L.divIcon({
                className: `zone-label ${isMinor ? 'zone-minor' : 'zone-major'}`,
                html: `<span>${marker.title}</span>`,
                iconSize: [200, 20],
                iconAnchor: [100, 10]
            });
        }

        const iconUrl = category?.icon_url;

        if (iconUrl) {
            let size = [30, 30];
            let extraClass = 'precise-icon';
            if (category.group_name === 'landmarks') size = [37, 37];
            if (['barracks', 'hangar', 'firestation'].some(k => marker.title.toLowerCase().includes(k))) size = [22, 22];

            // Invert Trailers to white (assuming icon is black)
            if (category?.name === 'Trailers') {
                extraClass = 'precise-icon invert';
            }

            return createCustomIcon(iconUrl, size, extraClass);
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
        // Improved Elegant Design: Glassmorphism Circle with Colored Border
        return L.divIcon({
            html: `<div style="background-color: #0f172aa6; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid ${marker.color}; color: ${marker.color}; box-shadow: 0 4px 10px rgba(0,0,0,0.5); backdrop-filter: blur(2px);">
                <div style="width: 18px; height: 18px;">${iconDef.svg}</div>
            </div>`,
            className: 'personal-marker-icon',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
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
                    <LayersControl position="topright">
                        <LayersControl.BaseLayer checked name="Dead Matter Terrain">
                            <TileLayer url="https://deadmatterdb.com/leaflet/{z}/{x}/{y}.webp" minZoom={0} maxZoom={20} tms={false} />
                        </LayersControl.BaseLayer>
                        <LayersControl.BaseLayer name="OpenStreetMap (Fallback)">
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                        </LayersControl.BaseLayer>
                    </LayersControl>

                    <MouseCoordinatesDisplay />
                    <ZoomTracker />
                    <MapFlyTo location={selectedLocation} />

                    {activeFilters['safe-zones'] && (
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
                                        <MapPopup marker={marker} tags={lootTags.filter(t => t.marker_id === marker.id)} />
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
                                        <MapPopup marker={marker} tags={lootTags.filter(t => t.marker_id === marker.id)} />
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
                                        <MapPopup marker={marker} tags={lootTags.filter(t => t.marker_id === marker.id)} />
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
                                        <MapPopup marker={marker} tags={lootTags.filter(t => t.marker_id === marker.id)} />
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
                                        <MapPopup marker={marker} tags={markerTags} />
                                    </Popup>
                                )}
                            </Marker>
                        );
                    })}

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
                    <MapFilters categories={categories} activeFilters={activeFilters} onToggleFilter={handleToggleFilter} isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
                )}
                {dataLoading && (
                    <div className="absolute inset-0 z-[5000] flex items-center justify-center bg-black/50 backdrop-blur-sm"><Loader2 className="w-12 h-12 text-red-500 animate-spin" /></div>
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
