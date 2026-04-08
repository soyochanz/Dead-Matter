import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { ChevronRight, ChevronLeft, Radio, ExternalLink, Gamepad2 } from 'lucide-react';
import { supabase } from '@/lib/mySupabaseClient';
import { useTranslation } from 'react-i18next';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { t } = useTranslation();
  const [discordUrl, setDiscordUrl] = useState('');
  const [isDevLive, setIsDevLive] = useState(false);
  const [streamData, setStreamData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const DEV_TWITCH_USERNAME = 'johnsonguitardev';
  const TWITCH_CHANNEL_URL = `https://www.twitch.tv/${DEV_TWITCH_USERNAME}`;
  const DEV_AVATAR_URL = 'https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/Items/avatars/3f234dbf-0f5e-4b74-8422-75d087be56ce-profile_image-300x300.png';

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('map_settings')
        .select('discord_url')
        .limit(1)
        .single();
      if (!error && data && data.discord_url) {
        setDiscordUrl(data.discord_url);
      }
    };
    fetchSettings();
    checkDevStreamStatus();
    const interval = setInterval(checkDevStreamStatus, 600000);
    return () => clearInterval(interval);
  }, []);

  const checkDevStreamStatus = async () => {
    try {
      setIsLoading(true);
      const isLive = await checkTwitchStreamSimple(DEV_TWITCH_USERNAME);
      if (isLive) {
        setIsDevLive(true);
        setStreamData({
          title: "JohnsonGuitarDev is live!",
          viewer_count: "Live now",
          game_name: "Dead Matter Development"
        });
      } else {
        setIsDevLive(false);
        setStreamData(null);
      }
    } catch (error) {
      console.error('Error checking stream status:', error);
      setIsDevLive(false);
    } finally {
      setIsLoading(false);
    }
  };

  const checkTwitchStreamSimple = async username => {
    return false;
  };

  const StreamStatus = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 animate-pulse">
          <div className="w-2 h-2 bg-gray-600 rounded-full" />
          <div className="h-3 w-24 bg-gray-700 rounded-full" />
        </div>
      );
    }

    if (isDevLive) {
      return (
        <a
          href={TWITCH_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="relative block p-4 rounded-2xl overflow-hidden group cursor-pointer border border-purple-500/50"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-orange-600/20 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.3),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter">{t('sidebar.live_now')}</span>
            </div>
            <ExternalLink className="h-3 w-3 text-white/50 group-hover:text-white transition-colors" />
          </div>

          <div className="flex gap-3 relative z-10">
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full opacity-70 blur-[2px] group-hover:blur-[4px] transition-all" />
              <img src={DEV_AVATAR_URL} alt="Avatar" className="relative w-10 h-10 rounded-full border border-white/20 object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate group-hover:text-purple-300 transition-colors">JohnsonGuitarDev</p>
              <div className="flex items-center gap-1.5">
                <Radio className="h-3 w-3 text-purple-400" />
                <span className="text-[10px] text-purple-300/80 font-medium">{t('sidebar.streaming_game')}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-center py-1.5 rounded-lg bg-white/5 border border-white/5 group-hover:bg-purple-500/20 group-hover:border-purple-500/30 transition-all relative z-10">
            <span className="text-[10px] font-bold text-white/40 group-hover:text-white uppercase tracking-widest">{t('sidebar.watch_development')} →</span>
          </div>
        </a>
      );
    }

    return (
      <a
        href={TWITCH_CHANNEL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all duration-300 group"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={DEV_AVATAR_URL} alt="Avatar" className="w-10 h-10 rounded-full border border-white/10 grayscale group-hover:grayscale-0 transition-all duration-500" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gray-700 rounded-full border-2 border-gray-900 group-hover:bg-gray-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-400 group-hover:text-white truncate">JohnsonGuitarDev</p>
              <p className="text-[10px] text-gray-500 font-medium italic">Currently {t('user.offline')}</p>
            </div>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-gray-600 group-hover:text-gray-400 transition-colors" />
        </div>
      </a>
    );
  };

  const navItems = [
    { path: '/', label: t('nav.home'), icon: 'Home', gradient: 'from-orange-500 to-red-600', description: t('nav.home_desc') },
    { path: '/wiki', label: t('nav.wiki'), icon: 'Database', gradient: 'from-blue-500 to-indigo-600', description: t('nav.wiki_desc') },
    { path: '/guides', label: t('nav.guides'), icon: 'ShieldCheck', gradient: 'from-emerald-500 to-teal-600', description: t('nav.guides_desc') },
    { path: '/updates', label: t('nav.updates'), icon: 'Terminal', gradient: 'from-violet-500 to-fuchsia-600', description: t('nav.updates_desc') },
    { path: '/map', label: t('nav.map'), icon: 'Compass', gradient: 'from-amber-400 to-orange-500', description: t('nav.map_desc') },
    { path: '/media', label: t('nav.media'), icon: 'Camera', gradient: 'from-rose-500 to-pink-600', description: t('nav.media_desc') },
  ];

  if (location.pathname.startsWith('/tutucucu')) {
    return null;
  }

  const socialLinks = [
    {
      href: discordUrl || '#',
      title: 'Discord',
      label: 'Discord',
      hoverClass: 'hover:bg-[#5865F2]/20 hover:border-[#5865F2]/40',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" fill="#5865F2" />
        </svg>
      ),
    },
    {
      href: 'https://x.com/deadmattergame',
      title: 'X / Twitter',
      label: 'Twitter',
      hoverClass: 'hover:bg-white/10 hover:border-white/25',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
        </svg>
      ),
    },
    {
      href: 'https://qisoftware.ca/',
      title: 'Quantum Integrity',
      label: 'Dev',
      hoverClass: 'hover:bg-white/10 hover:border-white/25',
      icon: (
        <img
          src="https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/website/qilogo.png"
          alt="QI"
          className="w-5 h-5 object-contain brightness-0 invert"
        />
      ),
    },
    {
      href: 'https://www.youtube.com/@deadmattergame',
      title: 'YouTube',
      label: 'YouTube',
      hoverClass: 'hover:bg-red-600/20 hover:border-red-600/35',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FF0000" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed left-0 top-0 h-screen w-80 bg-[#0a0a0c]/95 backdrop-blur-2xl border-r border-white/5 z-40 flex flex-col shadow-[20px_0_40px_-15px_rgba(0,0,0,0.5)]"
      >
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-12 top-1/2 -translate-y-1/2 w-12 h-20 bg-[#0a0a0c] border border-l-0 border-white/5 rounded-r-2xl flex items-center justify-center cursor-pointer hover:bg-gray-900 transition-all group z-50 shadow-xl"
        >
          <div className={`w-1 h-8 rounded-full transition-all duration-300 ${isOpen ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} />
          <div className="flex flex-col items-center gap-1 text-gray-600 group-hover:text-white">
            {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </div>
        </button>

        {/* Branding */}
        <div className="p-8 border-b border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <Link to="/" className="relative z-10 block">
            <h1 className="text-3xl font-black text-white tracking-tight leading-none uppercase">
              DEAD<span className="text-red-600">MATTER</span> WIKI
            </h1>
            <div className="flex items-center gap-2 mt-1 px-1">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-red-600/50 to-transparent" />
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.3em]">{t('sidebar.community_resource')}</span>
            </div>
          </Link>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const IconComponent = Icons[item.icon] || Icons.HelpCircle;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-500 group overflow-hidden
                  ${isActive ? 'bg-white/5 text-white' : 'text-gray-500 hover:text-gray-200'}
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-2 bottom-2 w-1 bg-red-600 rounded-r-full shadow-[0_0_15px_rgba(220,38,38,0.8)]"
                  />
                )}
                <div className={`
                  relative z-10 p-2.5 rounded-xl transition-all duration-500
                  ${isActive ? `bg-gradient-to-br ${item.gradient} text-white shadow-lg` : 'bg-white/[0.03] group-hover:bg-white/[0.08] group-hover:scale-110'}
                `}>
                  <IconComponent className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="relative z-10 flex-1 min-w-0">
                  <span className={`font-bold text-sm tracking-tight block ${isActive ? 'text-white' : 'text-gray-300'}`}>
                    {item.label}
                  </span>
                  <span className="text-[10px] font-medium text-gray-600 group-hover:text-gray-400 transition-colors uppercase tracking-wider mt-0.5">
                    {item.description}
                  </span>
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 bg-black/40 border-t border-white/5 space-y-5">

          {/* Twitch Stream */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] px-1">
              Twitch Dev Streaming
            </h3>
            <StreamStatus />
          </div>

          {/* Social Links */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] px-1">
              Community
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {socialLinks.map(({ href, title, label, hoverClass, icon }) => (
                <a
                  key={title}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={title}
                  className={`flex flex-col items-center justify-center gap-1.5 px-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] transition-all duration-200 ${hoverClass}`}
                >
                  {icon}
                  <span className="text-[9px] font-bold text-gray-600 uppercase tracking-wider leading-none">
                    {label}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Version Info — mejorado */}
          <div className="relative rounded-xl bg-white/[0.03] border border-white/[0.06] px-3.5 py-2.5 flex items-center justify-between gap-3 overflow-hidden group">
            {/* subtle accent line */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-red-600/80 via-red-500/40 to-transparent rounded-l-xl" />

            <div className="flex items-center gap-2 pl-1.5">
              <Gamepad2 className="h-3.5 w-3.5 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />
              <div>
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] leading-none mb-0.5">
                  Game Version
                </p>
                <p className="text-[10px] font-medium text-gray-500 leading-none">
                  Early Access
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600/80 shadow-[0_0_6px_rgba(220,38,38,0.6)]" />
              <span className="text-sm font-black text-red-500 font-mono tracking-tight">
                v0.12.2
              </span>
            </div>
          </div>

        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;