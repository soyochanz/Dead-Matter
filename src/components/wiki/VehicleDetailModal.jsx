import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Car, Gauge, Users, Fuel, Heart, Package, 
    Wrench, Loader2, Shield, Zap, MapPin, Settings 
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { supabase } from '@/lib/mySupabaseClient';

const Stat = ({ icon: Icon, label, value, unit, colorClass = 'text-white' }) => (
    <div className="flex items-center justify-between py-3 px-4 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-center gap-3 text-gray-300">
            <Icon size={18} className="text-blue-400" />
            <span className="text-sm font-medium">{label}</span>
        </div>
        <span className={`text-base font-bold ${colorClass}`}>
            {value} {unit && <span className="text-sm text-gray-400">{unit}</span>}
        </span>
    </div>
);

const CustomStatBar = ({ label, value, max, icon, color }) => {
    const percentage = max > 0 && value > 0 ? (value / max) * 100 : 0;
    const IconComponent = LucideIcons[icon] || null;

    return (
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    {IconComponent && <IconComponent className="w-4 h-4" style={{ color }} />}
                    <span className="text-sm font-medium text-gray-300">{label}</span>
                </div>
                <span className="font-bold text-white text-sm">{value} / {max}</span>
            </div>
            <div className="w-full bg-black/40 rounded-full h-2.5">
                <motion.div 
                    className="h-2.5 rounded-full shadow-lg"
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
                setMechanics(data);
            }
            setLoading(false);
        };
        fetchMechanics();
    }, [vehicleId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin mr-2" />
                <span className="text-gray-400">Loading mechanics...</span>
            </div>
        );
    }

    if (mechanics.length === 0) {
        return null;
    }

    return (
        <div className="mt-8">
            <div className="flex items-center gap-3 mb-6">
                <Settings className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-bold text-white">Required Components</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mechanics.map(({ quantity, component }, index) => (
                    <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4 bg-gradient-to-r from-green-500/10 to-emerald-500/5 p-4 rounded-xl border border-green-500/20 hover:border-green-500/40 transition-all duration-300"
                    >
                        <div className="w-14 h-14 bg-black/30 rounded-lg flex items-center justify-center flex-shrink-0 border border-green-500/20">
                            {component.image_url ? (
                                <img 
                                    src={component.image_url} 
                                    alt={component.name} 
                                    className="w-10 h-10 object-contain" 
                                />
                            ) : (
                                <Wrench className="w-6 h-6 text-green-400" />
                            )}
                        </div>
                        <div className="flex-grow min-w-0">
                            <p className="font-semibold text-white truncate">{component.name}</p>
                            <p className="text-xs text-gray-400 mt-1">Required component</p>
                        </div>
                        <div className="text-lg font-bold text-green-400 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
                            x{quantity}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const TowableDetailModal = ({ item, onClose }) => {
    if (!item) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="relative p-8 pb-0">
                        <button 
                            onClick={onClose} 
                            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-lg border border-white/10"
                        >
                            <X size={20} />
                        </button>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Imagen y información principal */}
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-3xl font-bold text-white mb-2">{item.name}</h2>
                                    {item.subcategory && (
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
                                            <Car size={14} className="text-blue-400" />
                                            <span className="text-sm text-blue-300">{item.subcategory.name}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
                                    <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center p-4">
                                        {item.image_url ? (
                                            <img 
                                                src={item.image_url} 
                                                alt={item.name} 
                                                className="max-h-64 max-w-full object-contain drop-shadow-2xl" 
                                            />
                                        ) : (
                                            <Car className="w-32 h-32 text-gray-600" />
                                        )}
                                    </div>
                                </div>

                                {item.description && (
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                        <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Especificaciones */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-6 h-6 text-red-400" />
                                    <h3 className="text-xl font-bold text-white">Towable Information</h3>
                                </div>

                                <div className="space-y-3">
                                    {item.capacity && (
                                        <Stat icon={Package} label="Capacity" value={item.capacity} colorClass="text-blue-300" />
                                    )}
                                    
                                    {item.use_case && (
                                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                                            <div className="flex items-start gap-3">
                                                <Wrench size={18} className="text-purple-400 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <span className="text-sm font-medium text-purple-300">Use Case</span>
                                                    <p className="text-white font-semibold mt-1 leading-relaxed">{item.use_case}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {item.stats && item.stats.length > 0 && (
                                    <div className="mt-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Zap className="w-5 h-5 text-yellow-400" />
                                            <h3 className="text-lg font-bold text-white">Custom Stats</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {item.stats.map(stat => (
                                                <CustomStatBar 
                                                    key={stat.label} 
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
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const VehicleDetailModal = ({ item, onClose }) => {
    if (!item) return null;

    const isTowable = item.subcategory?.name?.toLowerCase().includes('towable');
    if (isTowable) {
        return <TowableDetailModal item={item} onClose={onClose} />;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 border border-white/10 rounded-3xl w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="relative p-8 pb-0">
                        <button 
                            onClick={onClose} 
                            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-lg border border-white/10"
                        >
                            <X size={20} />
                        </button>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Imagen y información principal */}
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-3xl font-bold text-white mb-2">{item.name}</h2>
                                    {item.subcategory && (
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
                                            <Car size={14} className="text-red-400" />
                                            <span className="text-sm text-red-300">{item.subcategory.name}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
                                    <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center p-4">
                                        {item.image_url ? (
                                            <img 
                                                src={item.image_url} 
                                                alt={item.name} 
                                                className="max-h-64 max-w-full object-contain drop-shadow-2xl" 
                                            />
                                        ) : (
                                            <Car className="w-32 h-32 text-gray-600" />
                                        )}
                                    </div>
                                </div>

                                {item.description && (
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                        <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Especificaciones */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <Gauge className="w-6 h-6 text-red-400" />
                                    <h3 className="text-xl font-bold text-white">Vehicle Specifications</h3>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    <Stat icon={Gauge} label="Max Speed" value={item.speed || 'N/A'} unit="km/h" colorClass="text-red-300" />
                                    <Stat icon={Users} label="Occupants" value={item.occupants || 'N/A'} colorClass="text-green-300" />
                                    <Stat icon={Fuel} label="Fuel Capacity" value={item.fuel_capacity || 'N/A'} unit="L" colorClass="text-blue-300" />
                                    <Stat icon={Heart} label="Health" value={item.health || 'N/A'} colorClass="text-pink-300" />
                                    <Stat icon={Package} label="Inventory Slots" value={item.inventory_slots || 0} colorClass="text-purple-300" />
                                </div>

                                {item.stats && item.stats.length > 0 && (
                                    <div className="mt-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Zap className="w-5 h-5 text-yellow-400" />
                                            <h3 className="text-lg font-bold text-white">Performance Stats</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {item.stats.map(stat => (
                                                <CustomStatBar 
                                                    key={stat.label} 
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
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default VehicleDetailModal;
