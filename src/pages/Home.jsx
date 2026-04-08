import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, MapPin, Image as ImageIcon, ArrowRight, Bell, X, Calendar, Tag, GitCommit, Shield, Car, Backpack, Hammer, ThumbsUp, User, UserCircle, Zap, Video, ExternalLink, ChevronUp, Loader2, Sword, Soup, Stethoscope, Users, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/mySupabaseClient';
import { Button } from '@/components/ui/button';
import UpdateCard from '@/components/UpdateCard';

// ─── Design tokens ────────────────────────────────────────────────────────────
// Card surface sits visibly above the page background
const CARD_BG = '#111318';     // slightly lighter than true-black page bg
const CARD_BG2 = '#13161d';     // alternate for variety
const BORDER = 'rgba(255,255,255,0.07)';
const BORDER_HV = 'rgba(255,255,255,0.14)';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonPulse = () => (
  <div
    className="absolute inset-0 animate-shimmer"
    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.025), transparent)', backgroundSize: '150% 100%' }}
  />
);

const SkeletonCard = () => (
  <div style={{ background: CARD_BG, border: `1px solid ${BORDER}` }} className="relative overflow-hidden rounded-2xl p-6 h-full min-h-[160px]">
    <SkeletonPulse />
    <div className="space-y-3">
      <div className="h-5 rounded-lg w-3/4" style={{ background: 'rgba(255,255,255,0.06)' }} />
      <div className="h-3 rounded w-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
      <div className="h-3 rounded w-5/6" style={{ background: 'rgba(255,255,255,0.04)' }} />
      <div className="flex justify-between mt-6">
        <div className="h-3 rounded w-1/4" style={{ background: 'rgba(255,255,255,0.04)' }} />
        <div className="h-3 rounded w-1/4" style={{ background: 'rgba(255,255,255,0.04)' }} />
      </div>
    </div>
  </div>
);

