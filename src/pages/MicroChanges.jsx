import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/mySupabaseClient';
import { 
  Loader2, ArrowLeft, GitCommit, Sword, Map, Settings, 
  Users, Activity, Filter, Search, Calendar, Hash, 
  ChevronRight, ExternalLink, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const MicroChanges = () => {
  const [commits, setCommits] = useState([]);
  const [filteredCommits, setFilteredCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const { i18n } = useTranslation();

  const categories = [
    { id: 'all', label: 'All Updates', icon: GitCommit, color: '#ef4444' },
    { id: 'weapons', label: 'Weapons', icon: Sword, color: '#f87171' },
    { id: 'map', label: 'Map & Environment', icon: Map, color: '#60a5fa' },
    { id: 'gameplay', label: 'Gameplay', icon: Settings, color: '#fbbf24' },
    { id: 'multiplayer', label: 'Multiplayer', icon: Users, color: '#a78bfa' },
    { id: 'animations', label: 'Animations', icon: Activity, color: '#34d399' },
  ];

  useEffect(() => {
    fetchCommits();
  }, []);

  const fetchCommits = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('micro_changes')
      .select('*, update_micro_changes(updates(title, version, id, category))')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCommits(data);
      setFilteredCommits(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    let result = commits;
    
    if (activeCategory !== 'all') {
      result = result.filter(c => 
        c.category?.toLowerCase().includes(activeCategory.toLowerCase()) ||
        c.message?.toLowerCase().includes(activeCategory.toLowerCase())
      );
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.message?.toLowerCase().includes(q) || 
        c.commit_hash?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q)
      );
    }

    setFilteredCommits(result);
  }, [activeCategory, searchQuery, commits]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-black pb-20">
      <Helmet>
        <title>Micro Changes & Git Commits - Dead Matter Wiki</title>
        <meta name="description" content="Track every minute detail of Dead Matter development. Real-time micro changes, git commits, and technical updates." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 group uppercase text-[10px] font-black tracking-[0.3em]">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase leading-none mb-6"
          >
            MICRO <span className="text-red-600">CHANGES</span>
          </motion.h1>
          
          <p className="text-gray-400 text-base max-w-2xl mx-auto font-medium leading-relaxed">
            Direct insight into the internal development of Dead Matter. Track every commit, fix, and feature as they happen in real-time.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6">
        {/* Filters & Search */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12 items-center justify-between">
          <div className="flex flex-wrap justify-center lg:justify-start gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 border
                  ${activeCategory === cat.id 
                    ? 'bg-red-600 border-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]' 
                    : 'bg-white/[0.03] border-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/[0.07] hover:border-white/10'}
                `}
              >
                <cat.icon size={12} />
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 group-focus-within:text-red-500 transition-colors" />
            <input 
              type="text"
              placeholder="Filter by hash or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-600/50 focus:bg-white/[0.05] transition-all text-sm font-medium"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
            <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-xs">Syncing with repository...</p>
          </div>
        ) : filteredCommits.length === 0 ? (
          <div className="text-center py-40 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/5">
            <Zap className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 font-black uppercase tracking-widest">No matching changes found in current branch</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredCommits.map((c, index) => {
              const hash = c.commit_hash || c.id.substring(0, 7);
              const categoryMatch = categories.find(cat => 
                c.category?.toLowerCase().includes(cat.id) || 
                c.message?.toLowerCase().includes(cat.id)
              ) || categories[0];

              return (
                <motion.div
                  key={c.id}
                  variants={itemVariants}
                  className="group relative flex flex-col p-6 rounded-[2rem] bg-[#0a0a0c] border border-white/5 hover:border-red-500/30 transition-all duration-500 shadow-xl overflow-hidden"
                >
                  {/* Category Accent */}
                  <div 
                    className="absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none"
                    style={{ background: categoryMatch.color }} 
                  />

                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ background: `${categoryMatch.color}15`, color: categoryMatch.color }}
                      >
                        <categoryMatch.icon size={16} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">
                        {c.category || categoryMatch.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-blue-400/80 bg-blue-500/5 px-2 py-1 rounded-md border border-blue-500/10">
                      <Hash size={10} />
                      {hash}
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed mb-4 flex-1 italic group-hover:text-white transition-colors">
                    "{c.message}"
                  </p>


                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      <Calendar size={12} className="text-red-500" />
                      {new Date(c.created_at).toLocaleDateString(i18n.language, { 
                        year: 'numeric', month: 'short', day: 'numeric' 
                      })}
                    </div>
                    {c.update_micro_changes?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 justify-end max-w-[60%]">
                        {c.update_micro_changes.map(({ updates: build }) => build && (
                          <div 
                            key={build.id}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border whitespace-nowrap ${
                              build.category?.toLowerCase().includes('nightly') 
                                ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/10' 
                                : 'bg-red-600/10 text-red-500 border-red-500/10'
                            }`}
                            title={build.title}
                          >
                            <Zap size={8} />
                            {build.category?.toLowerCase().includes('nightly') ? 'Nightly' : 'Build'} ({build.version || '??'})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* External Link Effect */}
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink size={14} className="text-gray-600 hover:text-white cursor-pointer" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.16); }
      `}</style>
    </div>
  );
};

export default MicroChanges;
