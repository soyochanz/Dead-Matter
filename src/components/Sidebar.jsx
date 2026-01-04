import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
    const interval = setInterval(checkDevStreamStatus, 180000);
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
      return <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700">
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" />
        <span className="text-xs text-gray-400">Checking status...</span>
      </div>;
    }
    if (isDevLive) {
      return <motion.a href={TWITCH_CHANNEL_URL} target="_blank" rel="noopener noreferrer" initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} whileHover={{
        scale: 1.02
      }} whileTap={{
        scale: 0.98
      }} className="block p-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 relative overflow-hidden cursor-pointer group">
        {/* Pulsing background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 animate-pulse" />

        {/* Live indicator header */}
        <div className="flex items-center justify-between mb-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Radio className="h-4 w-4 text-purple-400" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            </div>
            <span className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
              LIVE NOW!
            </span>
          </div>
          <ExternalLink className="h-3 w-3 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Streamer info */}
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 relative">
              <img src={DEV_AVATAR_URL} alt="JohnsonGuitarDev Avatar" className="w-8 h-8 rounded-full border-2 border-purple-400/80 object-cover" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white font-semibold truncate">
                JohnsonGuitarDev
              </p>
              <p className="text-xs text-purple-300 mt-0.5">
                Is now live
              </p>
            </div>
          </div>

          {/* Stream details */}
          {streamData && <div className="bg-black/20 rounded-lg p-2">
            <p className="text-xs text-white/90 font-medium leading-tight">
              {streamData.title}
            </p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-purple-300">{streamData.game_name}</span>
              <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Live
              </span>
            </div>
          </div>}
        </div>

        {/* Hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />

        {/* Click hint */}
        <div className="absolute bottom-2 right-2 text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
          Click to watch →
        </div>
      </motion.a>;
    }
    return <motion.a href={TWITCH_CHANNEL_URL} target="_blank" rel="noopener noreferrer" whileHover={{
      scale: 1.02
    }} whileTap={{
      scale: 0.98
    }} className="block p-3 rounded-xl bg-gray-800/30 border border-gray-700/50 hover:bg-gray-700/40 hover:border-gray-600/60 transition-all duration-300 group cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 relative">
            <img src={DEV_AVATAR_URL} alt="JohnsonGuitarDev Avatar" className="w-10 h-10 rounded-full border-2 border-gray-600/50 object-cover" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-500 rounded-full border-2 border-gray-800" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-300 group-hover:text-white">
              JohnsonGuitarDev
            </p>
            <p className="text-xs text-gray-500 group-hover:text-gray-400 mt-0.5">
              Is not streaming
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-700/50 group-hover:bg-gray-600/50">
            <div className="w-2 h-2 bg-gray-500 rounded-full" />
            <span className="text-xs text-gray-400">Off</span>
          </div>
          <ExternalLink className="h-3 w-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Click hint */}
      <div className="mt-2 text-center text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
        Click to follow on Twitch
      </div>
    </motion.a>;
  };
  const navItems = [{
    path: '/',
    label: 'Home',
    icon: 'Home',
    gradient: 'from-red-600 to-orange-600',
    description: 'Main dashboard'
  }, {
    path: '/wiki',
    label: 'Wiki',
    icon: 'BookOpen',
    gradient: 'from-blue-600 to-cyan-600',
    description: 'Game knowledge base'
  }, {
    path: '/guides',
    label: 'Guides',
    icon: 'ClipboardList',
    gradient: 'from-green-600 to-emerald-600',
    description: 'Tips and strategies'
  }, {
    path: '/updates',
    label: 'Updates',
    icon: 'Bell',
    gradient: 'from-purple-600 to-violet-600',
    description: 'Latest patches & news'
  }, {
    path: '/map',
    label: 'Map',
    icon: 'MapPin',
    gradient: 'from-yellow-600 to-amber-600',
    description: 'Interactive world map'
  }, {
    path: '/media',
    label: 'Media',
    icon: 'Image',
    gradient: 'from-pink-600 to-rose-600',
    description: 'Screenshots & videos'
  }];
  if (location.pathname.startsWith('/tutucucu')) {
    return null;
  }
  return <>
    {/* Mobile Overlay */}
    <AnimatePresence>
      {isOpen && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} onClick={toggleSidebar} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" />}
    </AnimatePresence>

    {/* Sidebar Container */}
    <motion.aside initial={false} animate={{
      x: isOpen ? 0 : -320
    }} transition={{
      type: "spring",
      damping: 30,
      stiffness: 300
    }} className="fixed left-0 top-0 h-screen w-80 bg-gray-900/95 backdrop-blur-xl border-r border-white/10 z-40 flex flex-col shadow-2xl shadow-black/50">
      {/* Toggle Button - Bookmark Style */}
      <button onClick={toggleSidebar} className="absolute -right-8 top-1/2 -translate-y-1/2 w-8 h-24 bg-gray-900/95 border-y border-r border-white/10 rounded-r-xl flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors group shadow-lg z-50 outline-none focus:outline-none" aria-label={isOpen ? "Close sidebar" : "Open sidebar"}>
        {/* Vertical line decoration */}
        <div className={`absolute left-0 top-2 bottom-2 w-[2px] rounded-full transition-colors duration-300 ${isOpen ? 'bg-red-500/50 group-hover:bg-red-500' : 'bg-green-500/50 group-hover:bg-green-500'}`} />

        {/* Icon */}
        <div className="text-gray-400 group-hover:text-white transition-colors">
          {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </div>
      </button>

      {/* Header with clean logo - Movido más arriba */}
      <div className="relative p-4 border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10" />

        <div className="relative z-10">
          {/* Clean logo sin badge grande arriba */}
          <div className="flex flex-col items-center">
            <img src="https://facbshcmgrjexsvpuwgn.supabase.co/storage/v1/object/public/website/logo-qlstc.PNG" alt="Dead Matter Wiki Logo" className="w-40 h-auto brightness-110 contrast-110" />

            {/* Subtitle más compacto - SIN versión aquí */}
            <div className="flex items-center gap-2 mt-2">
              <Sparkles className="h-3 w-3 text-orange-400" />
              <span className="text-xs text-gray-400 font-medium">Dead Matter Community Wiki</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map(item => {
          const IconComponent = Icons[item.icon] || Icons.HelpCircle;
          const isActive = location.pathname === item.path;
          return <motion.div key={item.path} onHoverStart={() => setActiveHover(item.path)} onHoverEnd={() => setActiveHover(null)} whileHover={{
            x: 4
          }} className="relative">
            <NavLink to={item.path} className={({
              isActive
            }) => `relative flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group overflow-hidden ${isActive ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg` : 'text-gray-300 hover:text-white hover:bg-white/5'}`}>
              {/* Background effects */}
              <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

              {/* Icon with effect */}
              <div className={`relative z-10 p-2 rounded-xl ${isActive ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'} transition-all duration-300`}>
                <IconComponent className="h-5 w-5" />
              </div>

              {/* Text and description */}
              <div className="relative z-10 flex-1 min-w-0">
                <span className="font-semibold text-sm block leading-tight">
                  {item.label}
                </span>
                <span className={`text-xs mt-0.5 block transition-all duration-300 ${isActive ? 'text-white/80' : 'text-gray-500 group-hover:text-gray-400'}`}>
                  {item.description}
                </span>
              </div>

              {/* Active indicator/chevron */}
              <div className="relative z-10">
                {isActive ? <div className="w-2 h-2 bg-white rounded-full animate-pulse" /> : <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-white transform group-hover:translate-x-1 transition-all duration-300" />}
              </div>

              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </NavLink>

            {/* Decorative line on hover */}
            <motion.div initial={{
              scaleX: 0
            }} animate={{
              scaleX: activeHover === item.path && !isActive ? 1 : 0
            }} className="absolute left-0 top-1/2 w-1 h-8 bg-gradient-to-b from-red-600 to-orange-600 rounded-r-full -translate-y-1/2 origin-left" />
          </motion.div>;
        })}
      </nav>

      {/* Developer Status Section */}
      <div className="px-4 py-3 border-t border-white/10 space-y-3 bg-gray-900/50">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">
          Twitch Status
        </h3>
        <StreamStatus />

        {/* Discord Button Moderno y más pequeño */}
        {discordUrl && <motion.a href={discordUrl} target="_blank" rel="noopener noreferrer" whileHover={{
          scale: 1.02
        }} whileTap={{
          scale: 0.98
        }} className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group overflow-hidden bg-gradient-to-r from-[#5865F2] to-[#4752C4] text-white shadow-md hover:shadow-lg hover:shadow-[#5865F2]/20 border border-[#5865F2]/30">
          {/* Background effect */}
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Logo de Discord */}
          <div className="relative z-10 flex-shrink-0">
            <div className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-lg">
              <img src="https://pngimg.com/d/discord_PNG3.png" alt="Discord Logo" className="w-5 h-5 filter brightness-0 invert" />
            </div>
          </div>

          {/* Text compacto */}
          <div className="relative z-10 flex-1 min-w-0">
            <span className="font-semibold text-sm block truncate">Join Discord</span>
            <span className="text-white/70 text-xs block truncate">Community & Support</span>
          </div>

          {/* Flecha pequeña */}
          <div className="relative z-10">
            <ChevronRight className="h-3.5 w-3.5 text-white/70 transform group-hover:translate-x-0.5 transition-transform duration-300" />
          </div>

          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.a>}

        {/* Footer info compacto - CON VERSIÓN DEL JUEGO (quitado "Online") */}
        <div className="flex items-center justify-between px-1 pt-2 border-t border-white/10">
          <span className="text-xs text-gray-500">Dead Matter Wiki</span>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs text-blue-400 font-medium">v0.12.2</span>
          </div>
        </div>
      </div>

      {/* Global decorative effects */}
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-600 via-orange-600 to-transparent opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />
    </motion.aside>
  </>;
};
export default Sidebar;