// ─── Guide Card ───────────────────────────────────────────────────────────────
const GuideCard = ({ guide, index }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const localizedTitle = lang.startsWith('es')
    ? (guide.title_es || guide.title)
    : lang.startsWith('pt')
      ? (guide.title_pt || guide.title)
      : (guide.title_en || guide.title);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group relative rounded-2xl overflow-hidden h-full flex flex-col cursor-pointer"
      style={{
        background: CARD_BG,
        border: `1px solid ${BORDER}`,
        boxShadow: '0 2px 20px rgba(0,0,0,0.4)',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(239,68,68,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = '0 2px 20px rgba(0,0,0,0.4)'; }}
    >
      <Link to={`/guides/${guide.slug || guide.id}`} className="h-full flex flex-col">
        {/* Thumbnail */}
        <div className="aspect-video overflow-hidden relative shrink-0">
          <img
            src={guide.image_url || "https://images.unsplash.com/photo-1467746474745-41dd2c7524ce"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            alt={localizedTitle}
          />
          {/* Red gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
          {/* Top badge */}
          <div className="absolute top-3 left-3">
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full"
              style={{ background: 'rgba(239,68,68,0.9)', color: '#fff', letterSpacing: '0.1em' }}>
              GUIDE
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 flex-1 flex flex-col gap-2">
          <h4 className="font-bold text-sm text-white leading-snug group-hover:text-red-400 transition-colors line-clamp-2">
            {localizedTitle}
          </h4>
          <div className="mt-auto flex justify-between items-center pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <UserCircle size={12} className="text-red-500/70" />
              {guide.author?.username || 'Member'}
            </span>
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <ThumbsUp size={11} className="text-emerald-500/80" />
              {guide.likes_count}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// ─── Media Card ───────────────────────────────────────────────────────────────
const MediaCard = ({ item, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.1 }}
    className="group relative aspect-video rounded-xl overflow-hidden"
    style={{ border: `1px solid ${BORDER}`, boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
  >
    <Link to="/media" className="block h-full w-full">
      <img
        src={item.thumbnail}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        loading="lazy"
        alt={item.title}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

      {/* Hover overlay — icon depends on type */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: item.type === 'video' ? 'rgba(239,68,68,0.9)' : 'rgba(99,102,241,0.9)',
            backdropFilter: 'blur(4px)',
            boxShadow: item.type === 'video' ? '0 0 24px rgba(239,68,68,0.5)' : '0 0 24px rgba(99,102,241,0.5)',
          }}>
          {item.type === 'video'
            ? <Video size={18} className="text-white ml-0.5" />
            : <ImageIcon size={18} className="text-white" />}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-xs font-bold text-white line-clamp-1 mb-1.5">{item.title}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            {item.type === 'video'
              ? <Video size={10} className="text-red-400" />
              : <ImageIcon size={10} className="text-indigo-400" />}
            <span className="text-[9px] uppercase font-black tracking-widest text-gray-400">{item.type}</span>
          </div>
          {item.author && (
            <span className="text-[10px] text-gray-400 flex items-center gap-1">
              <UserCircle size={10} className="text-gray-500" />
              {typeof item.author === 'object' ? item.author.username : item.author}
            </span>
          )}
        </div>
      </div>
    </Link>
  </motion.div>
);

// ─── Version Tag ──────────────────────────────────────────────────────────────
const VersionTag = ({ version }) => (
  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
    style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
    <Tag size={9} /> {version || 'Latest'}
  </div>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, iconColor, iconGlow, title, subtitle, action }) => (
  <div className="flex justify-between items-end mb-6">
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-3">
        {/* Icon with coloured glow */}
        <div
          className="p-2.5 rounded-xl"
          style={{
            background: iconGlow ? `linear-gradient(135deg, ${iconGlow}28, ${iconGlow}10)` : 'rgba(255,255,255,0.07)',
            border: iconGlow ? `1px solid ${iconGlow}40` : '1px solid rgba(255,255,255,0.1)',
            boxShadow: iconGlow ? `0 4px 20px ${iconGlow}25` : 'none',
          }}
        >
          <Icon size={20} style={{ color: iconGlow || '#fff', filter: iconGlow ? `drop-shadow(0 0 6px ${iconGlow}90)` : 'none' }} />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
          {title}
        </h2>
      </div>
      {subtitle && <p className="text-slate-500 text-sm ml-12">{subtitle}</p>}
    </div>
    {action}
  </div>
);

// ─── Wiki Shortcuts ───────────────────────────────────────────────────────────
const WikiShortcuts = () => {
  const { t } = useTranslation();
  const categories = [
    { name: t('home.shortcuts.weapons'), icon: Sword, grad: ['#ef4444', '#b91c1c'], path: '/wiki/weapons' },
    { name: t('home.shortcuts.vehicles'), icon: Car, grad: ['#3b82f6', '#1d4ed8'], path: '/wiki/vehicles' },
    { name: t('home.shortcuts.gear'), icon: Backpack, grad: ['#10b981', '#047857'], path: '/wiki/gear' },
    { name: t('home.shortcuts.basebuilding'), icon: Hammer, grad: ['#f97316', '#c2410c'], path: '/wiki/basebuilding' },
    { name: t('home.shortcuts.consumables'), icon: Soup, grad: ['#eab308', '#a16207'], path: '/wiki/consumables' },
    { name: t('home.shortcuts.medical'), icon: Stethoscope, grad: ['#ec4899', '#be185d'], path: '/wiki/meds' },
    { name: t('home.shortcuts.npcs'), icon: Users, grad: ['#a78bfa', '#7c3aed'], path: '/wiki/npcs' },
    { name: t('home.shortcuts.keys'), icon: Package, grad: ['#94a3b8', '#475569'], path: '/wiki/keys' },
  ];

  return (
    <section>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -4, transition: { duration: 0.18 } }}
          >
            <Link to={cat.path} className="block">
              <div
                className="group relative flex flex-col items-center gap-3 p-5 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
                style={{
                  background: `linear-gradient(145deg, ${cat.grad[0]}18 0%, ${cat.grad[1]}08 100%)`,
                  border: `1px solid ${cat.grad[0]}30`,
                  boxShadow: `0 2px 16px ${cat.grad[0]}10`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = `linear-gradient(145deg, ${cat.grad[0]}30 0%, ${cat.grad[1]}18 100%)`;
                  e.currentTarget.style.borderColor = cat.grad[0] + '60';
                  e.currentTarget.style.boxShadow = `0 8px 32px ${cat.grad[0]}28`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = `linear-gradient(145deg, ${cat.grad[0]}18 0%, ${cat.grad[1]}08 100%)`;
                  e.currentTarget.style.borderColor = cat.grad[0] + '30';
                  e.currentTarget.style.boxShadow = `0 2px 16px ${cat.grad[0]}10`;
                }}
              >
                {/* Glow spot behind icon */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full blur-xl opacity-40 pointer-events-none"
                  style={{ background: cat.grad[0] }} />

                {/* Icon pill */}
                <div
                  className="relative z-10 p-3 rounded-xl transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${cat.grad[0]}40, ${cat.grad[1]}28)`,
                    border: `1px solid ${cat.grad[0]}50`,
                    boxShadow: `0 4px 16px ${cat.grad[0]}30`,
                  }}
                >
                  <cat.icon size={22} style={{ color: cat.grad[0], filter: `drop-shadow(0 0 6px ${cat.grad[0]}80)` }} />
                </div>

                <span className="relative z-10 text-[11px] font-bold text-center leading-tight transition-colors duration-200"
                  style={{ color: cat.grad[0] + 'cc' }}>
                  {cat.name}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// ─── Commit Item ──────────────────────────────────────────────────────────────
