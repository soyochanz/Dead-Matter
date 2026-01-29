import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, MapPin, Image as ImageIcon, ArrowRight, Bell, X, Calendar, Tag, GitCommit, Shield, Car, Backpack, Hammer, ThumbsUp, User, UserCircle, Zap, Video, ExternalLink, ChevronUp, Loader2, Sword, Soup, Stethoscope, Users, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/mySupabaseClient';
import { Button } from '@/components/ui/button';
import UpdateCard from '@/components/UpdateCard';

// Skeleton Components
const SkeletonPulse = () => (
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
);

const SkeletonCard = ({ type = 'standard' }) => (
  <div className="relative overflow-hidden bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 h-full min-h-[150px]">
    <SkeletonPulse />
    <div className="space-y-4">
      <div className="h-6 bg-white/5 rounded w-3/4" />
      <div className="h-4 bg-white/5 rounded w-full" />
      <div className="h-4 bg-white/5 rounded w-5/6" />
      <div className="flex justify-between mt-auto">
        <div className="h-4 bg-white/5 rounded w-1/4" />
        <div className="h-4 bg-white/5 rounded w-1/4" />
      </div>
    </div>
  </div>
);

const GuideCard = ({ guide, index }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const localizedTitle = lang.startsWith('en') ? (guide.title_en || guide.title) : lang.startsWith('pt') ? (guide.title_pt || guide.title) : guide.title;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }} transition={{ delay: index * 0.1 }}
      className="relative bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden h-full flex flex-col group cursor-pointer hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-all duration-300"
    >
      <Link to={`/guides/${guide.slug || guide.id}`} className="block h-full">
        <div className="aspect-video overflow-hidden relative">
          <img src={guide.image_url || "https://images.unsplash.com/photo-1467746474745-41dd2c7524ce"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
        </div>
        <div className="p-5 flex-1 flex flex-col gap-3">
          <h4 className="font-bold text-white leading-tight group-hover:text-red-400 transition-colors line-clamp-2 min-h-[2.5rem] flex items-center">{localizedTitle}</h4>
          <div className="mt-auto flex justify-between items-center pt-3 border-t border-white/5">
            <span className="text-xs text-slate-400 truncate flex items-center gap-1.5"><UserCircle size={14} className="text-red-500" /> {guide.author?.username || 'Member'}</span>
            <span className="text-xs text-slate-400 flex items-center gap-1"><ThumbsUp size={12} className="text-green-500" /> {guide.likes_count}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const MediaCard = ({ item, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.1 }}
    className="group relative aspect-video rounded-xl overflow-hidden bg-[#0a0a0c] border border-white/5"
  >
    <Link to="/media" className="block h-full w-full">
      <img src={item.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" alt="" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="absolute bottom-3 left-3 right-3">
        <p className="text-sm font-bold text-white line-clamp-1 mb-1">{item.title}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {item.type === 'video' ? <Video size={12} className="text-red-500" /> : <ImageIcon size={12} className="text-blue-500" />}
            <span className="text-[10px] uppercase font-bold text-gray-400">{item.type}</span>
          </div>
          {(item.author || item.author?.username) && (
            <span className="text-[10px] text-gray-400 flex items-center gap-1.5">
              <UserCircle size={12} className="text-gray-500" />
              {typeof item.author === 'object' ? item.author.username : item.author}
            </span>
          )}
        </div>
      </div>
    </Link>
  </motion.div>
);

const VersionTag = ({ version }) => (
  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider">
    <Tag size={10} /> {version || 'Latest'}
  </div>
);

const WikiShortcuts = () => {
  const { t } = useTranslation();
  const categories = [
    { name: t('home.shortcuts.weapons'), icon: Sword, color: 'text-red-500', path: '/wiki/weapons' },
    { name: t('home.shortcuts.vehicles'), icon: Car, color: 'text-blue-500', path: '/wiki/vehicles' },
    { name: t('home.shortcuts.gear'), icon: Backpack, color: 'text-emerald-500', path: '/wiki/gear' },
    { name: t('home.shortcuts.basebuilding'), icon: Hammer, color: 'text-orange-500', path: '/wiki/basebuilding' },
    { name: t('home.shortcuts.consumables'), icon: Soup, color: 'text-yellow-500', path: '/wiki/consumables' },
    { name: t('home.shortcuts.medical'), icon: Stethoscope, color: 'text-pink-500', path: '/wiki/meds' },
    { name: t('home.shortcuts.npcs'), icon: Users, color: 'text-purple-500', path: '/wiki/npcs' },
    { name: t('home.shortcuts.keys'), icon: Package, color: 'text-slate-400', path: '/wiki/keys' },
  ];

  return (
    <section className="py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={cat.path}
              className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-[#0a0a0c] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all duration-300 hover:shadow-2xl"
            >
              <div className={`p-3 rounded-xl bg-white/5 group-hover:scale-110 transition-transform duration-300 ${cat.color}`}>
                <cat.icon size={24} />
              </div>
              <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">{cat.name}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const Home = () => {
  const { t, i18n } = useTranslation();
  const [latestUpdates, setLatestUpdates] = useState([]);
  const [latestMedia, setLatestMedia] = useState([]);
  const [latestCommits, setLatestCommits] = useState([]);
  const [topGuides, setTopGuides] = useState([]);
  const [loading, setLoading] = useState({ update: true, media: true, commits: true, guides: true });
  const [selectedUpdate, setSelectedUpdate] = useState(null);

  const extractYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  useEffect(() => {
    // 1. Fetch Guides
    supabase.from('guides')
      .select('id, title, title_en, title_pt, likes_count, image_url, slug, hashtags, author:profiles(username)')
      .eq('status', 'approved').order('likes_count', { ascending: false }).limit(4)
      .then(res => {
        if (res.data) setTopGuides(res.data);
        setLoading(prev => ({ ...prev, guides: false }));
      });

    // 2. Fetch Latest Updates (2)
    supabase.from('updates').select('*, title_en, title_pt, content_en, content_pt').order('date', { ascending: false }).limit(2)
      .then(res => {
        if (res.data) setLatestUpdates(res.data);
        setLoading(prev => ({ ...prev, update: false }));
      });

    // 3. Fetch Commits
    supabase.from('micro_changes').select('*').order('created_at', { ascending: false }).limit(8)
      .then(res => {
        if (res.data) setLatestCommits(res.data);
        setLoading(prev => ({ ...prev, commits: false }));
      });

    // 4. Fetch Media
    supabase.from('media_items').select('*').order('created_at', { ascending: false }).limit(3)
      .then(res => {
        if (res.data) {
          const processed = res.data.map(item => ({
            ...item,
            thumbnail: item.thumbnail || (item.type === 'video' ? `https://img.youtube.com/vi/${extractYouTubeId(item.url)}/hqdefault.jpg` : item.url)
          }));
          setLatestMedia(processed);
        }
        setLoading(prev => ({ ...prev, media: false }));
      });
  }, []);

  return (
    <>
      <Helmet>
        <title>Dead Matter Wiki | Interactive Map & Guides</title>
      </Helmet>


      <div className="max-w-7xl mx-auto px-4 py-12 md:py-24 space-y-24">
        {/* Hero Section */}
        <section className="text-center space-y-8 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black text-white tracking-tighter"
          >
            {t('home.hero_title')} <span className="text-red-500">WIKI</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 font-medium leading-relaxed"
          >
            {t('home.hero_subtitle')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 pt-8"
          >
            <Button asChild size="lg" className="bg-red-600 hover:bg-red-500 text-white rounded-full px-8">
              <Link to="/map"><MapPin className="mr-2 h-4 w-4" /> {t('home.interactive_map')}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 border-white/10 hover:bg-white/5">
              <Link to="/wiki"><BookOpen className="mr-2 h-4 w-4" /> {t('home.wiki_button')}</Link>
            </Button>
          </motion.div>
        </section>

        <WikiShortcuts />

        {/* Guides Section */}
        <section className="space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-bold text-white">{t('home.top_guides')}</h2>
              <p className="text-slate-500 mt-1">{t('home.learn_experts')}</p>
            </div>
            <Link to="/guides" className="text-red-500 text-sm font-bold flex items-center hover:translate-x-1 transition-transform">{t('home.view_all')} <ArrowRight size={14} className="ml-1" /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading.guides ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />) :
              topGuides.map((guide, i) => <GuideCard key={guide.id} guide={guide} index={i} />)}
          </div>
        </section>

        {/* Two Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Latest Update */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center gap-3">
              <Bell size={24} className="text-red-500" />
              <h2 className="text-3xl font-bold text-white">{t('home.latest_patch_notes')}</h2>
            </div>
            {loading.update ? <SkeletonCard /> : (
              <div className="space-y-6">
                {latestUpdates.map(update => (
                  <UpdateCard key={update.id} update={update} onReadMore={setSelectedUpdate} versionTag={<VersionTag version={update.version} />} />
                ))}
              </div>
            )}
          </div>

          {/* Right: Commits */}
          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center gap-3">
              <GitCommit size={24} className="text-blue-500" />
              <h2 className="text-2xl font-bold text-white">{t('home.micro_changes')}</h2>
            </div>
            <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
              {loading.commits && <SkeletonPulse />}

              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Bell size={12} className="text-amber-500" />
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">{t('home.notice_title')}</span>
                </div>
                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  {t('home.micro_changes_notice')}
                </p>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {latestCommits.map((c, i) => (
                  <div key={c.id} className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
                    <p className="text-sm text-slate-300 line-clamp-2">{c.message}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] uppercase font-bold text-slate-500">{new Date(c.created_at).toLocaleDateString(i18n.language)}</span>
                      <span className="text-[10px] font-mono text-blue-400">#{c.id.substring(0, 6)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Media Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <ImageIcon size={24} className="text-purple-500" />
            <h2 className="text-3xl font-bold text-white">{t('home.latest_media')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {loading.media ? Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />) :
              latestMedia.map((item, i) => <MediaCard key={item.id} item={item} index={i} />)}
          </div>
        </section>

        {/* Official Trailer Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <Video size={24} className="text-red-500" />
            <h2 className="text-3xl font-bold text-white">{t('home.official_trailer')}</h2>
          </div>
          <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube-nocookie.com/embed/8R0fkYHOpzA"
              title="Dead Matter Official Trailer"
              frameBorder="0"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              className="w-full h-full"
            ></iframe>
          </div>
        </section>
      </div>

      {selectedUpdate && (
        <AnimatePresence>
          <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setSelectedUpdate(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0f172a] border border-white/10 p-8 rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-bold text-white">
                  {i18n.language.startsWith('en') ? (selectedUpdate.title_en || selectedUpdate.title) : i18n.language.startsWith('pt') ? (selectedUpdate.title_pt || selectedUpdate.title) : selectedUpdate.title}
                </h3>
                <button onClick={() => setSelectedUpdate(null)}><X className="text-slate-400" /></button>
              </div>
              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html: i18n.language.startsWith('en') ? (selectedUpdate.content_en || selectedUpdate.content) : i18n.language.startsWith('pt') ? (selectedUpdate.content_pt || selectedUpdate.content) : selectedUpdate.content
                }}
              />
            </motion.div>
          </div>
        </AnimatePresence>
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) }
          100% { transform: translateX(100%) }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 20px }
      `}</style>
    </>
  );
};

export default Home;
