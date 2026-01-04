import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Trophy, Clock, Skull, AlertTriangle } from 'lucide-react';

const MissionDetailModal = ({ mission, onClose }) => {
    if (!mission) return null;

    const difficultyConfig = {
        'Easy': { color: '#4ade80', icon: Trophy, bg: 'bg-green-500/10', border: 'border-green-500/20' },
        'Medium': { color: '#fbbf24', icon: AlertTriangle, bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        'Hard': { color: '#ef4444', icon: Skull, bg: 'bg-red-500/10', border: 'border-red-500/20' }
    };

    const config = difficultyConfig[mission.difficulty] || difficultyConfig['Medium'];
    const Icon = config.icon;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-3xl bg-[#0a0a0c] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Technical Background */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                        style={{
                            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                            backgroundSize: '30px 30px'
                        }}
                    />

                    {/* Header */}
                    <div className="flex justify-between items-start p-6 border-b border-white/5 relative z-10 bg-[#0a0a0c]/50 backdrop-blur-md">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${config.bg} ${config.border} border`}>
                                <Icon size={24} style={{ color: config.color }} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight leading-none mb-2">
                                    {mission.title}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span
                                        className="text-xs font-bold px-2 py-0.5 rounded border uppercase tracking-wider"
                                        style={{
                                            backgroundColor: `${config.color}15`,
                                            borderColor: `${config.color}30`,
                                            color: config.color
                                        }}
                                    >
                                        {mission.difficulty}
                                    </span>
                                    {mission.type && (
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 border-l border-white/10">
                                            {mission.type}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar relative z-10">
                        <div className="prose prose-invert prose-sm max-w-none">
                            <div
                                className="text-gray-300 leading-relaxed font-sans"
                                dangerouslySetInnerHTML={{ __html: mission.content_html || mission.content || '' }}
                            />
                        </div>

                        {/* Rewards Section (if data existed, could go here) */}
                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-gray-500 font-mono">
                            <span className="flex items-center gap-2">
                                <Target size={14} className="text-blue-500" />
                                OBJECTIVE ID: {mission.id.slice(0, 8).toUpperCase()}
                            </span>
                            <span className="flex items-center gap-2">
                                <Clock size={14} />
                                EST. TIME: VARIANT
                            </span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MissionDetailModal;
