import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/mySupabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, UserCog, Camera, Mail, User, Shield, ArrowLeft, Check, AlertCircle, ShieldCheck, X } from 'lucide-react';
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
    <>
      <Helmet>
        <title>Edit Profile - Dead Matter Wiki</title>
      </Helmet>
      
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-8"
        >
          <Button
            variant="ghost"
            className="absolute left-0 top-0 text-gray-400 hover:text-white group"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </Button>
          <div className="text-center pt-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Edit Profile
            </h1>
            <p className="text-gray-400 text-lg">Update your account information</p>
          </div>
        </motion.div>

        {/* Mostrar errores de validación */}
        {validationErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-lg"
          >
            <div className="flex items-center gap-2 text-red-300 mb-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">Security Validation Failed</span>
            </div>
            <ul className="text-sm text-red-300 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Mostrar advertencias */}
        {validationWarnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg"
          >
            <div className="flex items-center gap-2 text-yellow-300 mb-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">Image Notes</span>
            </div>
            <ul className="text-sm text-yellow-300 space-y-1">
              {validationWarnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 via-gray-900/50 to-orange-600/10 rounded-3xl" />
          
          <div className="relative bg-gray-900/90 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 border-b border-white/10 p-8">
              <div className="flex flex-col items-center">
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  onHoverStart={() => setIsHovering(true)}
                  onHoverEnd={() => setIsHovering(false)}
                >
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-white/20 shadow-2xl">
                      <AvatarImage src={avatarPreview} alt={username} />
                      <AvatarFallback className="bg-gradient-to-br from-red-600 to-orange-600 text-white text-4xl font-bold">
                        {username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Indicador de progreso */}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                        <div className="relative w-20 h-20">
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="rgba(255,255,255,0.1)"
                              strokeWidth="8"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="#10B981"
                              strokeWidth="8"
                              strokeLinecap="round"
                              strokeDasharray={`${uploadProgress * 2.83} 283`}
                              transform="rotate(-90 50 50)"
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">
                            {uploadProgress}%
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <AnimatePresence>
                      {isHovering && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full"
                        >
                          <Camera className="h-8 w-8 text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <Label
                      htmlFor="avatar-upload"
                      className="absolute -bottom-2 -right-2 bg-gradient-to-r from-red-600 to-orange-600 p-2 rounded-full cursor-pointer hover:shadow-lg hover:shadow-red-500/30 transition-all"
                    >
                      <Camera className="h-5 w-5 text-white" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept={SECURITY_CONFIG.AVATAR.ALLOWED_TYPES.join(',')}
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </Label>
                  </div>
                  
                  {/* Información de seguridad */}
                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-full">
                      <Shield className="h-3 w-3 text-green-400" />
                      <span className="text-xs text-gray-400">Secure upload enabled</span>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 text-center"
                >
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {profile?.username || 'Anonymous'}
                  </h2>
                  <p className="text-gray-400 flex items-center justify-center gap-2">
                    <Shield className="h-4 w-4 text-red-400" />
                    Member since {profile?.created_at ? new Date(profile.created_at).getFullYear() : '2024'}
                  </p>
                </motion.div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
          

              {/* Campo de Usuario */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-red-600/20 to-orange-600/20">
                    <User className="h-5 w-5 text-red-400" />
                  </div>
                  <Label htmlFor="username" className="text-white text-lg font-semibold">
                    Username
                  </Label>
                </div>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-gray-800/50 border-white/10 text-white placeholder-gray-500 h-12 text-lg rounded-xl hover:border-white/20 focus:border-red-500 transition-colors"
                  placeholder="Enter your username"
                />
                <p className="text-sm text-gray-500">
                  This will be displayed to other users
                </p>
              </motion.div>

              {/* Campo de Email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600/20 to-cyan-600/20">
                    <Mail className="h-5 w-5 text-blue-400" />
                  </div>
                  <Label htmlFor="email" className="text-white text-lg font-semibold">
                    Email Address
                  </Label>
                </div>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-800/50 border-white/10 text-gray-400 h-12 text-lg rounded-xl cursor-not-allowed"
                />
                <p className="text-sm text-gray-500">
                  Contact support to change your email
                </p>
              </motion.div>

              {/* Campo de Avatar File */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20">
                    <Camera className="h-5 w-5 text-purple-400" />
                  </div>
                  <Label htmlFor="avatar" className="text-white text-lg font-semibold">
                    Profile Picture
                  </Label>
                </div>
                <div className="space-y-3">
                  <Input
                    id="avatar"
                    type="file"
                    accept={SECURITY_CONFIG.AVATAR.ALLOWED_TYPES.join(',')}
                    onChange={handleAvatarChange}
                    className="bg-gray-800/50 border-white/10 text-white file:bg-gradient-to-r file:from-red-600 file:to-orange-600 file:border-0 file:rounded-lg file:px-4 file:py-2 file:text-white file:font-medium file:cursor-pointer hover:file:bg-gradient-to-r hover:file:from-red-700 hover:file:to-orange-700 transition-colors rounded-xl"
                  />
                  {avatarFile && (
                    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {AvatarSecurityUtils.sanitizeFilename(avatarFile.name)}
                          </p>
                          <p className="text-xs text-gray-400">
                            Ready for upload • {Math.round(avatarFile.size / 1024)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setAvatarFile(null);
                          setAvatarPreview(profile?.avatar_url || '');
                          setValidationErrors([]);
                          setValidationWarnings([]);
                        }}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Recommended: Square image, {SECURITY_CONFIG.AVATAR.MIN_DIMENSION}x{SECURITY_CONFIG.AVATAR.MIN_DIMENSION}px or larger, max {SECURITY_CONFIG.AVATAR.MAX_SIZE / 1024 / 1024}MB
                </p>
              </motion.div>

              {/* Botones de acción */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/10"
              >
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 text-lg rounded-xl border-white/10 hover:border-white/30 hover:bg-white/5"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 text-lg rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg hover:shadow-red-500/30 transition-all relative overflow-hidden"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      <span className="flex items-center gap-2">
                        Securing & Saving...
                        <Shield className="w-4 h-4" />
                      </span>
                    </>
                  ) : (
                    <>
                      <Check className="mr-3 h-5 w-5" />
                      Save Changes
                      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Pie de página con info de seguridad */}
            <div className="px-8 py-6 bg-gray-900/50 border-t border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Shield className="h-4 w-4 text-green-400" />
                  <div>
                    <p className="font-medium">Security Status</p>
                    <p className="text-xs">All uploads validated & scanned</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  <p>
                    Last updated: {profile?.updated_at ? 
                      new Date(profile.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 
                      'Never'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Información adicional de seguridad */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-gradient-to-br from-red-600/5 to-transparent border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-red-600/20">
                <Shield className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="font-semibold text-white">Multi-Layer Security</h3>
            </div>
            <p className="text-sm text-gray-400">
              Files are validated for type, size, content, and scanned for malware before upload.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-600/5 to-transparent border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-600/20">
                <User className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white">Automatic Optimization</h3>
            </div>
            <p className="text-sm text-gray-400">
              Avatars are automatically cropped to square and compressed for optimal performance.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-green-600/5 to-transparent border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-green-600/20">
                <Camera className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="font-semibold text-white">Real-time Validation</h3>
            </div>
            <p className="text-sm text-gray-400">
              Files are checked immediately upon selection. No waiting for upload to fail.
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default React.memo(EditProfilePage);