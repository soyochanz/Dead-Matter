import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, MapPin, Image as ImageIcon, ArrowRight, Bell, X, Calendar, Tag, GitCommit, Shield, Car, Backpack, Hammer, ThumbsUp, User, Star, Zap, Video, ExternalLink, Radio, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/mySupabaseClient';
import UpdateCard from '@/components/UpdateCard';
import { Loader2 } from 'lucide-react';

// Componente Twitch Stream Manager
const TwitchStreamManager = () => {
  const [isLive, setIsLive] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStream, setSelectedStream] = useState(null);

  // Tu Client ID de Twitch (necesitarás registrarte como desarrollador)
  const TWITCH_CLIENT_ID = 'tu_client_id_aqui';
  const TWITCH_CLIENT_SECRET = 'tu_client_secret_aqui';
  const GAME_ID = '511224'; // ID del juego Dead Matter en Twitch

  const fetchTwitchToken = async () => {
    try {
      const response = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching Twitch token:', error);
      return null;
    }
  };

  const fetchLiveStreams = async () => {
    setLoading(true);
    try {
      const tokenData = await fetchTwitchToken();
      
      if (!tokenData?.access_token) {
        console.error('No se pudo obtener el token de Twitch');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://api.twitch.tv/helix/streams?game_id=${GAME_ID}&first=5`,
        {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Client-Id': TWITCH_CLIENT_ID,
          },
        }
      );

      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        setIsLive(true);
        setStreams(data.data);
        setSelectedStream(data.data[0]); // Selecciona el stream más popular (primero)
      } else {
        setIsLive(false);
        setStreams([]);
      }
    } catch (error) {
      console.error('Error fetching Twitch streams:', error);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  };

  // Polling cada 30 segundos para verificar streams en vivo
  useEffect(() => {
    fetchLiveStreams();
    const interval = setInterval(fetchLiveStreams, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Botón LIVE flotante */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <motion.button
          onClick={() => {
            if (isLive) {
              setIsPanelOpen(!isPanelOpen);
            } else {
              fetchLiveStreams();
            }
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative group"
        >
          {/* Efecto de pulso cuando hay stream en vivo */}
          {isLive && (
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.2, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -inset-2 bg-red-500 rounded-full blur-lg"
            />
          )}

          {/* Botón principal */}
          <div className={`relative flex items-center justify-center gap-2 px-5 py-3 rounded-full font-bold text-white shadow-2xl transition-all duration-300 ${
            isLive 
              ? 'bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500' 
              : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700'
          }`}>
            <div className="relative flex items-center gap-2">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Radio className="w-5 h-5" />
                  <span className="font-bold">
                    {isLive ? 'LIVE' : 'OFFLINE'}
                  </span>
                  {isLive && (
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-2 h-2 bg-red-400 rounded-full ml-1"
                    />
                  )}
                </>
              )}
            </div>
            {isLive && !loading && (
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isPanelOpen ? 'rotate-180' : ''}`} />
            )}
          </div>

          {/* Badge con contador de streams */}
          {isLive && streams.length > 0 && (
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              {streams.length}
            </div>
          )}
        </motion.button>
      </motion.div>

      {/* Panel desplegable con streams */}
      <AnimatePresence>
        {isPanelOpen && isLive && streams.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring", damping: 25 }}
            className="fixed bottom-24 right-6 w-96 z-50"
          >
            <div className="relative bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header del panel */}
              <div className="p-4 border-b border-white/10 bg-gradient-to-r from-red-900/20 to-purple-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-red-400" />
                    <h3 className="font-bold text-white">Live Streams</h3>
                    <span className="px-2 py-1 bg-red-600/20 text-red-400 text-xs font-bold rounded-full">
                      {streams.length} LIVE
                    </span>
                  </div>
                  <button
                    onClick={() => setIsPanelOpen(false)}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Contenido del panel */}
              <div className="max-h-[480px] overflow-y-auto">
                {/* Stream principal */}
                {selectedStream && (
                  <div className="p-4 border-b border-white/10">
                    <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                      <img
                        src={selectedStream.thumbnail_url.replace('{width}', '480').replace('{height}', '270')}
                        alt={selectedStream.user_name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        LIVE
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                        {selectedStream.viewer_count} viewers
                      </div>
                    </div>
                    
                    <h4 className="font-bold text-white mb-1 truncate">
                      {selectedStream.user_name}
                    </h4>
                    <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                      {selectedStream.title}
                    </p>
                    
                    <a
                      href={`https://twitch.tv/${selectedStream.user_login}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-2 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-semibold rounded-lg text-center transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30"
                    >
                      Watch on Twitch
                    </a>
                  </div>
                )}

                {/* Lista de otros streams */}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-300 mb-3 text-sm uppercase tracking-wider">
                    Other Live Streams
                  </h4>
                  <div className="space-y-3">
                    {streams.slice(0, 4).map((stream, index) => (
                      <motion.div
                        key={stream.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => {
                          setSelectedStream(stream);
                          // Scroll al stream principal
                          document.querySelector('.panel-content')?.scrollTo(0, 0);
                        }}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedStream?.id === stream.id 
                            ? 'bg-white/10 border border-white/20' 
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={stream.thumbnail_url.replace('{width}', '80').replace('{height}', '45')}
                            alt={stream.user_name}
                            className="w-16 h-9 object-cover rounded"
                          />
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900">
                            <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-50"></div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {stream.user_name}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {stream.viewer_count} viewers
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-500" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-white/10 bg-gray-900/80 text-center">
                <p className="text-xs text-gray-500">
                  Powered by Twitch API • Updates every 30s
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ... (el resto de tu código permanece igual: GuideCard, MediaCard, UpdateDetailModal, VersionTag, Home)

const GuideCard = ({ guide, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      className="relative overflow-hidden group cursor-pointer h-full"
    >
      <Link to={`/guides/${guide.slug || guide.id}`} className="block h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-orange-600/10 opacity-20 group-hover:opacity-30 transition-opacity duration-300 rounded-2xl" />

        <div className="relative bg-gray-900/90 border border-white/10 backdrop-blur-sm rounded-2xl group-hover:border-white/20 transition-all duration-300 h-full flex flex-col">

          <div className="relative aspect-video overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-gray-900/40 z-10" />
            <img
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 relative z-0"
              alt={`Cover image for ${guide.title}`}
              src={guide.image_url || "https://images.unsplash.com/photo-1467746474745-41dd2c7524ce"}
            />
          </div>

          <div className="p-6 flex-grow flex flex-col">
            <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight group-hover:text-red-400 transition-colors">
              {guide.title}
            </h3>
            
             {guide.hashtags && Array.isArray(guide.hashtags) && guide.hashtags.length > 0 && (
                 <div className="flex flex-wrap gap-2 mb-3">
                     {guide.hashtags.slice(0, 2).map((tag, i) => (
                         <span key={i} className="text-[10px] uppercase font-bold text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded border border-blue-500/30">
                             #{tag}
                         </span>
                     ))}
                     {guide.hashtags.length > 2 && (
                         <span className="text-[10px] text-gray-500">+{guide.hashtags.length - 2}</span>
                     )}
                 </div>
             )}

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <User size={16} className="text-blue-400" />
                <span>{guide.author?.username || 'Anonymous'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <ThumbsUp size={16} className="text-green-400" />
                <span>{guide.likes_count}</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-orange-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </div>

        <div className="absolute inset-0 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-red-900/50" />
      </Link>
    </motion.div>
  );
};

const MediaCard = ({ item, index }) => {
  const extractYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const isYouTubeVideo = item.type === 'video' && extractYouTubeId(item.url);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 1.3 + index * 0.1 }}
      className="group cursor-pointer"
    >
      <Link to="/media" className="block">
        <div className="relative overflow-hidden rounded-2xl aspect-video bg-gradient-to-br from-gray-900 to-black group-hover:shadow-2xl group-hover:shadow-orange-500/10 transition-all duration-300">
          {item.type === 'image' ? (
            <img
              src={item.url}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : isYouTubeVideo ? (
            <>
              <img
                src={item.thumbnail || `https://img.youtube.com/vi/${extractYouTubeId(item.url)}/hqdefault.jpg`}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="text-center">
                <Video className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400 font-medium">Video</p>
              </div>
            </div>
          )}
          
          <div className="absolute top-3 left-3">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
              item.type === 'image' 
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              {item.type === 'image' ? <ImageIcon className="w-3 h-3" /> : <Video className="w-3 h-3" />}
              <span className="capitalize">{item.type}</span>
            </div>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
            <h3 className="text-white font-bold text-lg mb-1 line-clamp-1">
              {item.title}
            </h3>
            {item.author && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <User size={14} />
                <span>{item.author}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const UpdateDetailModal = ({ update, onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl max-h-[95vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-orange-600/10 rounded-3xl" />

          <div className="relative bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/10"
              >
                <X size={24} />
              </motion.button>
            </div>

            <div className="p-8">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold text-white mb-4"
              >
                {update.title}
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap items-center gap-x-6 gap-y-3 text-gray-400 text-sm mb-6"
              >
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
                  <Calendar className="h-4 w-4 text-red-400" />
                  {new Date(update.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                {update.version && (
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
                    <Tag className="h-4 w-4 text-blue-400" />
                    {update.version}
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="prose prose-invert prose-headings:text-white prose-p:text-gray-300 prose-a:text-red-400 prose-img:rounded-xl prose-video:rounded-xl max-w-none prose-lg"
                dangerouslySetInnerHTML={{ __html: update.content }}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const versionColors = [
  { bg: 'from-blue-600 to-cyan-600', text: 'text-blue-400' },
  { bg: 'from-green-600 to-emerald-600', text: 'text-green-400' },
  { bg: 'from-purple-600 to-violet-600', text: 'text-purple-400' },
  { bg: 'from-yellow-600 to-amber-600', text: 'text-yellow-400' },
  { bg: 'from-red-600 to-rose-600', text: 'text-red-400' },
  { bg: 'from-indigo-600 to-blue-600', text: 'text-indigo-400' },
  { bg: 'from-pink-600 to-rose-600', text: 'text-pink-400' }
];

const VersionTag = ({ version }) => {
  if (!version) return null;

  if (version.toLowerCase().includes('nightly')) {
    return (
      <span className="flex-shrink-0 ml-4 items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-indigo-900 to-purple-900 border border-indigo-500/30 text-indigo-200 shadow-lg flex items-center">
        <Tag className="h-4 w-4 mr-2 text-indigo-400" />
        {version}
      </span>
    );
  }

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

const Home = () => {
  // ... (todos tus estados existentes permanecen igual)
  const [latestUpdate, setLatestUpdate] = useState(null);
  const [latestMedia, setLatestMedia] = useState([]);
  const [latestCommits, setLatestCommits] = useState([]);
  const [topGuides, setTopGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUpdate, setSelectedUpdate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const extractYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
      };
      
      const updatePromise = supabase.from('updates').select('*').order('date', { ascending: false }).limit(1);
      const mediaPromise = supabase.from('media_items').select('*').order('created_at', { ascending: false }).limit(3);
      const commitsPromise = supabase.from('micro_changes').select('*').order('created_at', { ascending: false }).limit(10);
      const guidesPromise = supabase
        .from('guides')
        .select('id, title, likes_count, image_url, slug, hashtags, author:profiles(username)')
        .eq('status', 'approved')
        .order('likes_count', { ascending: false })
        .limit(4);

      const [updateResult, mediaResult, commitsResult, guidesResult] = await Promise.all([
        updatePromise, 
        mediaPromise, 
        commitsPromise, 
        guidesPromise
      ]);

      if (updateResult.data && updateResult.data.length > 0) setLatestUpdate(updateResult.data[0]);
      
      if (mediaResult.data) {
        const processedMedia = mediaResult.data.map(item => {
          if (item.type === 'video' && !item.thumbnail) {
            const videoId = extractYouTubeId(item.url);
            if (videoId) {
              return {
                ...item,
                thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                author: item.author || 'Community Member',
              };
            }
          }
          
          return {
            ...item,
            author: item.author || 'Community Member',
            thumbnail: item.thumbnail || (item.type === 'image' ? item.url : '')
          };
        });
        setLatestMedia(processedMedia);
      }
      
      if (commitsResult.data) setLatestCommits(commitsResult.data);
      if (guidesResult.data) setTopGuides(guidesResult.data);

      setLoading(false);
    };
    fetchData();
  }, []);

  const features = [
    {
      icon: BookOpen,
      title: 'Wiki',
      description: 'Comprehensive game guides and information',
      link: '/wiki'
    },
    {
      icon: MapPin,
      title: 'Interactive Map',
      description: 'Explore the game world',
      link: '/map'
    }
  ];

  const shortcuts = [
    { icon: Shield, title: 'Weapons', link: '/wiki/weapons' },
    { icon: Car, title: 'Vehicles', link: '/wiki/vehicles' },
    { icon: Backpack, title: 'Gear', link: '/wiki/gear' },
    { icon: Hammer, title: 'Basebuilding', link: '/wiki/basebuilding' },
  ];

  return (
    <>
      <Helmet>
        <title>Dead Matter Wiki | Guides, Interactive Map, Weapons, Crafting & Updates</title>
        <meta name="description" content="Dead Matter Wiki: complete guides, interactive map, crafting recipes, weapons, vehicles, loot locations, base building, zombies and survival tips. Updated daily by the community." />
      </Helmet>

      {/* Añade el componente TwitchStreamManager aquí */}
      <TwitchStreamManager />

      <div className="max-w-7xl mx-auto px-4">
        {/* ... (todo el resto de tu JSX permanece exactamente igual) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
          >
            Dead Matter Wiki
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
          >
            The most complete community resource for the survival game Dead Matter. Find detailed guides on weapons, crafting, base building, zombies, loot systems, vehicles, maps, NPCs, and every mechanic available in the latest versions.
          </motion.p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-red-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading survival database...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-16">
            {/* ... (todo el resto de tu JSX) */}
            {/* Explore Features */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  >
                    <Link to={feature.link}>
                      <div className="relative overflow-hidden group cursor-pointer h-full">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-orange-600/10 opacity-20 group-hover:opacity-30 transition-opacity duration-300 rounded-2xl" />

                        <div className="relative bg-gray-900/90 border border-white/10 backdrop-blur-sm rounded-2xl group-hover:border-white/20 transition-all duration-300 h-full p-8 text-center">
                          <div className="p-3 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 shadow-lg inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
                            <feature.icon className="h-8 w-8 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                          <p className="text-gray-400 leading-relaxed">{feature.description}</p>

                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-orange-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Quick Access */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="relative mb-16"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700">
                      <Zap className="w-6 h-6 text-red-400" />
                    </div>
                    Quick Access
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {shortcuts.map((shortcut, index) => (
                    <motion.div
                      key={shortcut.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -6, scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Link to={shortcut.link}>
                        <div className="relative bg-gray-900/90 border border-white/10 rounded-2xl p-6 text-center hover:border-white/20 transition-all duration-300">

                          <div className="p-3 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 shadow-lg inline-flex mb-4">
                            <shortcut.icon className="h-8 w-8 text-white" />
                          </div>

                          <h4 className="text-xl font-semibold text-white mb-2">
                            {shortcut.title}
                          </h4>

                          <p className="text-gray-400 text-sm">
                            {index === 0 && "All weapons data"}
                            {index === 1 && "All vehicles & specs"}
                            {index === 2 && "Equipment lists"}
                            {index === 3 && "Building system info"}
                          </p>

                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-orange-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            </motion.section>

            {/* Top Guides */}
            {topGuides.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-yellow-600 to-amber-600">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    Top Community Guides
                  </h2>
                  <Link to="/guides" className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors group">
                    View all guides <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {topGuides.map((guide, index) => (
                    <GuideCard key={guide.id} guide={guide} index={index} />
                  ))}
                </div>
              </motion.section>
            )}

            {/* Latest Update */}
            {latestUpdate && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600">
                      <Bell className="w-6 h-6 text-white" />
                    </div>
                    Latest Update
                  </h2>
                  <Link to="/updates" className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors group">
                    View all updates <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                <UpdateCard
                  update={latestUpdate}
                  index={0}
                  onReadMore={setSelectedUpdate}
                  versionTag={<VersionTag version={latestUpdate.version} />}
                />
              </motion.section>
            )}

            {/* Latest Commits */}
            {latestCommits.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600">
                      <GitCommit className="w-6 h-6 text-white" />
                    </div>
                    Recent Commits
                  </h2>
                  <a
                    href="https://discord.gg/deadmatter"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors group"
                  >
                    View more on Discord <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
                <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-4">
                  {latestCommits.map((commit, index) => (
                    <motion.div
                      key={commit.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 1.1 + index * 0.05 }}
                      className="flex items-start gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors duration-300"
                    >
                      <div className="px-2 py-1 bg-blue-500/20 rounded text-blue-400 text-xs font-mono font-bold mt-0.5">
                        {commit.id.substring(0, 7)}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-300 text-sm">{commit.message}</p>
                        <div className="flex justify-between items-center mt-1">
                            <p className="text-gray-500 text-xs">- {commit.author}</p>
                            <p className="text-gray-500 text-xs">{new Date(commit.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Latest Media */}
            {latestMedia.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600">
                      <ImageIcon className="w-6 h-6 text-white" />
                    </div>
                    Latest Media
                  </h2>
                  <Link to="/media" className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors group">
                    View all media <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {latestMedia.map((item, index) => (
                    <MediaCard 
                      key={item.id}
                      item={item}
                      index={index}
                    />
                  ))}
                </div>
              </motion.section>
            )}

            {/* Trailer */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              <h2 className="text-3xl font-bold text-white text-center mb-8 flex items-center justify-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                Official Trailer
              </h2>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-red-900/50 border border-white/10">
                <div className="aspect-video">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/8R0fkYHOpzA?si=__y_g_q_q_q_q_q"
                    title="Dead Matter Trailer"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="rounded-2xl"
                  ></iframe>
                </div>
              </div>
            </motion.section>
          </div>
        )}
      </div>

      {selectedUpdate && <UpdateDetailModal update={selectedUpdate} onClose={() => setSelectedUpdate(null)} />}
    </>
  );
};

export default Home;