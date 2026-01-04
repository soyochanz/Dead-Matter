import React from 'react';
import { motion } from 'framer-motion';
import { Car, Users, Package, Wrench, ArrowRight, Fuel, Gauge, Truck } from 'lucide-react';

const VehicleCard = ({ item, index, onClick }) => {
    if (!item) {
        return null;
    }

    // Safely access properties with optional chaining and provide default values.
    const isTowable = item.subcategory?.name?.toLowerCase().includes('towable') || false;
    const name = item.name || 'Unknown Vehicle';
    const imageUrl = item.image_url;
    const capacity = item.capacity;
    const inventorySlots = item.inventory_slots || 0;
    const subcategoryName = item.subcategory?.name || 'N/A';
    const useCase = item.use_case;
    const occupants = item.occupants;
    const speed = item.speed;
    const fuelCapacity = item.fuel_capacity;

    const getVehicleIcon = () => {
        if (isTowable) return Package;
        if (subcategoryName.toLowerCase().includes('truck')) return Truck;
        return Car;
    };

    const VehicleIcon = getVehicleIcon();

    // Subtle accent color system for small highlights only
    const getAccentColor = () => {
        if (isTowable) return '#a855f7'; // Purple
        if (subcategoryName.toLowerCase().includes('truck')) return '#f97316'; // Orange
        return '#3b82f6'; // Blue
    };

    const accentColor = getAccentColor();

    // Filter valid stats
    const validStats = [
        !isTowable && occupants != null && occupants > 0 && {
            icon: Users,
            value: occupants,
            label: "Seats"
        },
        speed && speed > 0 && {
            icon: Gauge,
            value: speed,
            label: "km/h"
        },
        fuelCapacity && fuelCapacity > 0 && {
            icon: Fuel,
            value: fuelCapacity,
            label: "L"
        }
    ].filter(Boolean);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={onClick}
            className="group relative h-full bg-[#0a0a0c] border border-white/5 hover:border-white/20 rounded-xl overflow-hidden cursor-pointer transition-colors duration-300"
        >
            {/* Rarity/Type Line */}
            <div
                className="absolute top-0 left-0 w-full h-[1px] opacity-30 group-hover:opacity-100 transition-opacity duration-300"
                style={{ backgroundColor: accentColor }}
            />

            {/* Subtle Glow */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at center, ${accentColor}, transparent 70%)`
                }}
            />

            <div className="relative h-44 bg-black/40 flex items-center justify-center p-6 overflow-hidden">
                {/* Technical Grid Background */}
                <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />

                {imageUrl ? (
                    <img
                        className="relative z-10 max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
                        alt={name}
                        src={imageUrl}
                    />
                ) : (
                    <div className="relative z-10 p-4 rounded-xl bg-white/5 border border-white/5 text-gray-500 group-hover:text-gray-400 transition-colors">
                        <VehicleIcon className="w-12 h-12" strokeWidth={1.5} />
                    </div>
                )}

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap gap-2">
                    {/* Consistent clean badges instead of colorful bubbles */}
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white/80 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded border border-white/5 uppercase tracking-wider">
                        <VehicleIcon size={12} className="text-white/60" />
                        {subcategoryName}
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-white/5 relative z-10 flex flex-col h-[calc(100%-11rem)]">
                <div className="mb-4">
                    <h3 className="text-lg font-medium text-white group-hover:text-blue-200 transition-colors tracking-tight leading-tight line-clamp-1 mb-1">
                        {name}
                    </h3>
                    {isTowable && useCase && (
                        <p className="text-xs text-gray-500 line-clamp-1 flex items-center gap-1.5 mt-1">
                            <Wrench size={10} /> {useCase}
                        </p>
                    )}
                </div>

                {/* Simplified Stats Grid */}
                <div className="mt-auto grid grid-cols-2 gap-2 text-xs text-gray-400">
                    {validStats.slice(0, 4).map((stat, i) => (
                        <div key={i} className="flex items-center gap-2 bg-white/[0.02] rounded px-2 py-1.5 border border-white/5">
                            <stat.icon size={12} style={{ color: accentColor }} className="opacity-80" />
                            <span className="font-medium text-gray-300">{stat.value}</span>
                        </div>
                    ))}
                    {inventorySlots > 0 && (
                        <div className="flex items-center gap-2 bg-white/[0.02] rounded px-2 py-1.5 border border-white/5">
                            <Package size={12} className="text-emerald-400 opacity-80" />
                            <span className="font-medium text-gray-300">{inventorySlots} Slots</span>
                        </div>
                    )}
                </div>

                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                    <span>VEHICLE CLASS</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-blue-400">
                        INSPECT <ArrowRight size={10} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default VehicleCard;
