import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Car, Gauge, Users, Fuel, Heart, Package,
    Wrench, Loader2, Shield, Zap, MapPin, Settings
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { supabase } from '@/lib/mySupabaseClient';

const StatDisplay = ({ icon: Icon, label, value, subValue, color = "text-white", delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white/[0.03] border border-white/10 p-3 rounded-xl flex items-center justify-between group hover:border-white/20 transition-colors"
    >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-white/5 ${color.replace('text-', 'bg-')}/10`}>
                {Icon && <Icon size={16} className={color} />}
            </div>
            <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium tracking-wide uppercase">{label}</span>
            </div>
        </div>
        <div className="flex items-baseline gap-1.5 text-right">
            <span className="text-lg font-bold text-white tracking-tight">{value}</span>
            {subValue && <span className="text-xs font-bold text-gray-500 uppercase">{subValue}</span>}
        </div>
    </motion.div>
);

const CustomStatBar = ({ label, value, max, icon, color }) => {
    const percentage = max > 0 && value > 0 ? (value / max) * 100 : 0;
    const IconComponent = LucideIcons[icon] || Zap;

    return (
        <div className="bg-white/[0.03] rounded-lg p-3 border border-white/10">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <IconComponent className="w-3.5 h-3.5" style={{ color }} />
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
                </div>
                <span className="font-bold text-white text-xs">{value} / {max}</span>
            </div>
            <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    style={{ background: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />
            </div>
        </div>
    );
};

const MechanicsSection = ({ vehicleId }) => {
    const [mechanics, setMechanics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMechanics = async () => {
            if (!vehicleId) return;
            setLoading(true);
            const { data, error } = await supabase
                .from('vehicle_required_components')
                .select('quantity, component:vehicle_components(name, image_url)')
                .eq('vehicle_id', vehicleId);

            if (error) {
                console.error("Error fetching vehicle mechanics:", error);
            } else {
                setMechanics(data || []);
            }
            setLoading(false);
        };
        fetchMechanics();
    }, [vehicleId]);

    if (loading) return null;
    if (mechanics.length === 0) return null;

    return (
        <div className="mt-8 pt-8 border-t border-white/5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Wrench size={14} className="text-orange-500" />
                Required Components
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mechanics.map(({ quantity, component }, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 bg-white/[0.02] p-2.5 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
                    >
                        <div className="w-10 h-10 bg-black/30 rounded flex items-center justify-center flex-shrink-0 border border-white/5">
                            {component.image_url ? (
                                <img src={component.image_url} alt={component.name} className="w-8 h-8 object-contain" />
                            ) : (
                                <Settings className="w-5 h-5 text-gray-600" />
                            )}
                        </div>
                        <div className="flex-grow min-w-0">
                            <p className="font-medium text-sm text-gray-200 truncate">{component.name}</p>
                            <span className="text-[10px] text-gray-500 uppercase">Mechanical Part</span>
                        </div>
                        <div className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                            x{quantity}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const VehicleDetailModal = ({ item, onClose }) => {
    if (!item) return null;

    const isTowable = item.subcategory?.name?.toLowerCase().includes('towable') || false;
    const accentColor = isTowable ? '#a855f7' : '#3b82f6';

    const modalContent = (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column: Image/Visuals */}
            <div className="space-y-6">
                <div className="relative aspect-video rounded-xl bg-black/40 border border-white/10 flex items-center justify-center p-8 overflow-hidden group">
                    {/* Background Grid */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent)]" />

                    {item.image_url ? (
                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            src={item.image_url}
                            alt={item.name}
                            className="max-h-full max-w-full object-contain drop-shadow-2xl relative z-10"
                        />
                    ) : (
                        <Car className="w-32 h-32 text-gray-700 relative z-10" />
                    )}

                    {/* Subtle Scanline */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[10%] w-full animate-scan pointer-events-none" />
                </div>

                {item.description && (
                    <div className="bg-white/[0.03] border border-white/10 p-4 rounded-xl text-sm text-gray-300 leading-relaxed font-mono">
                        {item.description}
                    </div>
                )}
            </div>

            {/* Right Column: Specs */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Gauge size={14} className="text-blue-500" />
                        Specifications
                    </h3>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {isTowable ? (
                            <>
                                <StatDisplay icon={Package} label="Capacity" value={item.capacity || 'N/A'} color="text-purple-400" />
                                <StatDisplay icon={Wrench} label="Use Case" value={item.use_case} color="text-gray-400" />
                            </>
                        ) : (
                            <>
                                <StatDisplay icon={Gauge} label="Max Speed" value={item.speed || '-'} subValue="km/h" color="text-cyan-400" />
                                <StatDisplay icon={Users} label="Seats" value={item.occupants || '-'} color="text-green-400" />
                                <StatDisplay icon={Fuel} label="Fuel" value={item.fuel_capacity || '-'} subValue="L" color="text-orange-400" />
                                <StatDisplay icon={Package} label="Storage" value={item.inventory_slots || '0'} subValue="Slots" color="text-blue-400" />
                            </>
                        )}
                        <StatDisplay icon={Heart} label="Health" value={item.health || 'Standard'} color="text-rose-400" />
                    </div>

                    {item.stats && item.stats.length > 0 && (
                        <div className="space-y-3 pt-6 border-t border-white/5">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Zap size={14} className="text-yellow-500" />
                                Performance
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {item.stats.map((stat, i) => (
                                    <CustomStatBar
                                        key={i}
                                        label={stat.label}
                                        value={stat.value}
                                        max={stat.max}
                                        icon={stat.icon}
                                        color={stat.color}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <MechanicsSection vehicleId={item.id} />
                </div>
            </div>
        </div>
    );

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
                onClick={onClose}
            >
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-5xl max-h-[95vh] flex flex-col bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Technical Overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px]" />
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-10 pointer-events-none rounded-full blur-[100px]" style={{ background: `radial-gradient(circle, ${accentColor}, transparent 70%)` }} />

                    {/* Header */}
                    <div className="flex justify-between items-start p-6 md:p-8 pb-0 z-10">
                        <div className="space-y-1">
                            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-none">
                                {item.name}
                            </h2>
                            <div className="flex items-center gap-2">
                                {item.subcategory && (
                                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-white/10 text-white/80 border border-white/5 uppercase tracking-wider">
                                        {item.subcategory.name}
                                    </span>
                                )}

                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/5">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:p-8 z-10 custom-scrollbar">
                        {modalContent}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default VehicleDetailModal;
