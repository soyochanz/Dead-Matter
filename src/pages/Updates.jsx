import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/mySupabaseClient';
import UpdateCard from '@/components/UpdateCard';
import { Loader2, ArrowLeft, Tag, Zap, Wrench, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';

const versionColors = [
    { bg: 'from-blue-600 to-cyan-600', text: 'text-blue-400' },
    { bg: 'from-green-600 to-emerald-600', text: 'text-green-400' },
    { bg: 'from-purple-600 to-violet-600', text: 'text-purple-400' },
    { bg: 'from-yellow-600 to-amber-600', text: 'text-yellow-400' },
    { bg: 'from-red-600 to-rose-600', text: 'text-red-400' },
    { bg: 'from-indigo-600 to-blue-600', text: 'text-indigo-400' },
    { bg: 'from-pink-600 to-rose-600', text: 'text-pink-400' },
];

const VersionTag = ({ version }) => {
    if (!version) return null;

    let hash = 0;
    for (let i = 0; i < version.length; i++) {
        hash = version.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % versionColors.length;
    const { bg } = versionColors[colorIndex];

    return (
        <span className={`flex-shrink-0 ml-4 items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r ${bg} text-white shadow-lg flex items-center`}>
            <Tag className="h-4 w-4 mr-2" />
            {version}
        </span>
    );
};

const UpdatesList = ({ updates }) => {
    if (updates.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
            >
                <div className="bg-[#0a0a0c] border border-white/5 rounded-[2rem] p-12 max-w-md mx-auto shadow-2xl">
                    <Star className="w-16 h-16 text-gray-700 mx-auto mb-6" />
                    <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">No Transmission Found</h3>
                    <p className="text-gray-500 font-medium">Monitoring for new sector updates...</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {updates.map((update, index) => (
                <UpdateCard
                    key={update.id}
                    update={update}
                    index={index}
                    versionTag={<VersionTag version={update.version} />}
                />
            ))}
        </motion.div>
    );
};

const Updates = () => {
    const [majorUpdates, setMajorUpdates] = useState([]);
    const [hotfixes, setHotfixes] = useState([]);
    const [nightlies, setNightlies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUpdates = async () => {
            setLoading(true);

            const fetchCategory = async (categories) => {
                const { data, error } = await supabase
                    .from('updates')
                    .select('id, title, date, version, category, content, slug')
                    .in('category', categories)
                    .order('date', { ascending: false })
                    .limit(10);

                if (error) {
                    console.error('Error fetching updates for', categories, error.message);
                    return [];
                }
                return data || [];
            };

            const [majorData, hotfixData, nightlyData] = await Promise.all([
                fetchCategory(['Major', 'Major updates']),
                fetchCategory(['Hotfix', 'Hotfixes']),
                fetchCategory(['Nightly', 'Nightly updates'])
            ]);

            setMajorUpdates(majorData);
            setHotfixes(hotfixData);
            setNightlies(nightlyData);

            setLoading(false);
        };
        fetchUpdates();
    }, []);

    const tabConfigs = {
        major: {
            icon: Star,
            title: "Major Updates",
            count: majorUpdates.length,
            gradient: "from-purple-600 to-pink-600"
        },
        hotfixes: {
            icon: Wrench,
            title: "Hotfixes",
            count: hotfixes.length,
            gradient: "from-blue-600 to-cyan-600"
        },
        nightlies: {
            icon: Zap,
            title: "Nightly Builds",
            count: nightlies.length,
            gradient: "from-yellow-600 to-amber-600"
        }
    };

    return (
        <>
            <Helmet>
                <title>Updates - Dead Matter Wiki</title>
                <meta name="description" content="Latest news and updates for Dead Matter" />
            </Helmet>

            <div className="max-w-7xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Header */}
                    <div className="mb-8">
                        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group mb-6">
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Home
                        </Link>

                        <div className="text-center mb-8">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase mb-4"
                            >
                                SECTOR <span className="text-red-500">PATCHES</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="text-gray-400 text-lg max-w-2xl mx-auto"
                            >
                                Stay informed with the latest patches, hotfixes, and development updates
                            </motion.p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="text-center">
                                <Loader2 className="w-16 h-16 text-red-500 animate-spin mx-auto mb-4" />
                                <p className="text-gray-400">Loading updates...</p>
                            </div>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <Tabs defaultValue="major" className="w-full">
                                <TabsList className="grid w-full grid-cols-3 mb-12 bg-[#0a0a0c] border border-white/5 rounded-2xl p-1 relative h-16 shadow-xl">
                                    {Object.entries(tabConfigs).map(([key, config]) => (
                                        <TabsTrigger
                                            key={key}
                                            value={key}
                                            className="relative data-[state=active]:text-white transition-all duration-300 rounded-lg py-3 mx-0.5 z-10"
                                            asChild
                                        >
                                            <div className="flex items-center gap-2 justify-center cursor-pointer">
                                                <config.icon className="w-4 h-4" />
                                                <span className="text-sm font-medium">{config.title}</span>
                                                <span className="bg-white/10 px-2 py-1 rounded-full text-xs font-semibold">
                                                    {config.count}
                                                </span>
                                            </div>
                                        </TabsTrigger>
                                    ))}
                                    <motion.div
                                        className="absolute top-1 bottom-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg z-0"
                                        layoutId="activeTab"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                </TabsList>

                                <TabsContent value="major" className="mt-0">
                                    <UpdatesList updates={majorUpdates} />
                                </TabsContent>

                                <TabsContent value="hotfixes" className="mt-0">
                                    <UpdatesList updates={hotfixes} />
                                </TabsContent>

                                <TabsContent value="nightlies" className="mt-0">
                                    <UpdatesList updates={nightlies} />
                                </TabsContent>
                            </Tabs>
                        </motion.div>
                    )}

                    {/* Bottom Navigation */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="flex justify-center mt-12 pt-8 border-t border-white/10"
                    >
                        <Button asChild variant="outline" className="border-white/20 hover:bg-white/10">
                            <Link to="/">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Home
                            </Link>
                        </Button>
                    </motion.div>
                </motion.div>
            </div>
        </>
    );
};

export default Updates;
