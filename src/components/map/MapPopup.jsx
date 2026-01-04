import React from 'react';

const MapPopup = ({ marker, tags }) => {
    const infectedColors = {
        high: '#ff3b3b',
        medium: '#ffb341',
        low: '#4aff4f',
        none: '#ccc'
    };
    const infectedColor = infectedColors[marker.infected_level?.toLowerCase()] || '#ccc';

    return (
        <div className="w-80 max-w-[90vw] text-white font-sans">
            {marker.image_url && (
                <img
                    src={marker.image_url}
                    alt={marker.title}
                    className="w-full rounded-xl mb-3 object-cover max-h-48"
                />
            )}
            <h3 className="text-xl font-extrabold mb-2 text-white">{marker.title}</h3>
            {marker.description && (
                <p className="text-sm mb-3 text-gray-300 leading-relaxed">
                    {marker.description}
                </p>
            )}

            {(tags && tags.length > 0) && (
                <div className="mb-3">
                    <h4 className="font-bold mb-2 text-white">Loot</h4>
                    {tags.map((tag) => (
                        <div key={tag.id} className="flex items-center gap-2 mb-1.5 text-sm">
                            <span
                                className="w-4 h-4 rounded border-2 border-white/30"
                                style={{ backgroundColor: tag.color || '#ffffff' }}
                            />
                            {tag.label}
                        </div>
                    ))}
                </div>
            )}

            {marker.infected_level && (
                <div className="mt-3 text-sm font-bold text-white">
                    <strong>Infected: </strong>
                    <span style={{ color: infectedColor, textTransform: 'capitalize' }}>
                        {marker.infected_level} pop
                    </span>
                </div>
            )}
        </div>
    );
};

export default MapPopup;
