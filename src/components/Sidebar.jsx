import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { ChevronRight, ChevronLeft, Sparkles, Radio, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/mySupabaseClient';
const Sidebar = ({
  isOpen,
  toggleSidebar
}) => {
  const location = useLocation();
  const [discordUrl, setDiscordUrl] = useState('');
  const [activeHover, setActiveHover] = useState(null);
  const [isDevLive, setIsDevLive] = useState(false);
  const [streamData, setStreamData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Configuration - only need the username
  const DEV_TWITCH_USERNAME = 'johnsonguitardev';
  const TWITCH_CHANNEL_URL = `https://www.twitch.tv/${DEV_TWITCH_USERNAME}`;
  const DEV_AVATAR_URL = 'https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/Items/avatars/3f234dbf-0f5e-4b74-8422-75d087be56ce-profile_image-300x300.png';
  useEffect(() => {
    const fetchSettings = async () => {
      const {
        data,
        error
      } = await supabase.from('map_settings').select('discord_url').limit(1).single();
      if (!error && data && data.discord_url) {
        setDiscordUrl(data.discord_url);
      }
    };
    fetchSettings();
    checkDevStreamStatus();
    const interval = setInterval(checkDevStreamStatus, 600000); // Check every 10 minutes for performance
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
    // Direct fetch to Twitch fails due to CORS. Disabling to prevent console errors.
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
        <motion.a
          href={TWITCH_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="relative block p-4 rounded-2xl overflow-hidden group cursor-pointer border border-purple-500/50"
        >
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-orange-600/20 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.3),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Pulsing "LIVE" indicator */}
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter">LIVE NOW</span>
            </div>
            <ExternalLink className="h-3 w-3 text-white/50 group-hover:text-white transition-colors" />
          </div>

          {/* Streamer details */}
          <div className="flex gap-3 relative z-10">
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full opacity-70 blur-[2px] group-hover:blur-[4px] transition-all" />
              <img src={DEV_AVATAR_URL} alt="Avatar" className="relative w-10 h-10 rounded-full border border-white/20 object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate group-hover:text-purple-300 transition-colors">JohnsonGuitarDev</p>
              <div className="flex items-center gap-1.5">
                <Radio className="h-3 w-3 text-purple-400" />
                <span className="text-[10px] text-purple-300/80 font-medium">Streaming Dead Matter</span>
              </div>
            </div>
          </div>

          {/* Hover Clue */}
          <div className="mt-3 flex items-center justify-center py-1.5 rounded-lg bg-white/5 border border-white/5 group-hover:bg-purple-500/20 group-hover:border-purple-500/30 transition-all relative z-10">
            <span className="text-[10px] font-bold text-white/40 group-hover:text-white uppercase tracking-widest">Watch Development →</span>
          </div>
        </motion.a>
      );
    }

    return (
      <motion.a
        href={TWITCH_CHANNEL_URL}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ x: 4 }}
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
              <p className="text-[10px] text-gray-500 font-medium italic">Currently handling tech...</p>
            </div>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-gray-600 group-hover:text-gray-400 transition-colors" />
        </div>
      </motion.a>
    );
  };

  const navItems = [{
    path: '/',
    label: 'Home',
    icon: 'Home',
    gradient: 'from-orange-500 to-red-600',
    description: 'Main dashboard'
  }, {
    path: '/wiki',
    label: 'Wiki',
    icon: 'Database',
    gradient: 'from-blue-500 to-indigo-600',
    description: 'Game knowledge base'
  }, {
    path: '/guides',
    label: 'Guides',
    icon: 'ShieldCheck',
    gradient: 'from-emerald-500 to-teal-600',
    description: 'Tips and strategies'
  }, {
    path: '/updates',
    label: 'Updates',
    icon: 'Terminal',
    gradient: 'from-violet-500 to-fuchsia-600',
    description: 'Latest patches & news'
  }, {
    path: '/map',
    label: 'Map',
    icon: 'Compass',
    gradient: 'from-amber-400 to-orange-500',
    description: 'Interactive world map'
  }, {
    path: '/media',
    label: 'Media',
    icon: 'Camera',
    gradient: 'from-rose-500 to-pink-600',
    description: 'Screenshots & videos'
  }];

  if (location.pathname.startsWith('/tutucucu')) {
    return null;
  }

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
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.3em]">Community Resource</span>
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
                {/* Active Indicator Bar */}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-2 bottom-2 w-1 bg-red-600 rounded-r-full shadow-[0_0_15px_rgba(220,38,38,0.8)]"
                  />
                )}

                {/* Icon Container */}
                <div className={`
                  relative z-10 p-2.5 rounded-xl transition-all duration-500
                  ${isActive ? `bg-gradient-to-br ${item.gradient} text-white shadow-lg` : 'bg-white/[0.03] group-hover:bg-white/[0.08] group-hover:scale-110'}
                `}>
                  <IconComponent className="h-5 w-5" strokeWidth={1.5} />
                </div>

                {/* Label & Description */}
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

        {/* Footer Actions */}
        <div className="p-6 bg-black/40 border-t border-white/5 space-y-4">
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] px-1">Status Transmission</h3>
            <StreamStatus />
            {/* Discord Button */}
            {discordUrl && (
              <motion.a
                href={discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group overflow-hidden bg-[#5865F2]/10 border border-[#5865F2]/20 hover:bg-[#5865F2]/20 shadow-[0_10px_30px_-10px_rgba(88,101,242,0.3)]"
              >
                <div className="relative z-10 w-10 h-10 flex items-center justify-center bg-[#5865F2] rounded-xl shadow-[0_0_15px_rgba(88,101,242,0.5)]">
                  <img
                    src="https://pngimg.com/d/discord_PNG3.png"
                    alt="Discord"
                    className="w-6 h-6 object-contain brightness-0 invert"
                  />
                </div>
                <div className="relative z-10 flex flex-col leading-none">
                  <span className="text-[10px] font-black text-[#5865F2] uppercase tracking-[0.22em] mb-1">Official Link</span>
                  <span className="text-sm font-black text-white tracking-tight">Join Official Discord</span>
                </div>

                {/* Animated Shine */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shine" />
              </motion.a>
            )}
          </div>

          {/* Version Info */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <div className="h-[4px] w-[4px] bg-red-600 rounded-full animate-ping" />
              <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Alpha Database</span>
            </div>
            <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
              <span className="text-[10px] font-mono font-bold text-red-600">v0.12.2</span>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
