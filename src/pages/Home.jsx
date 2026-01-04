import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, MapPin, Image as ImageIcon, ArrowRight, Bell, X,
  GitCommit, Sword, Car, Backpack, Hammer, Soup,
  Stethoscope, Users, Package, Play, ExternalLink,
  ChevronRight, Sparkles, Trophy, Newspaper
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/mySupabaseClient';
import { Button } from '@/components/ui/button';
import UpdateCard from '@/components/UpdateCard';

// --- Components ---

const SectionHeader = ({ icon: Icon, title, subtitle, link, linkText }) => (
  <div className="flex justify-between items-end mb-8">
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-red-500">
        <Icon size={20} />
        <span className="text-xs font-black uppercase tracking-[0.2em]">{title}</span>
      </div>
      <h2 className="text-3xl font-bold text-white tracking-tight">{subtitle}</h2>
    </div>
    {link && (
      <Link to={link} className="group flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
        {linkText || 'VIEW ALL'} <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    )}
  </div>
);

const GlassCard = ({ children, className = "" }) => (
  <div className={`glass-card glass-card-hover rounded-3xl p-6 relative overflow-hidden ${className}`}>
    {children}
  </div>
);

const ShortcutCard = ({ name, icon: Icon, path, color }) => (
  <Link to={path} className="group relative flex flex-col items-center gap-4 p-6 rounded-3xl bg-slate-950/50 border border-white/5 hover:bg-red-500/5 hover:border-red-500/20 transition-all duration-300">
    <div className={`p-4 rounded-2xl bg-slate-900 border border-white/5 group-hover:scale-110 group-hover:bg-red-500/10 group-hover:border-red-500/20 transition-all duration-500 ${color}`}>
      <Icon size={28} />
    </div>
    <span className="text-sm font-bold text-slate-400 group-hover:text-white tracking-wide transition-colors">{name}</span>
  </Link>
);

