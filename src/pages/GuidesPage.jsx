import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/mySupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, User, Calendar, MessageSquare, ThumbsUp, ArrowRight, Trophy, Star, Zap, Hash, ListFilter, Clock, ArrowDownUp } from 'lucide-react';
import { motion } from 'framer-motion';

const CreatorCard = ({ title, icon: Icon, creator, colorClass, delay }) => {
  if (!creator) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-[#0a0a0c] border border-white/5 rounded-3xl p-6 relative overflow-hidden group shadow-xl"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorClass} opacity-10 rounded-bl-full -mr-4 -mt-4`} />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClass}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-bold text-white text-sm uppercase tracking-wider">{title}</h3>
        </div>

        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-xl font-bold text-white`}>
            {creator.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-bold text-white">{creator.username}</p>
            <p className="text-sm text-gray-400">{creator.subtext}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const GuidesPage = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('top'); // 'top', 'new', 'old'
  const { user } = useAuth();

  useEffect(() => {
    const fetchGuides = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('guides')
        .select(`
          id,
          title,
          description,
          created_at,
          likes_count,
          image_url,
          slug,
          hashtags,
          author:profiles(id, username),
          comments:guide_comments(count)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false }); // Default initial fetch order

      if (error) {
        console.error('Error fetching guides:', error);
      } else {
        setGuides(data);
      }
      setLoading(false);
    };
    fetchGuides();
  }, []);

  const sortedGuides = useMemo(() => {
    const sorted = [...guides];
    switch (sortBy) {
      case 'top':
        return sorted.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
      case 'new':
        return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'old':
        return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      default:
        return sorted;
    }
  }, [guides, sortBy]);

  const stats = useMemo(() => {
    if (!guides.length) return { allTime: null, thisWeek: null, mostValued: null };

    const creatorStats = {};
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    guides.forEach(guide => {
      if (!guide.author) return;
      const authorId = guide.author.id;

      if (!creatorStats[authorId]) {
        creatorStats[authorId] = {
          username: guide.author.username,
          totalGuides: 0,
          weeklyGuides: 0,
          totalLikes: 0
        };
      }

      creatorStats[authorId].totalGuides += 1;
      creatorStats[authorId].totalLikes += (guide.likes_count || 0);
      if (new Date(guide.created_at) >= weekAgo) {
        creatorStats[authorId].weeklyGuides += 1;
      }
    });

    const creators = Object.values(creatorStats);

    const allTime = [...creators].sort((a, b) => b.totalGuides - a.totalGuides)[0];
    const thisWeek = [...creators].filter(c => c.weeklyGuides > 0).sort((a, b) => b.weeklyGuides - a.weeklyGuides)[0];
    const mostValued = [...creators].sort((a, b) => b.totalLikes - a.totalLikes)[0];

    return {
      allTime: allTime ? { ...allTime, subtext: `${allTime.totalGuides} Guides Created` } : null,
      thisWeek: thisWeek ? { ...thisWeek, subtext: `${thisWeek.weeklyGuides} New Guides` } : null,
      mostValued: mostValued ? { ...mostValued, subtext: `${mostValued.totalLikes} Total Likes` } : null
    };
  }, [guides]);


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const getGuideColor = () => {
    return 'from-red-600 to-orange-600';
  };

  return (
    <>
      <Helmet>
        <title>Guides - Dead Matter Wiki</title>
        <meta name="description" content="Find community-created guides for Dead Matter." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4">
        {/* ... (Header kept implicitly by minimal diff, but ensures safely rendered) ... */}
        <div className="text-center mb-12">
          {/* Headers ... */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase mb-4"
          >
            COMMUNITY <span className="text-red-500">GUIDES</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto mb-8"
          >
            Learn from experienced survivors. Strategy tips, base building, and survival techniques.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {user ? (
              <Button asChild className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 border-0 shadow-lg">
                <Link to="/guides/create">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Guide
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="border-white/20 hover:bg-white/10">
                <Link to="/register">Register to Create a Guide</Link>
              </Button>
            )}
          </motion.div>
        </div>

        {!loading && guides.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <CreatorCard
              title="Top Creator (All Time)"
              icon={Trophy}
              creator={stats.allTime}
              colorClass="from-yellow-500 to-amber-500"
              delay={0.3}
            />
            <CreatorCard
              title="Rising Star (This Week)"
              icon={Zap}
              creator={stats.thisWeek}
              colorClass="from-blue-500 to-cyan-500"
              delay={0.4}
            />
            <CreatorCard
              title="Most Valued (Likes)"
              icon={Star}
              creator={stats.mostValued}
              colorClass="from-purple-500 to-pink-500"
              delay={0.5}
            />
          </div>
        )}

        {/* Sorting Toolbar */}
        {!loading && guides.length > 0 && (
          <div className="flex justify-end mb-8">
            <div className="bg-[#0a0a0c] border border-white/5 p-1.5 rounded-xl flex gap-1 shadow-2xl">
              <Button
                variant={sortBy === 'top' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('top')}
                className={sortBy === 'top' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}
              >
                <Star className="w-4 h-4 mr-2" />
                Top Rated
              </Button>
              <Button
                variant={sortBy === 'new' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('new')}
                className={sortBy === 'new' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}
              >
                <Clock className="w-4 h-4 mr-2" />
                Newest
              </Button>
              <Button
                variant={sortBy === 'old' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('old')}
                className={sortBy === 'old' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}
              >
                <ArrowDownUp className="w-4 h-4 mr-2" />
                Oldest
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-red-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading survival guides...</p>
            </div>
          </div>
        ) : guides.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="bg-[#0a0a0c] border border-white/5 rounded-[2rem] p-12 max-w-md mx-auto shadow-2xl">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Archive Empty</h3>
              <p className="text-gray-500 font-medium mb-8">Be the first to share your survival knowledge!</p>
              {user ? (
                <Button asChild className="bg-gradient-to-r from-red-600 to-orange-600">
                  <Link to="/guides/create">Create First Guide</Link>
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link to="/register">Join Community</Link>
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={sortBy} // Re-animate on sort change
          >
            {sortedGuides.map((guide) => (
              <motion.div
                key={guide.id}
                variants={itemVariants}
                whileHover={{
                  y: -8,
                  scale: 1.02,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                className="group cursor-pointer h-full"
              >
                {/* Link now uses slug */}
                <Link to={`/guides/${guide.slug || guide.id}`} className="h-full block">
                  <div className="relative overflow-hidden h-full">
                    <div className={`absolute inset-0 bg-gradient-to-br ${getGuideColor(guide.title)} opacity-20 group-hover:opacity-30 transition-opacity duration-300 rounded-2xl`} />
                    <div className={`absolute inset-0 bg-gradient-to-r ${getGuideColor(guide.title)} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-sm group-hover:blur-md`} />

                    <div className="relative bg-[#0a0a0c] border border-white/5 backdrop-blur-3xl rounded-[2rem] group-hover:border-white/20 transition-all duration-500 h-full flex flex-col shadow-2xl">

                      <div className={`absolute top-4 right-4 w-3 h-3 bg-gradient-to-r ${getGuideColor(guide.title)} rounded-full opacity-60 group-hover:scale-150 group-hover:opacity-100 transition-all duration-300`} />

                      <div className="relative aspect-video overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent z-10`} />
                        <img
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          src={guide.image_url || "https://images.unsplash.com/photo-1519389950473-47ba0277781c"}
                          alt={`Cover image for ${guide.title}`}
                        />

                        <div className={`absolute top-4 left-4 bg-gradient-to-r ${getGuideColor(guide.title)} text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg z-20 flex items-center gap-1.5`}>
                          <ThumbsUp size={14} />
                          {guide.likes_count || 0}
                        </div>
                      </div>

                      <div className="p-6 flex-grow flex flex-col">
                        <h2 className="text-xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors line-clamp-2">
                          {guide.title || 'Untitled Guide'}
                        </h2>

                        {/* Display Hashtags in Card */}
                        {guide.hashtags && Array.isArray(guide.hashtags) && guide.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {guide.hashtags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="text-xs text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded border border-blue-500/30">
                                #{tag}
                              </span>
                            ))}
                            {guide.hashtags.length > 3 && (
                              <span className="text-xs text-gray-500">+{guide.hashtags.length - 3}</span>
                            )}
                          </div>
                        )}

                        <p className="text-gray-400 line-clamp-3 mb-4 flex-grow">
                          {guide.description || 'No description provided.'}
                        </p>

                        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                              <MessageSquare size={14} className="text-blue-400" />
                              <span>{Array.isArray(guide.comments) ? guide.comments[0]?.count || 0 : 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar size={14} className="text-green-400" />
                              <span>{new Date(guide.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                          <div className="flex items-center gap-2 text-sm">
                            <div className={`p-1.5 rounded-full bg-gradient-to-r ${getGuideColor(guide.title)}`}>
                              <User className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-gray-300">{guide.author?.username || 'Anonymous'}</span>
                          </div>

                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            whileHover={{ opacity: 1, x: 0 }}
                            className="flex items-center text-white/80 group-hover:text-white transition-colors duration-300"
                          >
                            <span className="text-sm font-semibold mr-2">Read</span>
                            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                          </motion.div>
                        </div>
                      </div>

                      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${getGuideColor(guide.title)} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
                    </div>

                    <div className={`absolute inset-0 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-red-900/50`} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div >
    </>
  );
};

export default GuidesPage;
