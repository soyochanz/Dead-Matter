import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, LayersControl, LayerGroup, Marker, Popup, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/lib/customSupabaseClient';
import { mapConfig, iconTypes, divIconTypes, layerCategories, landmarkInfo, staticMarkers, pueblosImportantes, pueblosMenosImportantes } from '@/data/mapData';
import { Loader2 } from 'lucide-react';

// Common fix for leafet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createCustomIcon = (type) => {
    if (iconTypes[type]) {
        const { url, size } = iconTypes[type];
        return L.icon({
            iconUrl: url,
            iconSize: size,
            iconAnchor: [size[0] / 2, size[1]],
            popupAnchor: [0, -size[1] / 2],
            className: 'precise-icon'
        });
    }
    if (divIconTypes[type]) {
        const { className, color } = divIconTypes[type];
        return L.divIcon({
            html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>`,
            className: className + ' precise-icon',
            iconSize: [12, 12],
            iconAnchor: [6, 6]
        });
    }
    return new L.Icon.Default();
};

const MapEvents = ({ setMapInstance, setCoordinates, setClickedCoords, onMapClick }) => {
    const map = useMap();

    useEffect(() => {
        if (setMapInstance) {
            setMapInstance(map);
        }
        map.invalidateSize();
    }, [map, setMapInstance]);

    useMapEvents({
        mousemove: (e) => {
            if (setCoordinates) {
                setCoordinates(e.latlng);
            }
        },
        click: (e) => {
            if (setClickedCoords) {
                setClickedCoords(e.latlng);
            }
            if (onMapClick) {
                onMapClick(e.latlng);
            }
        },
    });
    return null;
};

const SafeZones = () => (
    <>
        <Circle center={[0.01464, 0.00776]} radius={40} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.1 }} />
        <Circle center={[0.00560, 0.01299]} radius={30} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.1 }} />
    </>
);

const DeadMatterMap = ({ onMapClick, adminMode = false, setMapInstance, setCoordinates, setClickedCoords, activeFilters }) => {
    const [dynamicMarkers, setDynamicMarkers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMarkers = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('interactive_markers').select('*');
            if (data) setDynamicMarkers(data);
            setLoading(false);
        };
        fetchMarkers();
    }, []);

    const renderPopup = (marker) => {
        const info = landmarkInfo[marker.popup] || {};
        const title = marker.name || marker.popup || "Unknown Location";
        const desc = marker.description || info.desc;
        const img = marker.image_url || info.img;
        const loot = marker.loot || info.loot;
        const infected = marker.infected_level || info.infected;

        return (
            <Popup minWidth={300} maxWidth={400} className="custom-popup">
                <div className="popup-box">
                    {img && <img src={img} alt={title} className="popup-img" />}
                    <h3 className="popup-title">{title}</h3>
                    {desc && <p className="popup-desc">{desc}</p>}

                    {loot && loot.length > 0 && (
                        <div className="popup-loot">
                            <h4>Loot</h4>
                            <div className="flex flex-wrap gap-2">
                                {loot.map((l, i) => (
                                    <div key={i} className="loot-item">
                                        <span className="loot-color" style={{ backgroundColor: l.color || '#333' }}></span>
                                        {l.type}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {infected && (
                        <div className="popup-infected">
                            Infected: <span style={{ color: infected === 'High' ? 'red' : 'green' }}>{infected}</span>
                        </div>
                    )}
                </div>
            </Popup>
        );
    };

    const categorizedMarkers = useMemo(() => {
        const categories = {};
        Object.keys(layerCategories).forEach(cat => categories[cat] = []);
        categories['other'] = [];

        staticMarkers.forEach(marker => {
            const cat = Object.keys(layerCategories).find(key => layerCategories[key].includes(marker.type)) || 'other';
            categories[cat].push({ ...marker, isDynamic: false });
        });

        dynamicMarkers.forEach(marker => {
            const cat = marker.category || 'other';
            categories[cat].push({ ...marker, isDynamic: true, type: marker.icon });
        });

        return categories;
    }, [dynamicMarkers]);

    const showLocations = !activeFilters || activeFilters.locations;
    const showSafeZones = !activeFilters || activeFilters.safezones;

    return (
        <div className="relative w-full h-full bg-[#1a1a1a]">
            <MapContainer
                center={mapConfig.initialCenter}
                zoom={mapConfig.initialZoom}
                minZoom={mapConfig.minZoom}
                maxZoom={mapConfig.maxZoom}
                scrollWheelZoom={true}
                className="w-full h-full"
            >
                <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="Terrain">
                        <TileLayer url={mapConfig.tiles.terrain} maxNativeZoom={20} maxZoom={20} noWrap={true} />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Roadmap">
                        <TileLayer url={mapConfig.tiles.roadmap} maxNativeZoom={20} maxZoom={20} />
                    </LayersControl.BaseLayer>

                    {showSafeZones && (
                        <LayersControl.Overlay checked name="Safe Zones">
                            <LayerGroup>
                                <SafeZones />
                            </LayerGroup>
                        </LayersControl.Overlay>
                    )}

                    {Object.entries(categorizedMarkers).map(([category, markers]) => (
                        <LayersControl.Overlay checked name={category.charAt(0).toUpperCase() + category.slice(1)} key={category}>
                            <LayerGroup>
                                {markers.map((m, idx) => (
                                    <Marker
                                        key={`${category}-${idx}`}
                                        position={[m.lat, m.lng]}
                                        icon={createCustomIcon(m.type)}
                                    >
                                        {(m.popup || m.name) && renderPopup(m)}
                                    </Marker>
                                ))}
                            </LayerGroup>
                        </LayersControl.Overlay>
                    ))}

                    {showLocations && (
                        <>
                            <LayersControl.Overlay checked name="Towns (Major)">
                                <LayerGroup>
                                    {pueblosImportantes.map((p, i) => (
                                        <Marker
                                            key={i}
                                            position={[p.lat, p.lng]}
                                            icon={L.divIcon({
                                                className: 'pueblo-label',
                                                html: p.name,
                                                iconSize: [100, 40],
                                                iconAnchor: [50, 20]
                                            })}
                                        />
                                    ))}
                                </LayerGroup>
                            </LayersControl.Overlay>
                            <LayersControl.Overlay checked name="Towns (Minor)">
                                <LayerGroup>
                                    {pueblosMenosImportantes.map((p, i) => (
                                        <Marker
                                            key={i}
                                            position={[p.lat, p.lng]}
                                            icon={L.divIcon({
                                                className: 'pueblo-label',
                                                html: p.name,
                                                iconSize: [100, 40],
                                                iconAnchor: [50, 20]
                                            })}
                                        />
                                    ))}
                                </LayerGroup>
                            </LayersControl.Overlay>
                        </>
                    )}
                </LayersControl>

                <MapEvents
                    setMapInstance={setMapInstance}
                    setCoordinates={setCoordinates}
                    setClickedCoords={setClickedCoords}
                    onMapClick={onMapClick}
                />
            </MapContainer>
        </div>
    );
};

export default DeadMatterMap;
