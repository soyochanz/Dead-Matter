import React from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Box, Tag, Info, Sliders, Image as ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

/**
 * Main container for admin forms with premium styling.
 */
export const FormContainer = ({ children, title, onSave, onCancel, isSaving }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-[#050505] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] flex flex-col my-8"
    >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none opacity-5 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        {/* Header */}
        <div className="p-8 md:p-10 border-b border-white/5 relative z-10 flex justify-between items-center">
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600">Administrative Portal</span>
                    <div className="h-px w-12 bg-red-600/30" />
                </div>
                <h3 className="text-4xl font-black text-white uppercase tracking-tighter">{title}</h3>
            </div>
            <div className="flex gap-4">
                <Button
                    variant="outline"
                    onClick={onCancel}
                    className="rounded-xl border-white/5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all h-12 px-6 font-bold uppercase tracking-widest text-[10px]"
                >
                    <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
                <Button
                    onClick={onSave}
                    disabled={isSaving}
                    className="rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.2)] hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all h-12 px-8 font-black uppercase tracking-widest text-[10px]"
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>

        {/* Content */}
        <div className="p-8 md:p-10 space-y-12 relative z-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {children}
        </div>

        {/* Bottom Accents */}
        <div className="h-2 bg-[#0a0a0c] border-t border-white/5 flex">
            <div className="w-1/3 h-full bg-red-600" />
            <div className="w-2/3 h-full flex justify-between px-6">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="w-px h-full bg-white/[0.03]" />
                ))}
            </div>
        </div>
    </motion.div>
);

/**
 * A section within a form with a header and icon.
 */
export const FormSection = ({ title, icon: Icon, children, columns = 2 }) => (
    <div className="space-y-6">
        <div className="flex items-center gap-4">
            {Icon && (
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-red-500">
                    <Icon className="w-5 h-5" />
                </div>
            )}
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">{title}</h4>
            <div className="flex-grow h-px bg-white/5" />
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-6`}>
            {children}
        </div>
    </div>
);

/**
 * Styled input field with label.
 */
export const FormInput = ({ label, type = 'text', placeholder, value, onChange, className = "" }) => (
    <div className={`space-y-2 ${className}`}>
        {label && <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">{label}</label>}
        <div className="relative group">
            <Input
                type={type}
                placeholder={placeholder}
                value={value || ''}
                onChange={onChange}
                className="bg-white/5 border-white/5 focus:border-red-500/50 focus:ring-red-500/20 rounded-xl h-12 font-medium text-white placeholder:text-gray-600 transition-all group-hover:bg-white/10"
            />
            <div className="absolute inset-0 rounded-xl bg-red-500/0 group-hover:bg-red-500/[0.02] pointer-events-none transition-colors" />
        </div>
    </div>
);

/**
 * Styled select field.
 */
export const FormSelect = ({ label, value, onChange, children, className = "" }) => (
    <div className={`space-y-2 ${className}`}>
        {label && <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">{label}</label>}
        <select
            value={value || ''}
            onChange={onChange}
            className="w-full bg-white/5 border border-white/5 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 rounded-xl h-12 px-4 font-medium text-white transition-all hover:bg-white/10 cursor-pointer appearance-none"
        >
            {children}
        </select>
    </div>
);

/**
 * Styled textarea field.
 */
export const FormTextarea = ({ label, placeholder, value, onChange, className = "" }) => (
    <div className={`space-y-2 ${className}`}>
        {label && <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">{label}</label>}
        <textarea
            placeholder={placeholder}
            value={value || ''}
            onChange={onChange}
            className="w-full bg-white/5 border border-white/5 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 rounded-xl min-h-[120px] p-4 font-medium text-white placeholder:text-gray-600 transition-all hover:bg-white/10 custom-scrollbar"
        />
    </div>
);

/**
 * Component for image/file uploads with preview.
 */
export const FormFileUpload = ({ label, accept, onChange, previewUrl, fileName, icon: Icon = Upload }) => (
    <div className="space-y-2">
        {label && <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">{label}</label>}
        <div className="flex items-center gap-4">
            <label className="flex-grow group cursor-pointer">
                <div className="h-12 border border-dashed border-white/10 rounded-xl flex items-center justify-center gap-3 bg-white/5 group-hover:bg-white/10 group-hover:border-red-500/30 transition-all">
                    <Icon className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">
                        {fileName ? fileName : 'Choose File'}
                    </span>
                    <input type="file" accept={accept} onChange={onChange} className="hidden" />
                </div>
            </label>

            {previewUrl && (
                <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center p-1 overflow-hidden group/preview relative">
                    <img src={previewUrl} alt="preview" className="max-w-full max-h-full object-contain" />
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-white" />
                    </div>
                </div>
            )}
        </div>
    </div>
);