const GuideCard = ({ guide, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
  >
    <Link to={`/guides/${guide.slug || guide.id}`} className="group block h-full">
      <GlassCard className="h-full flex flex-col p-0">
        <div className="aspect-[16/10] overflow-hidden relative">
          <img
            src={guide.image_url || "https://images.unsplash.com/photo-1467746474745-41dd2c7524ce"}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            alt={guide.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full bg-red-500 text-[10px] font-black uppercase tracking-widest text-white">HOT</span>
          </div>
        </div>
        <div className="p-6 flex-1 flex flex-col justify-between">
          <h4 className="font-bold text-lg text-white group-hover:text-red-400 transition-colors line-clamp-2 leading-snug mb-4">
            {guide.title}
          </h4>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 tracking-wider uppercase">
            <span className="flex items-center gap-2"><Sparkles size={12} className="text-yellow-500" /> {guide.author?.username || 'Survivor'}</span>
            <span className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-md">⭐ {guide.likes_count}</span>
          </div>
        </div>
      </GlassCard>
    </Link>
  </motion.div>
);

const Home = () => {
  const [data, setData] = useState({
    update: null,
    media: [],
    commits: [],
    guides: [],
    loading: true
  });
  const [selectedUpdate, setSelectedUpdate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [guidesRes, updateRes, commitsRes, mediaRes] = await Promise.all([
          supabase.from('guides').select('id, title, likes_count, image_url, slug, author:profiles(username)').eq('status', 'approved').order('likes_count', { ascending: false }).limit(4),
          supabase.from('updates').select('*').order('date', { ascending: false }).limit(1),
          supabase.from('micro_changes').select('*').order('created_at', { ascending: false }).limit(6),
          supabase.from('media_items').select('*').order('created_at', { ascending: false }).limit(3)
        ]);

        setData({
          guides: guidesRes.data || [],
          update: updateRes.data?.[0] || null,
          commits: commitsRes.data || [],
          media: mediaRes.data || [],
          loading: false
        });
      } catch (error) {
        console.error("Error fetching home data:", error);
        setData(prev => ({ ...prev, loading: false }));
      }
    };
    fetchData();
  }, []);

  const shortcuts = [
    { name: 'Weapons', icon: Sword, color: 'text-red-500', path: '/wiki/weapons' },
    { name: 'Vehicles', icon: Car, color: 'text-blue-500', path: '/wiki/vehicles' },
    { name: 'Gear', icon: Backpack, color: 'text-emerald-500', path: '/wiki/gear' },
    { name: 'Basebuilding', icon: Hammer, color: 'text-orange-500', path: '/wiki/basebuilding' },
    { name: 'Medical', icon: Stethoscope, color: 'text-pink-500', path: '/wiki/meds' },
    { name: 'Consumables', icon: Soup, color: 'text-yellow-500', path: '/wiki/consumables' },
    { name: 'NPCs', icon: Users, color: 'text-purple-500', path: '/wiki/npcs' },
    { name: 'Keys', icon: Package, color: 'text-slate-400', path: '/wiki/keys' },
  ];

  return (
    <div className="min-h-screen bg-[#030712] selection:bg-red-500 selection:text-white">
      <Helmet>
        <title>Dead Matter | Final Survival Wiki</title>
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-[-5%] w-[30%] h-[30%] bg-blue-900/10 blur-[100px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-black tracking-widest text-slate-400 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            ALPHA ACCESS GUIDE
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl md:text-9xl font-black text-white tracking-tighter mb-8 text-gradient"
          >
            DEAD MATTER <span className="text-red-500 glow-red">WIKI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            Master the Canadian wilderness. The most comprehensive technical database for weapons, medical survival, and community-driven intel.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-6 mt-12"
          >
            <Button asChild size="xl" className="h-16 px-10 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-lg font-black tracking-tight group overflow-hidden relative">
              <Link to="/map">
                <span className="relative z-10 flex items-center gap-3">
                  <MapPin size={22} strokeWidth={2.5} /> EXPLORE MAP
                </span>
                <motion.div
                  className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500"
                  style={{ skewX: '-20deg' }}
                />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl" className="h-16 px-10 border-white/10 hover:bg-white/5 text-white rounded-2xl text-lg font-black tracking-tight">
              <Link to="/wiki"><BookOpen size={22} className="mr-3 text-red-500" /> BROWSE WIKI</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 space-y-32 pb-32">
        {/* Shortcuts Grid */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {shortcuts.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <ShortcutCard {...cat} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Dynamic Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-24">
            {/* Patch Notes Section */}
            <section>
              <SectionHeader
                icon={Bell}
                title="SITUATION REPORT"
                subtitle="Latest Patch Notes"
                link="/updates"
              />
              {data.loading ? (
                <div className="w-full h-64 bg-slate-900 animate-pulse rounded-3xl" />
              ) : data.update && (
                <div className="relative group">
                  <UpdateCard
                    update={data.update}
                    onReadMore={setSelectedUpdate}
                    versionTag={
                      <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-[10px] font-black tracking-widest uppercase">
                        V.{data.update.version}
                      </div>
                    }
                  />
                  <div className="absolute -inset-4 bg-red-500/5 blur-2xl rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              )}
            </section>

            {/* Guides Grid */}
            <section>
              <SectionHeader
                icon={Trophy}
                title="COMMUNITY INTEL"
                subtitle="Expert Survival Guides"
                link="/guides"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {data.loading ?
                  Array(2).fill(0).map((_, i) => <div key={i} className="aspect-video bg-slate-900 rounded-3xl animate-pulse" />) :
                  data.guides.map((guide, i) => <GuideCard key={guide.id} guide={guide} index={i} />)
                }
              </div>
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-16">
            {/* Micro Changes Sidebar */}
            <section>
              <SectionHeader
                icon={GitCommit}
                title="DEV LOG"
                subtitle="Recent Commits"
              />
              <GlassCard className="p-0 border-white/5 bg-slate-950/20">
                <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto custom-scrollbar">
                  {data.loading ?
                    Array(4).fill(0).map((_, i) => <div key={i} className="p-6 h-20 bg-slate-900 animate-pulse" />) :
                    data.commits.map((c, i) => (
                      <div key={c.id} className="p-6 hover:bg-white/[0.02] transition-colors group">
                        <p className="text-sm text-slate-300 font-medium line-clamp-2 leading-relaxed mb-3 group-hover:text-white transition-colors">
                          {c.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                            {new Date(c.created_at).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] font-mono text-red-500/60 bg-red-500/5 px-2 py-0.5 rounded">
                            #{c.id.substring(0, 6)}
                          </span>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </GlassCard>
            </section>

            {/* Media Highlight */}
            <section>
              <SectionHeader
                icon={ImageIcon}
                title="GALLERY"
                subtitle="World Snapshots"
                link="/media"
              />
              <div className="space-y-4">
                {data.loading ?
                  <div className="aspect-square bg-slate-900 rounded-3xl animate-pulse" /> :
                  data.media.slice(0, 2).map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Link to="/media" className="group block relative aspect-video rounded-3xl overflow-hidden border border-white/5">
                        <img src={item.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="text-white fill-white" size={32} />
                        </div>
                      </Link>
                    </motion.div>
                  ))
                }
              </div>
            </section>
          </div>
        </div>

        {/* Trailer Section */}
        <section>
          <GlassCard className="p-0 rounded-[40px] bg-black group shadow-2xl overflow-hidden border-white/10">
            <div className="aspect-video w-full relative">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/8R0fkYHOpzA?modestbranding=1&rel=0"
                title="Dead Matter Official Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
              />
            </div>
            <div className="p-8 flex items-center justify-between bg-slate-950/80 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-red-600 text-white glow-red">
                  <Play size={24} fill="currentColor" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">OFFICIAL TRAILER</h3>
                  <p className="text-slate-500 text-sm font-bold tracking-wide uppercase">Developed by Qi Software</p>
                </div>
              </div>
              <Button asChild variant="outline" className="border-white/10 rounded-xl hover:bg-white/5 font-bold">
                <a href="https://store.steampowered.com/app/1113910/Dead_Matter/" target="_blank" rel="noreferrer">
                  VIEW ON STEAM
                </a>
              </Button>
            </div>
          </GlassCard>
        </section>
      </div>

      {/* Modal for Updates */}
      <AnimatePresence>
        {selectedUpdate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl" onClick={() => setSelectedUpdate(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-white/10 p-10 rounded-[40px] max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl custom-scrollbar"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-10">
                <div className="space-y-4">
                  <div className="px-3 py-1 inline-block bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-[10px] font-black tracking-widest uppercase">
                    PATCH {selectedUpdate.version}
                  </div>
                  <h3 className="text-4xl font-black text-white tracking-tighter leading-none">{selectedUpdate.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedUpdate(null)}
                  className="p-3 rounded-full bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="prose prose-invert max-w-none prose-p:text-slate-400 prose-headings:text-white prose-strong:text-red-400 prose-a:text-red-500 leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: selectedUpdate.content }} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
