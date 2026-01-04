import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, DollarSign, TrendingUp, MapPin, ArrowRight, DoorOpen } from 'lucide-react';
import { supabase } from '@/lib/mySupabaseClient';
import NpcSellersModal from '@/components/wiki/NpcSellersModal';
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Stat = ({ icon: Icon, label, value, colorClass = 'text-white', onClick, className = '' }) => (
    <div 
        className={`flex justify-between items-center text-sm py-3 px-4 rounded-xl transition-all duration-300 ${
            onClick ? 'cursor-pointer hover:bg-white/10 group' : 'bg-white/5'
        } ${className}`} 
        onClick={onClick}
    >
        <div className="flex items-center gap-3 text-gray-400 group-hover:text-white transition-colors">
            {Icon && <Icon size={18} className="flex-shrink-0" />}
            <span className="font-medium">{label}</span>
        </div>
        <span className={`font-bold text-lg ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
            {value}
        </span>
    </div>
);

const KeyDetailModal = ({ item, onClose, onNpcSelect }) => {
    const [doors, setDoors] = useState([]);
    const [selectedDoorImage, setSelectedDoorImage] = useState(null);
    const [showNpcSellers, setShowNpcSellers] = useState(false);

    useEffect(() => {
        const fetchDoors = async () => {
            const { data } = await supabase.from('key_doors').select('*').eq('key_id', item.id);
            setDoors(data || []);
        };
        fetchDoors();
    }, [item.id]);
    
    if (!item) return null;

    const rarityColor = item.rarity?.color || '#4b5563';

    return (
        <AnimatePresence>
             <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4" 
                onClick={onClose}
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 50 }} 
                    animate={{ scale: 1, y: 0 }} 
                    exit={{ scale: 0.9, y: 50 }} 
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-4xl max-h-[95vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                     {/* Background Effects */}
                    <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at top right, ${rarityColor}, transparent 70%)` }} />
                    
                    <div className="relative bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex flex-col max-h-[95vh]">
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-white/10 z-10">
                            <motion.button 
                                onClick={onClose}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/10"
                            >
                                <X size={24} />
                            </motion.button>
                            
                             {item.rarity && (
                                <div 
                                    className="px-4 py-1.5 rounded-full text-white font-bold text-sm shadow-lg flex items-center gap-2 border border-white/10"
                                    style={{ backgroundColor: `${rarityColor}40`, borderColor: rarityColor }}
                                >
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: rarityColor }} />
                                    {item.rarity.name}
                                </div>
                            )}
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column - Image */}
                                <div className="flex flex-col items-center">
                                    <div className="w-full aspect-square bg-black/30 rounded-2xl flex items-center justify-center p-8 relative overflow-hidden border border-white/5 mb-6">
                                         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/10 to-gray-900/30" />
                                         {item.image_url ? 
                                            <img src={item.image_url} alt={item.name} className="max-h-full max-w-full object-contain drop-shadow-2xl relative z-10" /> : 
                                            <Key className="w-32 h-32 text-gray-600 relative z-10"/>
                                         }
                                    </div>
                                </div>

                                {/* Right Column - Info */}
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-3xl font-bold text-white mb-2">{item.name}</h2>
                                        <p className="text-gray-400 text-sm">Key Item</p>
                                    </div>

                                    {/* Price Stats */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <Stat 
                                            icon={DollarSign} 
                                            label="Buy Price" 
                                            value={`${item.price || 'N/A'} $`} 
                                            colorClass="text-red-400" 
                                            onClick={() => setShowNpcSellers(true)} 
                                            className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20" 
                                        />
                                        <Stat 
                                            icon={TrendingUp} 
                                            label="Sell Price" 
                                            value={`${item.sell_price || 'N/A'} $`} 
                                            colorClass="text-green-400"
                                            className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20"
                                        />
                                    </div>

                                    {/* Spawn Info */}
                                    <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                                        <div className="flex items-center gap-2 mb-2 text-blue-400">
                                            <MapPin size={18} />
                                            <h3 className="font-bold">Spawn Locations</h3>
                                        </div>
                                        <p className="text-gray-300 leading-relaxed text-sm">
                                            {item.spawn_locations || 'Unknown locations'}
                                        </p>
                                    </div>

                                    {/* Doors Section */}
                                    <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                                        <div className="flex items-center gap-2 mb-3 text-purple-400">
                                            <DoorOpen size={18} />
                                            <h3 className="font-bold">Unlocks Doors</h3>
                                        </div>
                                        
                                        {doors.length > 0 ? (
                                            <ul className="space-y-2">
                                                {doors.map(d => (
                                                    <li 
                                                        key={d.id} 
                                                        onClick={() => setSelectedDoorImage(d.door_image_url)} 
                                                        className="flex items-center justify-between group cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors"
                                                    >
                                                        <span className="text-gray-300 group-hover:text-white transition-colors">{d.door_description}</span>
                                                        <div className="flex items-center gap-1 text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            View Image <ArrowRight size={12} />
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-500 italic text-sm">No specific doors recorded yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
             </motion.div>

             {/* Door Image Dialog */}
             <Dialog open={!!selectedDoorImage} onOpenChange={() => setSelectedDoorImage(null)}>
                <DialogContent className="p-0 bg-transparent border-none max-w-4xl w-auto h-auto shadow-none overflow-hidden flex items-center justify-center">
                     {selectedDoorImage && (
                         <div className="relative rounded-lg overflow-hidden shadow-2xl border border-white/10">
                            <img src={selectedDoorImage} alt="Door Location" className="max-w-[90vw] max-h-[85vh] object-contain bg-black" />
                            <button 
                                onClick={() => setSelectedDoorImage(null)}
                                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                            >
                                <X size={20} />
                            </button>
                         </div>
                     )}
                </DialogContent>
             </Dialog>

             {showNpcSellers && <NpcSellersModal itemType="keys" itemId={item.id} onClose={() => setShowNpcSellers(false)} onNpcSelect={onNpcSelect} />}
        </AnimatePresence>
    )
};

export default KeyDetailModal;