const CommitItem = ({ c, i18nLang }) => {
  const hash = c.commit_hash || c.id.substring(0, 7);
  return (
    <div
      className="p-3 rounded-xl transition-colors duration-200 hover:bg-white/[0.03]"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="flex justify-between items-start mb-1">
        {c.category && (
          <span className="text-[9px] font-black uppercase tracking-widest text-red-500/80">
            {c.category}
          </span>
        )}
        <span className="text-[9px] font-mono ml-auto" style={{ color: '#60a5fa' }}>
          #{hash}
        </span>
      </div>
      <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">{c.message}</p>
      <div className="mt-2 text-[10px] uppercase font-bold text-slate-600">
        {new Date(c.created_at).toLocaleDateString(i18nLang)}
      </div>
    </div>
  );
};

// ─── Home ─────────────────────────────────────────────────────────────────────
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
    const m = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    return (m && m[2].length === 11) ? m[2] : null;
  };

  useEffect(() => {
    supabase.from('guides')
      .select('id, title, title_en, title_es, title_pt, description, description_en, description_es, description_pt, likes_count, image_url, slug, hashtags, author:profiles(username)')
      .eq('status', 'approved').order('likes_count', { ascending: false }).limit(4)
      .then(res => { if (res.data) setTopGuides(res.data); setLoading(p => ({ ...p, guides: false })); });

    supabase.from('updates')
      .select('*, title_en, title_es, title_pt, content_en, content_es, content_pt')
      .order('date', { ascending: false }).limit(2)
      .then(res => { if (res.data) setLatestUpdates(res.data); setLoading(p => ({ ...p, update: false })); });

    supabase.from('micro_changes').select('*').order('created_at', { ascending: false }).limit(8)
      .then(res => { if (res.data) setLatestCommits(res.data); setLoading(p => ({ ...p, commits: false })); });

    supabase.from('media_items').select('*').order('created_at', { ascending: false }).limit(3)
      .then(res => {
        if (res.data) {
          const processed = res.data.map(item => ({
            ...item,
            thumbnail: item.thumbnail || (item.type === 'video'
              ? `https://img.youtube.com/vi/${extractYouTubeId(item.url)}/hqdefault.jpg`
              : item.url)
          }));
          setLatestMedia(processed);
        }
        setLoading(p => ({ ...p, media: false }));
      });
  }, []);

  return (
    <>
      <Helmet>
        <title>Dead Matter Wiki | #1 Community Map, Wiki & Survival Guides</title>
        <meta name="description" content="The ultimate community resource for Dead Matter. Explore our interactive map, comprehensive wiki, weapon stats, crafting guides, and latest game updates." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 space-y-20">

        {/* ── Hero ── */}
        <section className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Glow behind hero text */}
          <div className="pointer-events-none absolute inset-x-0 flex justify-center" style={{ top: '-60px', zIndex: 0 }}>
            <div style={{ width: '600px', height: '300px', background: 'radial-gradient(ellipse at center, rgba(239,68,68,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'relative' }}>
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none">
              {t('home.hero_title')} <span style={{ color: '#ef4444' }}>WIKI</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-lg text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto"
          >
            {t('home.hero_subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 pt-4"
          >
            <Button asChild size="lg" className="bg-red-600 hover:bg-red-500 text-white rounded-full px-8 shadow-lg shadow-red-600/20">
              <Link to="/map"><MapPin className="mr-2 h-4 w-4" /> {t('home.interactive_map')}</Link>
            </Button>
            <Button asChild variant="outline" size="lg"
              className="rounded-full px-8"
              style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}>
              <Link to="/wiki"><BookOpen className="mr-2 h-4 w-4" /> {t('home.wiki_button')}</Link>
            </Button>
          </motion.div>
        </section>

        {/* ── Wiki Shortcuts ── */}
        <WikiShortcuts />

        {/* ── Guides ── */}
        <section>
          <SectionHeader
            icon={BookOpen}
            iconGlow="#ef4444"
            title={t('home.top_guides')}
            subtitle={t('home.learn_experts')}
            action={
              <Link to="/guides" className="text-red-500 text-sm font-bold flex items-center gap-1 hover:translate-x-1 transition-transform">
                {t('home.view_all')} <ArrowRight size={14} />
              </Link>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {loading.guides
              ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : topGuides.map((guide, i) => <GuideCard key={guide.id} guide={guide} index={i} />)}
          </div>
        </section>

        {/* ── Updates + Commits ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left: Latest Updates */}
          <div className="lg:col-span-8">
            <SectionHeader icon={Bell} iconGlow="#ef4444" title={t('home.latest_patch_notes')} />
            {loading.update
              ? <SkeletonCard />
              : (
                <div className="space-y-5">
                  {latestUpdates.map(update => (
                    <div
                      key={update.id}
                      className="rounded-2xl overflow-hidden"
                      style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
                    >
                      <UpdateCard
                        update={update}
                        onReadMore={setSelectedUpdate}
                        versionTag={<VersionTag version={update.version} />}
                      />
                    </div>
                  ))}
                </div>
              )}
          </div>

          {/* Right: Micro-commits */}
          <div className="lg:col-span-4">
            <SectionHeader icon={GitCommit} iconGlow="#3b82f6" title={t('home.micro_changes')} />
            <div
              className="relative overflow-hidden rounded-2xl p-5"
              style={{ background: CARD_BG, border: `1px solid ${BORDER}`, boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
            >
              {/* Top fade indicating scrollability */}
              <div className="absolute top-0 left-0 right-0 h-6 pointer-events-none z-10"
                style={{ background: `linear-gradient(to bottom, ${CARD_BG}, transparent)` }} />

              {loading.commits && <SkeletonPulse />}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                {latestCommits.map(c => (
                  <CommitItem key={c.id} c={c} i18nLang={i18n.language} />
                ))}
              </div>

              {/* Bottom fade */}
              <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
                style={{ background: `linear-gradient(to top, ${CARD_BG}, transparent)` }} />
            </div>
          </div>
        </div>

        {/* ── Media ── */}
        <section>
          <SectionHeader
            icon={ImageIcon}
            iconGlow="#a78bfa"
            title={t('home.latest_media')}
            action={
              <Link to="/media" className="text-purple-400 text-sm font-bold flex items-center gap-1 hover:translate-x-1 transition-transform">
                {t('home.view_all')} <ArrowRight size={14} />
              </Link>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {loading.media
              ? Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : latestMedia.map((item, i) => <MediaCard key={item.id} item={item} index={i} />)}
          </div>
        </section>

        {/* ── About / Trailer ── */}
        <section>
          <div
            className="rounded-3xl overflow-hidden p-8 md:p-12"
            style={{
              background: `linear-gradient(135deg, #13161d 0%, #111318 60%, #0e1014 100%)`,
              border: `1px solid ${BORDER}`,
              boxShadow: '0 8px 48px rgba(0,0,0,0.5)',
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-5">
                {/* Label */}
                <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full inline-block"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                  About the Game
                </span>
                <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-tight">
                  Dead Matter<br />Survival Experience
                </h2>
                <div className="space-y-4 text-slate-400 leading-relaxed text-sm">
                  <p>
                    <span className="text-red-400 font-bold">Dead Matter</span> is a true sandbox survival horror game
                    set in the beautiful yet dangerous wilderness of{' '}
                    <span className="text-white font-semibold">Alberta, Canada</span>.
                    Players scavenge for resources, craft essential gear, and survive against both infected and other survivors.
                  </p>
                  <p>
                    As the most complete <span className="text-white font-semibold">Dead Matter Wiki</span>, our mission is to
                    arm you with every technical detail you need — from interactive maps to full weapon stats.
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button asChild size="sm" className="bg-red-600 hover:bg-red-500 rounded-full px-5">
                    <Link to="/map"><MapPin size={14} className="mr-1.5" /> Explore Map</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm"
                    className="rounded-full px-5"
                    style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}>
                    <Link to="/wiki"><BookOpen size={14} className="mr-1.5" /> Browse Wiki</Link>
                  </Button>
                </div>
              </div>

              {/* Trailer */}
              <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <iframe
                  width="100%" height="100%"
                  src="https://www.youtube-nocookie.com/embed/8R0fkYHOpzA"
                  title="Dead Matter Official Trailer"
                  frameBorder="0"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen loading="lazy"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Update Modal ── */}
      <AnimatePresence>
        {selectedUpdate && (
          <div
            className="fixed inset-0 z-[6000] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
            onClick={() => setSelectedUpdate(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar"
              style={{ background: '#13161d', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6 gap-4">
                <h3 className="text-2xl font-black text-white leading-tight">
                  {i18n.language.startsWith('es') ? (selectedUpdate.title_es || selectedUpdate.title)
                    : i18n.language.startsWith('pt') ? (selectedUpdate.title_pt || selectedUpdate.title)
                      : (selectedUpdate.title_en || selectedUpdate.title)}
                </h3>
                <button
                  onClick={() => setSelectedUpdate(null)}
                  className="shrink-0 p-2 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: '#6b7280' }}
                >
                  <X size={18} />
                </button>
              </div>
              <div
                className="prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: i18n.language.startsWith('es') ? (selectedUpdate.content_es || selectedUpdate.content)
                    : i18n.language.startsWith('pt') ? (selectedUpdate.content_pt || selectedUpdate.content)
                      : (selectedUpdate.content_en || selectedUpdate.content)
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -150% 0 }
          100% { background-position:  150% 0 }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
          background-size: 150% 100%;
        }
        .custom-scrollbar::-webkit-scrollbar       { width: 4px }
        .custom-scrollbar::-webkit-scrollbar-track  { background: transparent }
        .custom-scrollbar::-webkit-scrollbar-thumb  { background: rgba(255,255,255,0.08); border-radius: 20px }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.16) }
      `}</style>
    </>
  );
};

export default Home;