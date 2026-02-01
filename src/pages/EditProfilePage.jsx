import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/mySupabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, UserCog, Camera, Mail, User, Shield, ArrowLeft, Check, AlertCircle, ShieldCheck, X, Languages } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

// Configuración de seguridad - misma que en CreateGuidePage
const SECURITY_CONFIG = {
  AVATAR: {
    MAX_SIZE: 2 * 1024 * 1024, // 2MB para avatares (más restrictivo)
    MAX_DIMENSION: 2048, // px
    ALLOWED_TYPES: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
    COMPRESSION_QUALITY: 0.8,
    MIN_DIMENSION: 64, // Tamaño mínimo
    ASPECT_RATIO: {
      min: 0.8, // 4:5
      max: 1.2  // 5:4
    }
  },

  FILES: {
    MAX_FILENAME_LENGTH: 50,
    DISALLOWED_CHARS: /[<>:"/\\|?*]/g,
    DISALLOWED_EXTENSIONS: [
      '.php', '.php3', '.php4', '.php5', '.php7', '.phtml',
      '.asp', '.aspx', '.ashx', '.asmx',
      '.jsp', '.jspx',
      '.pl', '.py', '.rb', '.sh', '.exe', '.bat', '.cmd',
      '.js', '.html', '.htm', '.xhtml',
      '.svg',
      '.htaccess', '.env'
    ]
  }
};

// Utilidades de seguridad específicas para avatares
const AvatarSecurityUtils = {
  validateFileType(file) {
    const fileExtension = '.' + file.name.toLowerCase().split('.').pop();

    // Verificar extensión peligrosa
    if (SECURITY_CONFIG.FILES.DISALLOWED_EXTENSIONS.includes(fileExtension)) {
      return { valid: false, error: 'File type not allowed for avatars' };
    }

    // Verificar tipo MIME permitido
    if (!SECURITY_CONFIG.AVATAR.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid format. Allowed: JPEG, PNG, WebP'
      };
    }

    return { valid: true };
  },

  validateFileSize(file) {
    if (file.size > SECURITY_CONFIG.AVATAR.MAX_SIZE) {
      return {
        valid: false,
        error: `File too large. Maximum size: ${SECURITY_CONFIG.AVATAR.MAX_SIZE / 1024 / 1024}MB`
      };
    }
    return { valid: true };
  },

  sanitizeFilename(filename) {
    let sanitized = filename
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(SECURITY_CONFIG.FILES.DISALLOWED_CHARS, '_')
      .replace(/\s+/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, SECURITY_CONFIG.FILES.MAX_FILENAME_LENGTH);

    // Forzar extensión .jpg para consistencia
    const nameWithoutExt = sanitized.replace(/\.[^/.]+$/, '');
    return `${nameWithoutExt}.jpg`;
  },

  detectDisguisedFile(filename) {
    const lowerFilename = filename.toLowerCase();

    // Detectar doble extensión
    const doubleExtension = /\.(jpg|jpeg|png|webp)\.(php|exe|js|html|asp|aspx|jsp)$/i;
    if (doubleExtension.test(lowerFilename)) {
      return { malicious: true, type: 'double_extension' };
    }

    // Detectar null bytes
    if (filename.includes('\0') || filename.includes('%00')) {
      return { malicious: true, type: 'null_byte' };
    }

    // Detectar archivos muy largos (posible buffer overflow)
    if (filename.length > 255) {
      return { malicious: true, type: 'filename_length' };
    }

    return { malicious: false };
  },

  async validateImageContent(file) {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);

        // Validar dimensiones máximas
        if (img.width > SECURITY_CONFIG.AVATAR.MAX_DIMENSION ||
          img.height > SECURITY_CONFIG.AVATAR.MAX_DIMENSION) {
          resolve({ valid: false, error: 'Image dimensions too large' });
          return;
        }

        // Validar dimensiones mínimas
        if (img.width < SECURITY_CONFIG.AVATAR.MIN_DIMENSION ||
          img.height < SECURITY_CONFIG.AVATAR.MIN_DIMENSION) {
          resolve({ valid: false, error: 'Image too small. Minimum 64x64px' });
          return;
        }

        // Validar ratio de aspecto (cercano a cuadrado)
        const aspectRatio = img.width / img.height;
        if (aspectRatio < SECURITY_CONFIG.AVATAR.ASPECT_RATIO.min ||
          aspectRatio > SECURITY_CONFIG.AVATAR.ASPECT_RATIO.max) {
          resolve({ valid: false, error: 'Image should be close to square (between 4:5 and 5:4)' });
          return;
        }

        // Validar que la imagen no esté corrupta usando canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;

        try {
          ctx.drawImage(img, 0, 0);

          // Verificar que se dibujó correctamente
          const imageData = ctx.getImageData(0, 0, 1, 1).data;
          if (imageData[3] === 0 && file.type !== 'image/png') {
            // Imagen completamente transparenta (posible archivo corrupto)
            resolve({ valid: false, error: 'Invalid image data' });
            return;
          }

          // Calcular luminosidad promedio (detectar imágenes completamente negras/blancas)
          const sampleData = ctx.getImageData(0, 0, Math.min(10, img.width), Math.min(10, img.height)).data;
          let totalLuminance = 0;
          for (let i = 0; i < sampleData.length; i += 4) {
            const luminance = 0.299 * sampleData[i] + 0.587 * sampleData[i + 1] + 0.114 * sampleData[i + 2];
            totalLuminance += luminance;
          }
          const avgLuminance = totalLuminance / (sampleData.length / 4);

          if (avgLuminance < 5 || avgLuminance > 250) {
            resolve({ valid: false, error: 'Image appears to be blank or corrupted' });
            return;
          }

        } catch (error) {
          resolve({ valid: false, error: 'Failed to validate image content' });
          return;
        }

        resolve({
          valid: true,
          width: img.width,
          height: img.height,
          aspectRatio: aspectRatio.toFixed(2)
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ valid: false, error: 'Invalid image file or corrupted data' });
      };

      img.src = url;
    });
  },

  async compressAndCropAvatar(file, targetSize = 256) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetSize;
        canvas.height = targetSize;

        const ctx = canvas.getContext('2d');

        // Calcular recorte centrado
        const sourceSize = Math.min(img.width, img.height);
        const sourceX = (img.width - sourceSize) / 2;
        const sourceY = (img.height - sourceSize) / 2;

        // Limpiar canvas
        ctx.fillStyle = '#374151'; // Color de fondo por defecto
        ctx.fillRect(0, 0, targetSize, targetSize);

        // Dibujar imagen recortada y redimensionada
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceSize, sourceSize, // source
          0, 0, targetSize, targetSize // destination
        );

        // Añadir borde sutil
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, targetSize, targetSize);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Compression failed'));
              return;
            }
            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            }));
          },
          'image/jpeg',
          SECURITY_CONFIG.AVATAR.COMPRESSION_QUALITY
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      reader.readAsDataURL(file);
    });
  },

  async validateAndProcessAvatar(file) {
    const errors = [];
    const warnings = [];

    // 1. Detección de archivos disfrazados
    const disguiseCheck = this.detectDisguisedFile(file.name);
    if (disguiseCheck.malicious) {
      errors.push(`Security alert: Suspicious file detected`);
      return { success: false, errors, warnings };
    }

    // 2. Validar tipo de archivo
    const typeCheck = this.validateFileType(file);
    if (!typeCheck.valid) {
      errors.push(typeCheck.error);
    }

    // 3. Validar tamaño
    const sizeCheck = this.validateFileSize(file);
    if (!sizeCheck.valid) {
      errors.push(sizeCheck.error);
    }

    // 4. Validar contenido de imagen
    const contentCheck = await this.validateImageContent(file);
    if (!contentCheck.valid) {
      errors.push(contentCheck.error);
    } else {
      // Advertencias sobre dimensiones no ideales
      if (contentCheck.width < 200 || contentCheck.height < 200) {
        warnings.push('Image resolution is low. For best results, use at least 200x200px.');
      }
      if (Math.abs(contentCheck.aspectRatio - 1) > 0.1) {
        warnings.push('Image will be cropped to square.');
      }
    }

    if (errors.length > 0) {
      return { success: false, errors, warnings };
    }

    // 5. Procesar imagen (comprimir y recortar)
    let processedFile = file;
    try {
      processedFile = await this.compressAndCropAvatar(file);
    } catch (error) {
      console.warn('Avatar processing failed:', error);
      // Continuar con archivo original si el procesamiento falla
      warnings.push('Could not optimize image. Using original.');
    }

    // 6. Sanitizar nombre
    const sanitizedName = this.sanitizeFilename(file.name);

    return {
      success: true,
      file: processedFile,
      sanitizedName,
      dimensions: contentCheck,
      warnings
    };
  }
};

