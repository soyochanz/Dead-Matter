import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/mySupabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, PlusCircle, ArrowRight, Upload, Hash, X, AlertCircle, Shield } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { translateContent } from '@/lib/gemini';
import { Globe } from 'lucide-react';

// Configuración de seguridad SIMPLIFICADA - Solo validaciones básicas
const SECURITY_CONFIG = {
    IMAGE: {
        MAX_SIZE: 5 * 1024 * 1024, // 5MB
        ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp']
    }
};

// Helper simplificado - Sin canvas para evitar problemas
const FileSecurityUtils = {
    // Validar tipo MIME y extensión
    validateFileType(file) {
        const fileExtension = '.' + file.name.toLowerCase().split('.').pop();

        // Verificar extensión peligrosa básica
        const dangerousExtensions = ['.php', '.exe', '.js', '.html', '.htm'];
        if (dangerousExtensions.includes(fileExtension)) {
            return { valid: false, error: 'File type not allowed' };
        }

        // Verificar tipo MIME permitido
        if (!SECURITY_CONFIG.IMAGE.ALLOWED_TYPES.includes(file.type)) {
            return { valid: false, error: 'Invalid image format. Allowed: JPEG, PNG, WebP' };
        }

        return { valid: true };
    },

    // Validar tamaño
    validateFileSize(file) {
        if (file.size > SECURITY_CONFIG.IMAGE.MAX_SIZE) {
            return {
                valid: false,
                error: `File too large. Maximum size: ${SECURITY_CONFIG.IMAGE.MAX_SIZE / 1024 / 1024}MB`
            };
        }
        return { valid: true };
    },

    // Sanitizar nombre de archivo básico
    sanitizeFilename(filename) {
        let sanitized = filename
            .replace(/[<>:"/\\|?*]/g, '_') // Reemplazar caracteres peligrosos
            .replace(/\s+/g, '_') // Reemplazar espacios
            .replace(/_{2,}/g, '_'); // Remover underscores múltiples

        return sanitized.substring(0, 100); // Limitar longitud
    },

    // Detectar archivos disfrazados básico
    detectDisguisedFile(filename) {
        const lowerFilename = filename.toLowerCase();

        // Detectar doble extensión
        if (/(\.jpg|\.jpeg|\.png|\.gif|\.webp)\.(php|exe|js|html|asp|aspx|jsp)$/i.test(lowerFilename)) {
            return { malicious: true, type: 'double_extension' };
        }

        return { malicious: false };
    }
};

const CreateGuidePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const quillRef = useRef(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editorKey, setEditorKey] = useState(Date.now());
    const [imagePreview, setImagePreview] = useState(null);
    const [isEditorVisible, setIsEditorVisible] = useState(true);
    const [validationErrors, setValidationErrors] = useState([]);
    const [isTranslating, setIsTranslating] = useState(false);

    // Translation State
    const [titleEs, setTitleEs] = useState('');
    const [titlePt, setTitlePt] = useState('');
    const [descriptionEs, setDescriptionEs] = useState('');
    const [descriptionPt, setDescriptionPt] = useState('');
    const [contentEs, setContentEs] = useState('');
    const [contentPt, setContentPt] = useState('');

    // New Hashtag State
    const [hashtags, setHashtags] = useState([]);
    const [currentTag, setCurrentTag] = useState('');

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                setIsEditorVisible(false);
                setTimeout(() => {
                    setIsEditorVisible(true);
                    setEditorKey(Date.now());
                }, 100);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (content || title || description) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [content, title, description, titleEs, titlePt, descriptionEs, descriptionPt, contentEs, contentPt]);

    const handleTranslateAll = async () => {
        if (!title || !description || !content) {
            toast({
                variant: 'destructive',
                title: 'Incomplete Content',
                description: 'Please fill in the title, description, and content first.'
            });
            return;
        }

        setIsTranslating(true);
        try {
            // Translate to Spanish
            const [tEs, dEs, cEs] = await Promise.all([
                translateContent(title, 'Spanish'),
                translateContent(description, 'Spanish'),
                translateContent(content, 'Spanish')
            ]);
            setTitleEs(tEs);
            setDescriptionEs(dEs);
            setContentEs(cEs);

            // Translate to Portuguese
            const [tPt, dPt, cPt] = await Promise.all([
                translateContent(title, 'Portuguese'),
                translateContent(description, 'Portuguese'),
                translateContent(content, 'Portuguese')
            ]);
            setTitlePt(tPt);
            setDescriptionPt(dPt);
            setContentPt(cPt);

            toast({
                title: 'Translations Complete',
                description: 'Spanish and Portuguese versions have been generated.'
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Translation Failed',
                description: 'Could not connect to Gemini AI. Check your API key.'
            });
        } finally {
            setIsTranslating(false);
        }
    };

    // Validación SIMPLIFICADA de archivos
    const validateImage = (file) => {
        const errors = [];

        // 1. Detección de archivos disfrazados
        const disguiseCheck = FileSecurityUtils.detectDisguisedFile(file.name);
        if (disguiseCheck.malicious) {
            errors.push(`Security alert: Suspicious file name`);
            return { success: false, errors };
        }

        // 2. Validar tipo de archivo
        const typeCheck = FileSecurityUtils.validateFileType(file);
        if (!typeCheck.valid) {
            errors.push(typeCheck.error);
        }

        // 3. Validar tamaño
        const sizeCheck = FileSecurityUtils.validateFileSize(file);
        if (!sizeCheck.valid) {
            errors.push(sizeCheck.error);
        }

        if (errors.length > 0) {
            return { success: false, errors };
        }

        // 4. Sanitizar nombre
        const sanitizedName = FileSecurityUtils.sanitizeFilename(file.name);

        return {
            success: true,
            file: file,
            sanitizedName
        };
    };

    // Tag Handlers
    const handleAddTag = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const tag = currentTag.trim().replace(/^#/, '');

            if (tag && hashtags.length < 5 && !hashtags.includes(tag)) {
                setHashtags([...hashtags, tag]);
                setCurrentTag('');
            } else if (hashtags.length >= 5) {
                toast({ variant: 'destructive', title: 'Limit Reached', description: 'You can only add up to 5 hashtags.' });
            }
        }
    };

    const removeTag = (tagToRemove) => {
        setHashtags(hashtags.filter(tag => tag !== tagToRemove));
    };

    // Image Handler for Quill - SIMPLIFICADO
    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', SECURITY_CONFIG.IMAGE.ALLOWED_TYPES.join(','));
        input.click();

        input.onchange = async () => {
            if (!input.files) return;
            const file = input.files[0];
            if (!file || !user) return;

            const quillEditor = quillRef.current?.getEditor();
            if (!quillEditor) return;

            const range = quillEditor.getSelection(true);

            try {
                // Validación básica
                const validation = validateImage(file);
                if (!validation.success) {
                    toast({
                        variant: 'destructive',
                        title: 'Image Validation Failed',
                        description: validation.errors.join(', ')
                    });
                    return;
                }

                // Subir imagen
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}_${Date.now()}.${fileExt}`;
                const filePath = `guides/content_images/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('Items')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false,
                        contentType: file.type
                    });

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from('Items')
                    .getPublicUrl(filePath);

                quillEditor.insertEmbed(range.index, 'image', urlData.publicUrl);
                quillEditor.setSelection(range.index + 1);

                toast({
                    title: 'Image Uploaded',
                    description: 'Image uploaded successfully'
                });

            } catch (error) {
                console.error('Upload error:', error);
                toast({
                    variant: 'destructive',
                    title: 'Image Upload Failed',
                    description: 'Please try again with a different image'
                });
            }
        };
    };

    // Handler seguro para cover image - SIMPLIFICADO
    const handleImageChange = (e) => {
        if (!e.target.files || !e.target.files[0]) return;

        const file = e.target.files[0];
        setValidationErrors([]);

        try {
            // Validación básica
            const validation = validateImage(file);

            if (!validation.success) {
                setValidationErrors(validation.errors);
                toast({
                    variant: 'destructive',
                    title: 'Invalid Image',
                    description: validation.errors.join(', ')
                });
                return;
            }

            // Actualizar estado con archivo
            setImageFile(file);

            // Preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.onerror = () => {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to load image preview' });
            };
            reader.readAsDataURL(file);

            toast({
                title: 'Image Selected',
                description: `${validation.sanitizedName} ready for upload`
            });

        } catch (error) {
            console.error('Image processing error:', error);
            toast({
                variant: 'destructive',
                title: 'Processing Error',
                description: 'Failed to process image. Please try another file.'
            });
        }
    };

    const videoHandler = () => {
        let url = prompt("Enter YouTube Video URL");
        if (!url || url.trim() === "") return;

        let videoId;
        const youtubeRegex =
            /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(youtubeRegex);

        if (match && match[1]) {
            videoId = match[1];
            const quillEditor = quillRef.current?.getEditor();
            if (!quillEditor) return;

            const range = quillEditor.getSelection(true);
            const embedUrl = `https://www.youtube.com/embed/${videoId}`;
            quillEditor.insertEmbed(range.index, 'video', embedUrl);
            quillEditor.setSelection(range.index + 1);
        } else {
            toast({ variant: 'destructive', title: 'Invalid URL', description: 'Please enter a valid YouTube video URL.' });
        }
    };

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'align': [] }],
                ['link', 'image', 'video'],
                ['blockquote', 'code-block'],
                ['clean']
            ],
            handlers: {
                image: imageHandler,
                video: videoHandler,
            },
        },
        clipboard: {
            matchVisual: false,
        },
    }), []); // Removida dependencia de user y toast que causaba recreación constante

    const formats = [
        'header', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'list', 'bullet', 'align',
        'link', 'image', 'video', 'blockquote', 'code-block'
    ];

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-6);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title || !description || !content) {
            return toast({
                variant: 'destructive',
                title: 'Missing Fields',
                description: 'Please fill out all required fields.',
            });
        }

        setLoading(true);
        setValidationErrors([]);

        try {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .single();

            if (profileError || !profile) {
                throw new Error('Could not find user profile. Please try again.');
            }

            let imageUrl = null;
            let imagePath = null;

            if (imageFile) {
                // Validación básica final
                const validation = validateImage(imageFile);
                if (!validation.success) {
                    setValidationErrors(validation.errors);
                    throw new Error('Image validation failed: ' + validation.errors.join(', '));
                }

                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${user.id}_${Date.now()}.${fileExt}`;
                const filePath = `guides/covers/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('Items')
                    .upload(filePath, imageFile, {
                        cacheControl: '3600',
                        upsert: false,
                        contentType: imageFile.type
                    });

                if (uploadError) {
                    throw uploadError;
                }

                const { data: urlData } = supabase.storage
                    .from('Items')
                    .getPublicUrl(filePath);

                imageUrl = urlData.publicUrl;
                imagePath = filePath;
            }

            const contentHtml = quillRef.current?.getEditor()?.root?.innerHTML || '';
            const slug = generateSlug(title);

            const { error: insertError } = await supabase.from('guides').insert({
                title,
                description,
                content: content,
                content_html: contentHtml,
                title_es: titleEs,
                title_pt: titlePt,
                description_es: descriptionEs,
                description_pt: descriptionPt,
                content_es: contentEs,
                content_pt: contentPt,
                image_url: imageUrl,
                image_path: imagePath,
                author_id: profile.id,
                status: 'pending',
                slug: slug,
                hashtags: hashtags
            });

            if (insertError) throw insertError;

            toast({
                title: 'Guide Submitted!',
                description: 'Your guide is awaiting approval.'
            });

            // Reset form
            setTitle('');
            setDescription('');
            setContent('');
            setHashtags([]);
            setImageFile(null);
            setImagePreview(null);
            setEditorKey(Date.now());
            setValidationErrors([]);

            navigate('/guides');
        } catch (error) {
            console.error('Submission error:', error);
            toast({
                variant: 'destructive',
                title: 'Submission Failed',
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <>
            <Helmet>
                <title>Create Guide - Dead Matter Wiki</title>
            </Helmet>

            <style>{`
        .ql-toolbar {
          background-color: #1f2937 !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          border-top-left-radius: 0.75rem !important;
          border-top-right-radius: 0.75rem !important;
        }
        .ql-container {
          background-color: #111827 !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          border-bottom-left-radius: 0.75rem !important;
          border-bottom-right-radius: 0.75rem !important;
          font-size: 1rem !important;
          color: #e5e7eb !important;
        }
        .ql-editor {
          min-height: 400px !important;
          max-height: 600px !important;
          overflow-y: auto !important;
          color: #e5e7eb !important;
        }
        .ql-stroke { stroke: #9ca3af !important; }
        .ql-fill { fill: #9ca3af !important; }
        .ql-picker { color: #9ca3af !important; }
        .ql-picker-options {
          background-color: #1f2937 !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        .ql-tooltip {
          background-color: #1f2937 !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
          color: #fff !important;
        }
        .ql-tooltip input[type=text] {
          background-color: #374151 !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
          color: #fff !important;
        }
      `}</style>

            <div className="max-w-4xl mx-auto px-4 pb-20">
                <div className="bg-gray-900/90 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
                    {/* Security Banner */}
                    {validationErrors.length > 0 && (
                        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-lg">
                            <div className="flex items-center gap-2 text-red-300 mb-2">
                                <AlertCircle className="w-5 h-5" />
                                <span className="font-semibold">Security Validation Failed</span>
                            </div>
                            <ul className="text-sm text-red-300 space-y-1">
                                {validationErrors.map((error, index) => (
                                    <li key={index}>• {error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="text-center mb-8">
                        <div className="relative inline-block mb-4">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur-sm opacity-75" />
                            <PlusCircle className="relative w-16 h-16 text-white z-10" />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Create a New Guide
                        </h1>
                        <p className="text-gray-400 text-lg">
                            Share your knowledge with the community.
                        </p>
                        <div className="mt-4 inline-flex items-center gap-2 text-sm text-gray-500 bg-gray-800/50 px-3 py-1.5 rounded-full">
                            <Shield className="w-4 h-4 text-green-400" />
                            <span>Basic file validation enabled</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <Label htmlFor="title" className="text-white text-lg font-semibold mb-3 block">
                                Guide Title
                            </Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="bg-gray-800/50 border-white/20 text-white placeholder-gray-400 h-12 text-lg focus:border-red-500 transition-colors"
                                placeholder="Enter an engaging title for your guide..."
                            />
                        </div>

                        <div>
                            <Label htmlFor="description" className="text-white text-lg font-semibold mb-3 block">
                                Short Description (Preview)
                            </Label>
                            <Input
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                className="bg-gray-800/50 border-white/20 text-white placeholder-gray-400 h-12 text-lg focus:border-red-500 transition-colors"
                                placeholder="Brief description that will appear in previews..."
                            />
                        </div>

                        <div className="flex justify-center">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleTranslateAll}
                                disabled={isTranslating || !title}
                                className="gap-2 border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                            >
                                {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                                Translate with Gemini AI (ES/PT)
                            </Button>
                        </div>

                        {/* Translation Fields (Optional/Preview) */}
                        <div className="space-y-6 pt-4 border-t border-white/5">
                            <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                                <Globe className="w-5 h-5" />
                                Translations
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Spanish Version */}
                                <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                    <h4 className="font-bold text-gray-400 uppercase text-xs tracking-widest">Spanish Version</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-xs text-gray-500 mb-1 block">Title (ES)</Label>
                                            <Input value={titleEs} onChange={(e) => setTitleEs(e.target.value)} className="bg-gray-800/50 border-white/10 text-sm h-10" />
                                        </div>
                                        <div>
                                            <Label className="text-xs text-gray-500 mb-1 block">Description (ES)</Label>
                                            <Input value={descriptionEs} onChange={(e) => setDescriptionEs(e.target.value)} className="bg-gray-800/50 border-white/10 text-sm h-10" />
                                        </div>
                                        <div>
                                            <Label className="text-xs text-gray-500 mb-1 block">Content (ES) - Raw Text</Label>
                                            <textarea
                                                value={contentEs}
                                                onChange={(e) => setContentEs(e.target.value)}
                                                className="w-full h-32 bg-gray-800/50 border border-white/10 rounded-md p-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Portuguese Version */}
                                <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                    <h4 className="font-bold text-gray-400 uppercase text-xs tracking-widest">Portuguese Version</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-xs text-gray-500 mb-1 block">Title (PT)</Label>
                                            <Input value={titlePt} onChange={(e) => setTitlePt(e.target.value)} className="bg-gray-800/50 border-white/10 text-sm h-10" />
                                        </div>
                                        <div>
                                            <Label className="text-xs text-gray-500 mb-1 block">Description (PT)</Label>
                                            <Input value={descriptionPt} onChange={(e) => setDescriptionPt(e.target.value)} className="bg-gray-800/50 border-white/10 text-sm h-10" />
                                        </div>
                                        <div>
                                            <Label className="text-xs text-gray-500 mb-1 block">Content (PT) - Raw Text</Label>
                                            <textarea
                                                value={contentPt}
                                                onChange={(e) => setContentPt(e.target.value)}
                                                className="w-full h-32 bg-gray-800/50 border border-white/10 rounded-md p-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hashtags Input */}
                        <div>
                            <Label htmlFor="hashtags" className="text-white text-lg font-semibold mb-3 block">
                                Hashtags (Max 5)
                            </Label>
                            <div className="space-y-3">
                                <div className="relative">
                                    <Hash className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="hashtags"
                                        value={currentTag}
                                        onChange={(e) => setCurrentTag(e.target.value)}
                                        onKeyDown={handleAddTag}
                                        className="bg-gray-800/50 border-white/20 text-white placeholder-gray-400 h-12 text-lg pl-10 focus:border-red-500 transition-colors"
                                        placeholder="Type a tag and press Enter..."
                                        disabled={hashtags.length >= 5}
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {hashtags.map((tag, index) => (
                                        <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-sm text-white font-medium">
                                            #{tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="ml-1 hover:text-red-400 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500">
                                    {hashtags.length}/5 tags used. Press Enter or comma to add a tag.
                                </p>
                            </div>
                        </div>

                        <div>
                            <Label className="text-white text-lg font-semibold mb-3 block">
                                Cover Image (Optional)
                            </Label>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg cursor-pointer hover:from-red-700 hover:to-orange-700 transition-all duration-300 group">
                                        <Upload className="w-5 h-5" />
                                        <span className="font-semibold">Select Image</span>
                                        <input
                                            type="file"
                                            accept={SECURITY_CONFIG.IMAGE.ALLOWED_TYPES.join(',')}
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                    {imageFile && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-green-400 font-semibold">
                                                ✓ {imageFile.name.substring(0, 30)}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                ({Math.round(imageFile.size / 1024)} KB)
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Security Info */}
                                <div className="p-3 bg-gray-800/30 rounded-lg">
                                    <p className="text-xs text-gray-400">
                                        <strong>Allowed formats:</strong> JPEG, PNG, WebP<br />
                                        <strong>Max size:</strong> {SECURITY_CONFIG.IMAGE.MAX_SIZE / 1024 / 1024}MB<br />
                                        <strong>Security:</strong> Basic file validation enabled
                                    </p>
                                </div>

                                {imagePreview && (
                                    <div className="mt-4">
                                        <div className="relative w-full max-w-md mx-auto border-2 border-white/20 rounded-xl overflow-hidden">
                                            <img
                                                src={imagePreview}
                                                alt="Cover preview"
                                                className="w-full h-48 object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label className="text-white text-lg font-semibold mb-3 block">
                                Guide Content
                            </Label>
                            <div className="mb-3 text-sm text-gray-400">
                                <p>Basic image validation enabled for uploads.</p>
                            </div>
                            {isEditorVisible && (
                                <ReactQuill
                                    key={editorKey}
                                    ref={quillRef}
                                    theme="snow"
                                    value={content}
                                    onChange={setContent}
                                    modules={modules}
                                    formats={formats}
                                    placeholder="Write your guide here... Use the toolbar to format text, add images, and more."
                                />
                            )}
                        </div>

                        <div>
                            <Button
                                type="submit"
                                className="w-full py-6 text-lg font-bold bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 transition-all duration-300 group relative overflow-hidden"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                        <span className="flex items-center gap-2">
                                            Submitting...
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span className="relative z-10 flex items-center gap-2">
                                            Submit for Approval
                                            <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CreateGuidePage;
