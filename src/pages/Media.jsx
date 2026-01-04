import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/mySupabaseClient';
import { Loader2, ArrowLeft, Image, Video, Filter, X, Play, Expand, User, Calendar, Download, ExternalLink, Plus, Edit, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';

// Componente Modal para vista ampliada
const MediaModal = ({ item, onClose }) => {
    if (!item) return null;

    const extractYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const isYouTubeVideo = item.type === 'video' && extractYouTubeId(item.url);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 50 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-6xl max-h-[95vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Efectos de fondo */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-red-600/10 rounded-3xl" />

                    <div className="relative bg-[#0a0a0c] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col h-full shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]">
                        {/* Header */}
                        <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-white/10 bg-gray-900/80 backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                                <motion.button
                                    onClick={onClose}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/10"
                                >
                                    <X size={24} />
                                </motion.button>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                                    {item.description && (
                                        <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {item.author && (
                                    <div className="flex items-center gap-2 bg-orange-500/20 px-4 py-2 rounded-full border border-orange-500/30">
                                        <User className="h-4 w-4 text-orange-400" />
                                        <span className="text-orange-300 font-semibold text-sm">by {item.author}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full text-gray-300">
                                    {item.type === 'image' ? (
                                        <Image className="h-4 w-4 text-blue-400" />
                                    ) : (
                                        <Video className="h-4 w-4 text-red-400" />
                                    )}
                                    <span className="text-sm capitalize">{item.type}</span>
                                </div>
                            </div>
                        </div>

                        {/* Contenido con Scroll */}
                        <div className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
                            {item.type === 'image' ? (
                                <motion.img
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    src={item.url}
                                    alt={item.title}
                                    className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                                />
                            ) : isYouTubeVideo ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="relative w-full max-w-4xl aspect-video"
                                >
                                    <iframe
                                        src={`https://www.youtube.com/embed/${extractYouTubeId(item.url)}?autoplay=1&rel=0&modestbranding=1`}
                                        title={item.title}
                                        className="w-full h-full rounded-2xl shadow-2xl"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="relative w-full max-w-4xl"
                                >
                                    <video
                                        controls
                                        className="w-full rounded-2xl shadow-2xl"
                                        poster={item.thumbnail}
                                        autoPlay
                                    >
                                        <source src={item.url} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </motion.div>
                            )}
                        </div>

                        {/* Footer con metadatos */}
                        <div className="flex-shrink-0 flex justify-between items-center p-6 border-t border-white/10 bg-gray-900/50">
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                {item.created_at && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </div>
                                )}
                                {isYouTubeVideo && (
                                    <a
                                        href={item.video_url || item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-red-400 hover:text-red-300"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        Watch on YouTube
                                    </a>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-orange-500/30 text-orange-400 hover:bg-orange-500/20"
                                onClick={() => window.open(item.url, '_blank')}
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Open Original
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// Componente Formulario para Admin
const MediaForm = ({ item, onSave, onCancel }) => {
    const { profile } = useAuth();
    const [formData, setFormData] = useState(
        item || {
            title: '',
            type: 'image',
            url: '',
            description: '',
            image_path: '',
            meta_name: '',
            author: profile?.username || '',
            thumbnail: ''
        }
    );
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef(null);
    const { toast } = useToast();

    const formInputClass = "w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500";

    // Extraer ID de video de YouTube
    const extractYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // Generar thumbnail de YouTube
    const getYouTubeThumbnail = (url) => {
        const videoId = extractYouTubeId(url);
        if (!videoId) return '';
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Si es video de YouTube, extraer ID y generar thumbnail
        if (formData.type === 'video') {
            const videoId = extractYouTubeId(formData.url);
            if (videoId) {
                const embedUrl = `https://www.youtube.com/embed/${videoId}`;
                const thumbnail = getYouTubeThumbnail(formData.url);

                const processedData = {
                    ...formData,
                    url: embedUrl, // URL de embed para iframe
                    video_url: formData.url, // Guardar URL original
                    video_id: videoId,
                    thumbnail: formData.thumbnail || thumbnail // Usar custom o auto-generado
                };

                onSave(processedData);
                return;
            } else {
                toast({
                    title: "Invalid YouTube URL",
                    description: "Please enter a valid YouTube URL",
                    variant: "destructive"
                });
                return;
            }
        }

        onSave(formData);
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setUploading(true);
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `public/${fileName}`;
        const { error } = await supabase.storage.from('Items').upload(filePath, file);
        if (error) {
            toast({ title: "Upload Error", description: error.message, variant: "destructive" });
        } else {
            const { data: { publicUrl } } = supabase.storage.from('Items').getPublicUrl(filePath);
            setFormData(prev => ({
                ...prev,
                url: publicUrl,
                image_path: filePath,
                thumbnail: file.type.startsWith('video/') ? '' : publicUrl
            }));
        }
        setUploading(false);
    };

    const handleUrlChange = (url) => {
        let thumbnail = '';

        // Si es YouTube URL, generar thumbnail automáticamente
        if (formData.type === 'video' && (url.includes('youtube.com') || url.includes('youtu.be'))) {
            thumbnail = getYouTubeThumbnail(url);
        }

        setFormData(prev => ({
            ...prev,
            url: url,
            thumbnail: thumbnail || prev.thumbnail
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={formInputClass} required />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Meta Name</label>
                <input type="text" value={formData.meta_name} onChange={(e) => setFormData({ ...formData, meta_name: e.target.value })} className={formInputClass} />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Author</label>
                <input type="text" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} className={formInputClass} />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value, url: '', thumbnail: '' })} className={formInputClass}>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Media</label>
                {formData.type === 'image' && (
                    <div className="flex items-center gap-4 mb-2">
                        <Button type="button" onClick={() => fileInputRef.current.click()} disabled={uploading} className="gap-2"><Upload /> Upload Image</Button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        {uploading && <Loader2 className="h-5 w-5 animate-spin" />}
                    </div>
                )}

                {formData.type === 'video' && (
                    <div className="mb-3">
                        <p className="text-sm text-gray-400 mb-2">Paste YouTube URL (e.g., https://youtube.com/watch?v=... or https://youtu.be/...)</p>
                    </div>
                )}

                <input
                    type="url"
                    placeholder={
                        formData.type === 'image'
                            ? "Or paste image URL"
                            : "Paste YouTube URL"
                    }
                    value={formData.url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className={formInputClass}
                    required
                />

                {/* Vista previa */}
                {(formData.url || formData.thumbnail) && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Preview</label>
                        {formData.type === 'image' ? (
                            <img
                                src={formData.url}
                                alt="Preview"
                                className="h-48 w-auto object-cover rounded-md bg-gray-700 border border-white/10"
                            />
                        ) : formData.type === 'video' && formData.thumbnail ? (
                            <div className="relative">
                                <img
                                    src={formData.thumbnail}
                                    alt="Video Thumbnail"
                                    className="h-48 w-full object-cover rounded-md bg-gray-700 border border-white/10"
                                />
                                <div className="mt-2 text-sm text-gray-400">
                                    YouTube video detected: {extractYouTubeId(formData.url) || 'Invalid URL'}
                                </div>
                            </div>
                        ) : formData.type === 'video' && formData.url ? (
                            <div className="h-48 bg-gray-800 rounded-md border border-white/10 flex items-center justify-center">
                                <div className="text-gray-400 text-center">
                                    <Video className="w-12 h-12 mx-auto mb-2" />
                                    <p>Video URL entered</p>
                                    <p className="text-xs mt-1">(Preview will show after saving)</p>
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>

            {/* Campo para thumbnail personalizado (opcional) */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Thumbnail URL (Optional)
                    <span className="text-xs text-gray-400 ml-2">Override auto-generated thumbnail</span>
                </label>
                <input
                    type="url"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    className={formInputClass}
                    placeholder="Custom thumbnail URL"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`${formInputClass} min-h-[100px]`} />
            </div>

            <div className="flex gap-2">
                <Button type="submit" className="bg-red-600 hover:bg-red-700">{item ? 'Update' : 'Create'}</Button>
                <Button type="button" onClick={onCancel} variant="outline">Cancel</Button>
            </div>
        </form>
    );
};

// Componente principal Media
const Media = () => {
    const [mediaItems, setMediaItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const { toast } = useToast();

    const filters = [
        { key: 'all', label: 'All Media', icon: Filter, count: mediaItems.length },
        { key: 'image', label: 'Screenshots', icon: Image, count: mediaItems.filter(item => item.type === 'image').length },
        { key: 'video', label: 'Videos', icon: Video, count: mediaItems.filter(item => item.type === 'video').length }
    ];

    const extractYouTubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // Función para cargar items
    const loadItems = React.useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('media_items')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching media items:', error);
            toast({ title: "Error", description: "Could not load media items.", variant: "destructive" });
        } else {
            // Procesar items para asegurar thumbnails
            const processedItems = (data || []).map(item => {
                // Si es video de YouTube y no tiene thumbnail, generarlo
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

            setMediaItems(processedItems);
            setFilteredItems(processedItems);
        }
        setLoading(false);
    }, [toast]);

    // Función para guardar items
    const handleSave = async (item) => {
        const { id, ...itemData } = item;
        const { error } = id ?
            await supabase.from('media_items').update(itemData).eq('id', id) :
            await supabase.from('media_items').insert(itemData);

        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Saved!", description: `Media item ${id ? 'updated' : 'created'}.` });
            setShowForm(false);
            setEditingItem(null);
            loadItems();
        }
    };

    // Función para eliminar items
    const handleDelete = async (item) => {
        if (item.image_path) {
            await supabase.storage.from('Items').remove([item.image_path]);
        }
        const { error } = await supabase.from('media_items').delete().eq('id', item.id);
        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Deleted!", description: "Media item deleted successfully" });
            loadItems();
        }
    };

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    useEffect(() => {
        let filtered = mediaItems;

        // Aplicar filtro por tipo
        if (activeFilter !== 'all') {
            filtered = filtered.filter(item => item.type === activeFilter);
        }

        // Aplicar búsqueda
        if (searchQuery) {
            filtered = filtered.filter(item =>
                item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.author?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredItems(filtered);
    }, [activeFilter, searchQuery, mediaItems]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5
            }
        }),
        hover: {
            y: -10,
            scale: 1.02,
            transition: { duration: 0.2 }
        }
    };

    // Componente de tarjeta de media integrado
    const MediaCard = ({ item, index }) => {
        const isYouTubeVideo = item.type === 'video' && extractYouTubeId(item.url);

        return (
            <motion.div
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                onClick={() => setSelectedMedia(item)}
                className="group cursor-pointer bg-[#0a0a0c] border border-white/5 rounded-[2rem] overflow-hidden hover:border-red-500/30 hover:shadow-[0_20px_50px_-15px_rgba(239,68,68,0.15)] transition-all duration-500 backdrop-blur-3xl shadow-xl"
            >
                {/* Thumbnail Container - SIN ICONO DE PLAY GRANDE */}
                <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-black overflow-hidden">
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
                            {/* Overlay sutil al hacer hover */}
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

                    {/* Badge SOLO con "Video" */}
                    <div className="absolute top-3 left-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${item.type === 'image'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}>
                            {item.type === 'image' ? <Image className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                            <span className="capitalize">{item.type}</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-orange-400 transition-colors">
                        {item.title}
                    </h3>

                    {item.author && (
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                            <User className="w-4 h-4" />
                            <span className="line-clamp-1">by {item.author}</span>
                        </div>
                    )}

                    {item.description && (
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                            {item.description}
                        </p>
                    )}

                    {/* Metadata - YouTube solo aparece abajo */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-white/10">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'No date'}</span>
                        </div>

                        {/* SOLO muestra YouTube si es video de YouTube */}
                        {isYouTubeVideo && (
                            <div className="flex items-center gap-1 text-red-400">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                </svg>
                                <span>YouTube</span>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <>
            <Helmet>
                <title>Media Gallery - Dead Matter Wiki</title>
                <meta name="description" content="Browse Dead Matter screenshots, videos, and media" />
            </Helmet>

            <div className="max-w-7xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Header */}
                    <div className="mb-8">
                        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group mb-6">
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Home
                        </Link>

                        <div className="text-center mb-8">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase mb-4"
                            >
                                MEDIA <span className="text-red-500">GALLERY</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="text-gray-400 text-lg max-w-2xl mx-auto"
                            >
                                Explore stunning screenshots and videos from Dead Matter
                            </motion.p>
                        </div>
                    </div>



                    {/* Filtros y Búsqueda */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="mb-8"
                    >
                        {/* Barra de búsqueda */}
                        <div className="relative max-w-md mx-auto mb-6">
                            <input
                                type="text"
                                placeholder="Search media by title, description or author..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#0a0a0c] border border-white/5 rounded-[2rem] px-8 py-5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent backdrop-blur-3xl shadow-2xl transition-all duration-300"
                            />
                            <Filter className="absolute right-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>

                        {/* Filtros */}
                        <div className="flex flex-wrap justify-center gap-6">
                            {filters.map((filter) => (
                                <motion.button
                                    key={filter.key}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setActiveFilter(filter.key)}
                                    className={`flex items-center gap-4 px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-wider text-xs transition-all duration-500 shadow-xl border ${activeFilter === filter.key
                                            ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white border-transparent shadow-red-900/40 ring-2 ring-red-500/20'
                                            : 'bg-[#0a0a0c] text-gray-500 hover:text-white hover:bg-[#121214] border-white/5'
                                        }`}
                                >
                                    <filter.icon className="h-5 w-5" />
                                    <span>{filter.label}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs ${activeFilter === filter.key
                                            ? 'bg-white/20'
                                            : 'bg-white/10'
                                        }`}>
                                        {filter.count}
                                    </span>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="text-center">
                                <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-4" />
                                <p className="text-gray-400">Loading media...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Grid de Media */}
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
                            >
                                {filteredItems.map((item, index) => (
                                    <MediaCard
                                        key={item.id}
                                        item={item}
                                        index={index}
                                    />
                                ))}
                            </motion.div>

                            {/* Estado vacío */}
                            {filteredItems.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-16"
                                >
                                    <div className="bg-gray-800/50 border border-white/10 rounded-2xl p-12 max-w-md mx-auto">
                                        <Image className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-white mb-2">No Media Found</h3>
                                        <p className="text-gray-400">Try changing your filters or search terms.</p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Información de resultados */}
                            {filteredItems.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center text-gray-400 text-sm mb-8"
                                >
                                    Showing {filteredItems.length} of {mediaItems.length} items
                                </motion.div>
                            )}
                        </>
                    )}

                    {/* Bottom Navigation */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="flex justify-center mt-12 pt-8 border-t border-white/10"
                    >
                        <Button asChild variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/20">
                            <Link to="/">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Home
                            </Link>
                        </Button>
                    </motion.div>
                </motion.div>
            </div>

            <MediaModal item={selectedMedia} onClose={() => setSelectedMedia(null)} />
        </>
    );
};

export default Media;
