import React from 'react';
import { Helmet } from 'react-helmet';
import InteractiveMap from '@/components/map/InteractiveMap';

const MapPage = () => {
    return (
        <>
            <Helmet>
                <title>Dead Matter Map | Interactive Map, Loot Locations, POIs & Spawn Points</title>
                <meta
                    name="description"
                    content="Explore the complete Dead Matter interactive map: loot locations, POIs, safehouses, spawn points, bunkers, vehicles, and hidden areas. Updated with the latest game data."
                />
            </Helmet>

            <div className="h-screen w-full overflow-hidden relative">
                <InteractiveMap />
            </div>
        </>
    );
};

export default MapPage;
