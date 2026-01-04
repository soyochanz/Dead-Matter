import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { ChevronRight, ChevronLeft, Sparkles, Radio, ExternalLink, ArrowRight } from 'lucide-react';
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
      return (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 animate-pulse">
          <div className="w-2 h-2 bg-slate-500 rounded-full" />
          <div className="h-3 w-24 bg-white/10 rounded" />
        </div>
      );
    }

    if (isDevLive) {
      return (
        <motion.a
          href={TWITCH_CHANNEL_URL} target="_blank" rel="noopener noreferrer"
          whileHover={{ y: -2, scale: 1.02 }}
          className="relative block p-4 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 overflow-hidden group shadow-lg shadow-purple-500/10"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
                <div className="relative w-2 h-2 bg-red-500 rounded-full" />
              </div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest bg-red-500 px-1.5 py-0.5 rounded">LIVE</span>
            </div>
            <ExternalLink className="h-3 w-3 text-white/50 group-hover:text-white transition-colors" />
          </div>
          <div className="relative z-10 flex items-center gap-3">
            <img src={DEV_AVATAR_URL} className="w-10 h-10 rounded-xl border border-white/10 shadow-lg object-cover" alt="" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate leading-none">JohnsonGuitarDev</p>
              <p className="text-[10px] text-purple-300 font-medium mt-1 truncate">{streamData?.title || 'Developing Dead Matter'}</p>
            </div>
          </div>
        </motion.a>
      );
    }

    return (
      <motion.a
        href={TWITCH_CHANNEL_URL} target="_blank" rel="noopener noreferrer"
        whileHover={{ y: -2 }}
        className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 group"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={DEV_AVATAR_URL} className="w-10 h-10 rounded-xl grayscale opacity-50 border border-white/5 object-cover" alt="" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-slate-800 rounded-full border-2 border-gray-950" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">JohnsonGuitar</p>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Offline</p>
          </div>
        </div>
        <ExternalLink className="h-3.5 w-3.5 text-slate-700 group-hover:text-slate-400 transition-colors" />
      </motion.a>
    );
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
      <div className="relative p-6 border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10" />

        <div className="relative z-10">
          <Link to="/" className="flex flex-col items-center group">
            <h1 className="text-2xl font-black text-white tracking-tighter leading-none">
              DEAD MATTER <span className="text-red-500 group-hover:text-red-400 transition-colors">WIKI</span>
            </h1>

            <div className="flex items-center gap-2 mt-2">
              <Sparkles className="h-3 w-3 text-red-500 group-hover:animate-pulse" />
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Community Resource</span>
            </div>
          </Link>
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

        {/* Discord Button Premium Wiki Style */}
        {discordUrl && (
          <motion.a
            href={discordUrl} target="_blank" rel="noopener noreferrer"
            whileHover={{ y: -2 }}
            className="relative flex items-center gap-4 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group overflow-hidden"
          >
            {/* Red glow on hover */}
            <div className="absolute -inset-1 bg-red-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="relative z-10 flex-shrink-0 w-10 h-10 flex items-center justify-center bg-slate-950/80 rounded-xl border border-white/5 group-hover:border-red-500/50 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-300">
              <img src="https://pngimg.com/d/discord_PNG3.png" alt="Discord" className="w-5 h-5 filter brightness-0 invert opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="relative z-10 flex-1 min-w-0">
              <span className="text-sm font-black text-white uppercase tracking-tight block">Join Discord</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mt-0.5 group-hover:text-red-500 transition-colors">Official Community</span>
            </div>

            <ArrowRight className="h-4 w-4 text-slate-700 group-hover:text-white transform group-hover:translate-x-1 transition-all duration-300" />
          </motion.a>
        )}

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