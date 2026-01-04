import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, Info, ChevronLeft, Skull, Droplet, Sparkles, HeartPulse, AlertTriangle, ArrowRight, Shield, Crosshair } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const InfoModal = ({ item, open, onOpenChange }) => {
    if (!item) return null;
    const isMedicine = 'health' in item || 'hydration' in item || 'energy' in item;
    const hasSideEffects = item.side_effects && Object.keys(item.side_effects).length > 0;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-3xl text-white max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                        {isMedicine ? (
                            <div className="p-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600">
                                <HeartPulse className="w-6 h-6 text-white" />
                            </div>
                        ) : (
                            <div className="p-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600">
                                <Skull className="w-6 h-6 text-white" />
                            </div>
                        )}
                        {item.name}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-300 pt-4 text-base leading-relaxed">
                        {item.description || "No description available."}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                
                {isMedicine && (
                     <div className="space-y-3 pt-4 border-t border-white/10">
                        {(item.health !== 0) && (
                            <div className="flex justify-between items-center py-2 px-3 bg-white/5 rounded-xl">
                                <span className="flex items-center gap-3 text-gray-300">
                                    <HeartPulse size={20} className="text-green-400"/> 
                                    <span className="font-medium">Health</span>
                                </span>
                                <span className={`font-bold text-lg ${item.health > 0 ? "text-green-400" : "text-red-400"}`}>
                                    {item.health > 0 ? `+${item.health}`: item.health}
                                </span>
                            </div>
                        )}
                        {(item.hydration !== 0) && (
                            <div className="flex justify-between items-center py-2 px-3 bg-white/5 rounded-xl">
                                <span className="flex items-center gap-3 text-gray-300">
                                    <Droplet size={20} className="text-blue-400"/> 
                                    <span className="font-medium">Hydration</span>
                                </span>
                                <span className={`font-bold text-lg ${item.hydration > 0 ? "text-blue-400" : "text-red-400"}`}>
                                    {item.hydration > 0 ? `+${item.hydration}`: item.hydration}
                                </span>
                            </div>
                        )}
                        {(item.energy !== 0) && (
                            <div className="flex justify-between items-center py-2 px-3 bg-white/5 rounded-xl">
                                <span className="flex items-center gap-3 text-gray-300">
                                    <Sparkles size={20} className="text-yellow-400"/> 
                                    <span className="font-medium">Energy</span>
                                </span>
                                <span className={`font-bold text-lg ${item.energy > 0 ? "text-yellow-400" : "text-red-400"}`}>
                                    {item.energy > 0 ? `+${item.energy}`: item.energy}
                                </span>
                            </div>
                        )}
                     </div>
                )}
                
                {hasSideEffects && (
                    <div className="pt-4 border-t border-white/10">
                        <h4 className="font-semibold text-gray-300 flex items-center gap-3 mb-3 text-lg">
                            <div className="p-1.5 rounded-lg bg-yellow-500/20">
                                <AlertTriangle className="text-yellow-400" size={20}/>
                            </div>
                            Side Effects
                        </h4>
                        <div className="space-y-2 text-base">
                            {Object.entries(item.side_effects).map(([key, value]) => (
                                <div key={key} className="bg-white/5 rounded-xl p-3">
                                    <span className="font-bold text-yellow-400 block mb-1">{key}:</span>
                                    <span className="text-gray-300">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <AlertDialogFooter className="mt-6">
                    <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300">
                        Close
                    </AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

const MedsPage = () => {
    const [medicines, setMedicines] = useState([]);
    const [diseases, setDiseases] = useState([]);
    const [relations, setRelations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedDisease, setSelectedDisease] = useState(null);
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: medData } = await supabase.from('medicines').select('*, rarity:rarities(name, color)').order('name');
            const { data: diseaseData } = await supabase.from('diseases').select('*').order('name');
            const { data: relationData } = await supabase.from('medicine_treats_disease').select('*');
            
            setMedicines(medData || []);
            setDiseases(diseaseData || []);
            setRelations(relationData || []);
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleItemClick = (item) => {
        setSelectedItem(item.id === selectedItem?.id ? null : item);
        setSelectedDisease(null);
    };

    const handleDiseaseClick = (disease) => {
        setSelectedDisease(disease.id === selectedDisease?.id ? null : disease);
        setSelectedItem(null);
    };

    const openInfoModal = (item) => {
        setModalContent(item);
        setInfoModalOpen(true);
    };

    const getTreatedDiseases = (medId) => {
        const diseaseIds = relations.filter(r => r.medicine_id === medId).map(r => r.disease_id);
        return diseases.filter(d => diseaseIds.includes(d.id));
    };

    const getCuringMedicines = (diseaseId) => {
        const medIds = relations.filter(r => r.disease_id === diseaseId).map(r => r.medicine_id);
        return medicines.filter(m => medIds.includes(m.id));
    };

    const highlightedMedicines = selectedDisease ? getCuringMedicines(selectedDisease.id) : [];
    const highlightedDiseases = selectedItem ? getTreatedDiseases(selectedItem.id) : [];
    
    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-center">
                <Loader2 className="w-16 h-16 text-red-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading medical database...</p>
            </div>
        </div>
    );

    const noSelectionActive = !selectedItem && !selectedDisease;

    return (
        <>
            <Helmet>
                <title>Medical Guide - Dead Matter Wiki</title>
                <meta name="description" content="Complete medical guide for diseases and medicines in Dead Matter" />
            </Helmet>
            
            <div className="max-w-7xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Header Section */}
                    <div className="text-center mb-12">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8">
                            <motion.h1 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="text-4xl md:text-5xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
                            >
                                Medical Guide
                            </motion.h1>
                            
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <Button asChild variant="outline" className="border-white/20 hover:bg-white/10 text-white">
                                    <Link to="/wiki">
                                        <ChevronLeft className="mr-2 h-4 w-4" /> 
                                        Back to Wiki
                                    </Link>
                                </Button>
                            </motion.div>
                        </div>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="text-gray-400 text-lg max-w-2xl mx-auto"
                        >
                            Discover diseases and their cures. Select items to see treatment relationships.
                        </motion.p>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* Diseases Section */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-3xl p-8"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600">
                                    <Skull className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-white">Diseases & Infections</h2>
                                <span className="bg-white/10 px-3 py-1 rounded-full text-sm font-semibold">
                                    {diseases.length}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <AnimatePresence>
                                    {diseases.map((disease, index) => {
                                        const isSelected = selectedDisease?.id === disease.id;
                                        const isHighlighted = highlightedDiseases.some(d => d.id === disease.id);
                                        const isDimmed = !noSelectionActive && !isSelected && !isHighlighted;

                                        return (
                                            <motion.div
                                                key={disease.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                                className={`relative group cursor-pointer transition-all duration-300 ${
                                                    isDimmed ? 'opacity-30' : 'opacity-100'
                                                }`}
                                                onClick={() => handleDiseaseClick(disease)}
                                            >
                                                <div className={`relative overflow-hidden rounded-2xl p-4 border-2 transition-all duration-300 ${
                                                    isSelected 
                                                        ? 'bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-900/50' 
                                                        : isHighlighted 
                                                        ? 'bg-green-500/20 border-green-500 shadow-lg shadow-green-900/50'
                                                        : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                                                }`}>
                                                    
                                                    {/* Efecto de fondo */}
                                                    <div className={`absolute inset-0 opacity-20 transition-opacity duration-300 ${
                                                        isSelected ? 'bg-blue-500' : isHighlighted ? 'bg-green-500' : 'bg-transparent'
                                                    }`} />
                                                    
                                                    <div className="relative z-10">
                                                        <div className="h-24 w-full flex items-center justify-center mb-3">
                                                            <img 
                                                                src={disease.image_url} 
                                                                alt={disease.name} 
                                                                className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300" 
                                                            />
                                                        </div>
                                                        
                                                        <p className="text-center text-sm font-semibold text-white truncate">
                                                            {disease.name}
                                                        </p>
                                                        
                                                        {disease.is_lethal && (
                                                            <div className="absolute top-2 left-2 bg-red-500/20 backdrop-blur-sm p-1.5 rounded-full border border-red-500/50">
                                                                <Skull className="h-4 w-4 text-red-400" title="Lethal"/>
                                                            </div>
                                                        )}
                                                        
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); openInfoModal(disease); }} 
                                                            className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/70 border border-white/20"
                                                        >
                                                            <Info className="h-4 w-4 text-white"/>
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                        
                        {/* Medicines Section */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-3xl p-8"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600">
                                    <HeartPulse className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-white">Medicines & Treatments</h2>
                                <span className="bg-white/10 px-3 py-1 rounded-full text-sm font-semibold">
                                    {medicines.length}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <AnimatePresence>
                                    {medicines.map((med, index) => {
                                        const isSelected = selectedItem?.id === med.id;
                                        const isHighlighted = highlightedMedicines.some(m => m.id === med.id);
                                        const isDimmed = !noSelectionActive && !isSelected && !isHighlighted;
                                        const rarityColor = med.rarity?.color || '#4b5563';

                                        return (
                                            <motion.div
                                                key={med.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                                className={`relative group cursor-pointer transition-all duration-300 ${
                                                    isDimmed ? 'opacity-30' : 'opacity-100'
                                                }`}
                                                onClick={() => handleItemClick(med)}
                                            >
                                                <div 
                                                    className={`relative overflow-hidden rounded-2xl p-4 border-2 transition-all duration-300 ${
                                                        isSelected 
                                                            ? 'bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-900/50' 
                                                            : isHighlighted 
                                                            ? 'bg-green-500/20 border-green-500 shadow-lg shadow-green-900/50'
                                                            : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                                                    }`}
                                                    style={{
                                                        borderBottomColor: isSelected || isHighlighted ? 'transparent' : rarityColor,
                                                        borderBottomWidth: '4px'
                                                    }}
                                                >
                                                    
                                                    {/* Efecto de fondo de rareza */}
                                                    <div 
                                                        className="absolute inset-0 opacity-10 transition-opacity duration-300"
                                                        style={{ backgroundColor: rarityColor }}
                                                    />
                                                    
                                                    <div className="relative z-10">
                                                        <div className="h-24 w-full flex items-center justify-center mb-3">
                                                            <img 
                                                                src={med.image_url} 
                                                                alt={med.name} 
                                                                className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300" 
                                                            />
                                                        </div>
                                                        
                                                        <div className="text-center">
                                                            <p className="text-sm font-semibold text-white truncate mb-2">
                                                                {med.name}
                                                            </p>
                                                            {med.rarity && (
                                                                <span 
                                                                    className="text-xs font-bold px-2 py-1 rounded-full bg-white/10"
                                                                    style={{ color: rarityColor }}
                                                                >
                                                                    {med.rarity.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); openInfoModal(med); }} 
                                                            className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/70 border border-white/20"
                                                        >
                                                            <Info className="h-4 w-4 text-white"/>
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>

                    {/* Selection Info */}
                    {(selectedItem || selectedDisease) && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 bg-gradient-to-r from-red-600/10 to-orange-600/10 border border-red-500/20 rounded-2xl p-6 text-center"
                        >
                            <p className="text-white font-semibold">
                                {selectedItem 
                                    ? `Selected: ${selectedItem.name} - Treats ${highlightedDiseases.length} disease${highlightedDiseases.length !== 1 ? 's' : ''}`
                                    : `Selected: ${selectedDisease.name} - Cured by ${highlightedMedicines.length} medicine${highlightedMedicines.length !== 1 ? 's' : ''}`
                                }
                            </p>
                            <p className="text-gray-400 text-sm mt-2">
                                Click on another item to see different relationships, or click the same item to deselect.
                            </p>
                        </motion.div>
                    )}

                    {/* Bottom Navigation */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                        className="flex justify-center mt-12 pt-8 border-t border-white/10"
                    >
                        <Button asChild variant="outline" className="border-white/20 hover:bg-white/10">
                            <Link to="/wiki">
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Back to Wiki Categories
                            </Link>
                        </Button>
                    </motion.div>
                </motion.div>
            </div>
            
            <InfoModal item={modalContent} open={infoModalOpen} onOpenChange={setInfoModalOpen} />
        </>
    );
};

export default MedsPage;