const EditProfilePage = () => {
  const { user, profile, loading: authLoading, fetchProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [language, setLanguage] = useState('en');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [validationWarnings, setValidationWarnings] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setLanguage(profile.language || 'en');
      setAvatarPreview(profile.avatar_url || '');
    }
  }, [profile]);

  const handleAvatarChange = async (e) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    setValidationErrors([]);
    setValidationWarnings([]);
    setUploadProgress(0);

    try {
      // Mostrar preview inmediato (pero no procesado)
      const tempPreview = URL.createObjectURL(file);
      setAvatarPreview(tempPreview);

      // Validar y procesar avatar
      setUploadProgress(20);
      const validation = await AvatarSecurityUtils.validateAndProcessAvatar(file);
      setUploadProgress(60);

      if (!validation.success) {
        setValidationErrors(validation.errors);
        // Revertir preview si la validación falla
        URL.revokeObjectURL(tempPreview);
        setAvatarPreview(profile?.avatar_url || '');

        toast({
          variant: 'destructive',
          title: 'Invalid Avatar',
          description: validation.errors.join('. ')
        });
        return;
      }

      // Mostrar advertencias si las hay
      if (validation.warnings.length > 0) {
        setValidationWarnings(validation.warnings);
        toast({
          variant: 'default',
          title: 'Image Note',
          description: validation.warnings.join('. ')
        });
      }

      // Actualizar con archivo procesado
      setAvatarFile(validation.file);
      setUploadProgress(100);

      // Crear nuevo preview con imagen procesada
      const reader = new FileReader();
      reader.onload = (e) => {
        URL.revokeObjectURL(tempPreview);
        setAvatarPreview(e.target.result);
      };
      reader.onerror = () => {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load image preview' });
      };
      reader.readAsDataURL(validation.file);

      toast({
        title: 'Avatar Validated',
        description: `${validation.sanitizedName} ready for upload`,
        duration: 3000
      });

    } catch (error) {
      console.error('Avatar processing error:', error);
      toast({
        variant: 'destructive',
        title: 'Processing Error',
        description: 'Failed to process image. Please try another file.'
      });
      setValidationErrors(['Unexpected error during validation']);
    } finally {
      setTimeout(() => setUploadProgress(0), 500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setValidationErrors([]);

    try {
      let avatar_url = profile.avatar_url;
      let newAvatarPath = null;

      if (avatarFile) {
        // Validación final antes de subir
        const validation = await AvatarSecurityUtils.validateAndProcessAvatar(avatarFile);
        if (!validation.success) {
          setValidationErrors(validation.errors);
          throw new Error('Avatar validation failed: ' + validation.errors.join(', '));
        }

        // Generar nombre de archivo único y sanitizado
        const fileExt = 'jpg'; // Siempre JPG después del procesamiento
        const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        const fileName = `avatar_${user.id}_${uniqueId}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // Crear metadata de seguridad
        const metadata = {
          user_id: user.id,
          validated: true,
          original_name: avatarFile.name,
          sanitized_name: validation.sanitizedName,
          processed_at: new Date().toISOString(),
          dimensions: validation.dimensions
        };

        // Subir con headers de seguridad
        const { error: uploadError } = await supabase.storage
          .from('avatars') // Bucket separado específico para avatares
          .upload(filePath, validation.file, {
            cacheControl: 'public, max-age=31536000, immutable',
            upsert: false, // No permitir sobrescribir
            contentType: 'image/jpeg',
            duplex: 'half'
          });

        if (uploadError) {
          if (uploadError.message.includes('virus') || uploadError.message.includes('malware')) {
            throw new Error('File rejected by security scanner. Please upload a different image.');
          }
          if (uploadError.message.includes('already exists')) {
            throw new Error('Avatar with this name already exists. Please try again.');
          }
          throw uploadError;
        }

        // Registrar en auditoría
        await supabase
          .from('file_uploads_audit')
          .insert({
            user_id: user.id,
            filename: validation.sanitizedName,
            original_filename: avatarFile.name,
            file_path: filePath,
            file_size: validation.file.size,
            upload_type: 'avatar',
            validation_passed: true,
            metadata: metadata
          });

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatar_url = urlData.publicUrl;
        newAvatarPath = filePath;

        // Eliminar avatar antiguo si existe
        if (profile.avatar_path && profile.avatar_path !== newAvatarPath) {
          try {
            const oldPath = profile.avatar_path.replace('avatars/', '');
            await supabase.storage
              .from('avatars')
              .remove([oldPath]);
          } catch (cleanupError) {
            console.warn('Failed to delete old avatar:', cleanupError);
            // No fallar por error de limpieza
          }
        }
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username,
          language,
          avatar_url,
          avatar_path: newAvatarPath || profile.avatar_path,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
        duration: 5000
      });

      // Forzar recarga de avatar cache
      if (avatar_url !== profile.avatar_url) {
        const cacheBuster = `?t=${Date.now()}`;
        await fetchProfile(user.id, cacheBuster);
      } else {
        await fetchProfile(user.id);
      }

      navigate('/');
    } catch (error) {
      console.error('Update error:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message,
        duration: 7000
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center min-h-[60vh]"
      >
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 relative overflow-hidden">
      {/* Technical Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px] z-0" />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-black via-transparent to-black z-0 opacity-50" />

      <Helmet>
        <title>Edit Profile - Dead Matter Wiki</title>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            className="text-gray-500 hover:text-white hover:bg-white/5 -ml-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar / User Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-4"
          >
            <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden sticky top-24">
              <div className="h-24 bg-white/5 border-b border-white/5 relative">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]" />
              </div>

              <div className="px-6 pb-6 -mt-12 text-center">
                <div className="relative inline-block group">
                  <div className="h-24 w-24 rounded-full border-4 border-[#0a0a0c] overflow-hidden bg-black relative">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={avatarPreview} alt={username} className="object-cover" />
                      <AvatarFallback className="bg-white/10 text-xl font-bold text-white/50">
                        {username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    <Label
                      htmlFor="avatar-upload"
                      className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    >
                      <Camera className="h-6 w-6 text-white" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept={SECURITY_CONFIG.AVATAR.ALLOWED_TYPES.join(',')}
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </Label>

                    {/* Progress Indicator */}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                        <span className="text-[10px] font-bold text-emerald-500">{uploadProgress}%</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 p-1.5 bg-[#0a0a0c] rounded-full border border-white/10">
                    <UserCog className="h-3 w-3 text-gray-400" />
                  </div>
                </div>

                <h2 className="text-xl font-bold text-white mt-3">{profile?.username || 'Anonymous'}</h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/5 text-gray-500 border border-white/5">
                    Operative
                  </span>
                </div>

                <div className="mt-6 pt-6 border-t border-white/5 flex flex-col gap-2 text-left">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Security Level</span>
                    <span className="text-emerald-500 font-mono">CLEARED</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Member Since</span>
                    <span className="text-gray-300 font-mono">{profile?.created_at ? new Date(profile.created_at).getFullYear() : '2024'}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Form Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-8"
          >
            <div className="bg-[#0a0a0c] border border-white/5 rounded-2xl p-8">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Account Settings</h1>
                <p className="text-sm text-gray-500">Manage your personal information and security preferences.</p>
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="mb-6 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                  <div className="flex items-center gap-2 text-red-400 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-bold uppercase">Validation Error</span>
                  </div>
                  <ul className="text-xs text-red-300/80 space-y-1 list-disc pl-4">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-xs font-bold text-gray-400 uppercase tracking-wider">DisplayName</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="pl-10 bg-white/[0.02] border-white/10 text-white focus:bg-white/5 focus:border-red-500/50 transition-all h-11"
                      placeholder="Enter your username"
                    />
                  </div>
                  <p className="text-[10px] text-gray-600">Visible to other operatives in the network.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Interface Language</Label>
                  <div className="relative">
                    <Languages className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                    <select
                      id="language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full pl-10 pr-4 bg-white/[0.02] border border-white/10 text-white rounded-md focus:bg-white/5 focus:ring-1 focus:ring-red-500/50 transition-all h-11 appearance-none cursor-pointer"
                    >
                      <option value="en" className="bg-[#1a1a1e] text-white">English (Default)</option>
                      <option value="es" className="bg-[#1a1a1e] text-white">Español</option>
                      <option value="pt" className="bg-[#1a1a1e] text-white">Português</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                      <ArrowLeft className="h-4 w-4 rotate-[-90deg]" />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-600">Choose your preferred language for the network interface.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="pl-10 bg-black/40 border-white/5 text-gray-500 cursor-not-allowed h-11"
                    />
                  </div>
                  <p className="text-[10px] text-gray-600">Managed by Supabase Auth. Contact admin to change.</p>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-end gap-4">
                  <Button type="button" variant="ghost" onClick={() => navigate(-1)} className="text-gray-400 hover:text-white">Cancel</Button>
                  <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-500 text-white min-w-[140px]">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Hidden footer buffer */}
      <div className="h-20" />
    </div>
  );

};

export default React.memo(EditProfilePage);
