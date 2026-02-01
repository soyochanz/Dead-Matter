import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/mySupabaseClient';
import { Loader2, Check, X, Trash2, ShieldAlert, ArrowLeft, Save, FileText, User, Calendar, MessageSquare, Languages, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FormContainer, FormSection, FormInput, FormTextarea } from './AdminUIComponents';

const AdminGuideForm = ({ guide, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: guide.title || '',
    description: guide.description || '',
    content_html: guide.content_html || '',
    title_es: guide.title_es || '',
    title_pt: guide.title_pt || '',
    description_es: guide.description_es || '',
    description_pt: guide.description_pt || '',
    content_es: guide.content_es || '',
    content_pt: guide.content_pt || '',
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);

    const { error } = await supabase.from('guides').update({
      ...formData,
      updated_at: new Date()
    }).eq('id', guide.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Intelligence Updated", description: "Guide database has been synchronized." });
      onSave();
    }
    setSaving(false);
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
      <FormContainer
        title={`Modifying Intelligence: ${guide.title}`}
        onSave={handleSubmit}
        onCancel={onCancel}
        isSaving={saving}
      >
        <FormSection title="Primary Content (EN)" icon={FileText}>
          <FormInput
            label="Operation Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <FormTextarea
            label="Executive Summary"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Directive Details</label>
            <div className="bg-[#0f0f12] rounded-xl border border-white/10 overflow-hidden quill-dark">
              <ReactQuill theme="snow" value={formData.content_html} onChange={(val) => setFormData({ ...formData, content_html: val })} modules={modules} />
            </div>
          </div>
        </FormSection>

        <FormSection title="Manual Translations" icon={Languages} columns={1}>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Spanish */}
            <div className="space-y-4 p-5 bg-white/[0.02] rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase text-red-500 tracking-[0.2em]">🇪🇸 Spanish Protocol</span>
              </div>
              <FormInput
                label="Título (ES)"
                value={formData.title_es}
                onChange={(e) => setFormData({ ...formData, title_es: e.target.value })}
                className="bg-black/20"
              />
              <FormTextarea
                label="Descripción (ES)"
                value={formData.description_es}
                onChange={(e) => setFormData({ ...formData, description_es: e.target.value })}
                className="bg-black/20"
              />
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">Contenido (ES)</label>
                <div className="bg-[#0f0f12] rounded-xl border border-white/10 overflow-hidden quill-dark h-[200px]">
                  <ReactQuill theme="snow" value={formData.content_es} onChange={(val) => setFormData({ ...formData, content_es: val })} modules={modules} />
                </div>
              </div>
            </div>

            {/* Portuguese */}
            <div className="space-y-4 p-5 bg-white/[0.02] rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase text-red-500 tracking-[0.2em]">🇵🇹 Portuguese Protocol</span>
              </div>
              <FormInput
                label="Título (PT)"
                value={formData.title_pt}
                onChange={(e) => setFormData({ ...formData, title_pt: e.target.value })}
                className="bg-black/20"
              />
              <FormTextarea
                label="Descrição (PT)"
                value={formData.description_pt}
                onChange={(e) => setFormData({ ...formData, description_pt: e.target.value })}
                className="bg-black/20"
              />
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1">Conteúdo (PT)</label>
                <div className="bg-[#0f0f12] rounded-xl border border-white/10 overflow-hidden quill-dark h-[200px]">
                  <ReactQuill theme="snow" value={formData.content_pt} onChange={(val) => setFormData({ ...formData, content_pt: val })} modules={modules} />
                </div>
              </div>
            </div>
          </div>
        </FormSection>
      </FormContainer>

      <style dangerouslySetInnerHTML={{
        __html: `
            .quill-dark .ql-toolbar {
                border-color: rgba(255, 255, 255, 0.05) !important;
                background: rgba(255, 255, 255, 0.02) !important;
            }
            .quill-dark .ql-container {
                border-color: rgba(255, 255, 255, 0.05) !important;
                min-height: 200px;
            }
            .quill-dark .ql-editor {
                color: #e2e8f0;
                font-family: 'Inter', sans-serif;
            }
            .quill-dark .ql-snow .ql-stroke {
                stroke: #94a3b8;
            }
            .quill-dark .ql-snow .ql-fill {
                fill: #94a3b8;
            }
            .quill-dark .ql-snow .ql-picker {
                color: #94a3b8;
            }
        `}} />
    </div>
  );
};

const GuidesManager = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchGuides = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('guides')
      .select(`
        *,
        author:profiles(username),
        reports:guide_reports(count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch records.' });
    } else {
      setGuides(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchGuides();
  }, [fetchGuides]);

  const handleUpdateStatus = async (guideId, status) => {
    const { error } = await supabase.from('guides').update({ status }).eq('id', guideId);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: `Failed to ${status} record.` });
    } else {
      toast({ title: 'System Updated', description: `Protocol status set to ${status}.` });
      fetchGuides();
    }
  };

  const handleDelete = async () => {
    if (!selectedGuide) return;
    const { error } = await supabase.from('guides').delete().eq('id', selectedGuide.id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to purge record.' });
    } else {
      toast({ title: 'Purged', description: 'Record has been removed from network.' });
      fetchGuides();
      setIsDeleteDialogOpen(false);
      setSelectedGuide(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center py-20"><Loader2 className="w-12 h-12 animate-spin text-red-500" /></div>;
  }

  if (selectedGuide && !isDeleteDialogOpen) {
    return (
      <AdminGuideForm
        guide={selectedGuide}
        onSave={() => { setSelectedGuide(null); fetchGuides(); }}
        onCancel={() => setSelectedGuide(null)}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center text-white">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-3">
            <FileText className="text-red-600" />
            Network Intelligence
          </h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Moderate and calibrate field directives</p>
        </div>
      </div>

      <div className="bg-[#0a0a0c] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[800px]">
            <thead className="bg-white/[0.02] border-b border-white/5 text-gray-500 uppercase tracking-widest font-black">
              <tr>
                <th className="p-6">Operation / Author</th>
                <th className="p-6 text-center">Status</th>
                <th className="p-6 text-center">Alerts</th>
                <th className="p-6">Timestamp</th>
                <th className="p-6 text-right">Interaction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {guides.map((guide) => (
                <tr key={guide.id} className="group hover:bg-white/[0.01] transition-all duration-300">
                  <td className="p-6">
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-white group-hover:text-red-500 transition-colors uppercase tracking-wide">{guide.title}</div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500">
                        <User className="w-3 h-3" /> {guide.author?.username || 'Redacted'}
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`inline-flex px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${guide.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      guide.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                      {guide.status}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {guide.reports[0]?.count > 0 ? (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-lg animate-pulse">
                          <ShieldAlert className="text-red-500 h-3 w-3" />
                          <span className="text-red-400 font-black">{guide.reports[0]?.count}</span>
                        </div>
                      ) : (
                        <span className="text-gray-700">-</span>
                      )}
                    </div>
                  </td>
                  <td className="p-6 text-[10px] text-gray-500 font-mono">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(guide.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end items-center gap-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-9 px-4 rounded-xl font-bold uppercase tracking-widest text-[9px] text-gray-400 hover:text-white bg-white/5 hover:bg-white/10"
                        onClick={() => setSelectedGuide(guide)}
                      >
                        <Edit className="w-3.5 h-3.5 mr-2" />
                        Modify
                      </Button>
                      {guide.status === 'pending' && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/10"
                          onClick={() => handleUpdateStatus(guide.id, 'approved')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/10"
                        onClick={() => { setSelectedGuide(guide); setIsDeleteDialogOpen(true); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[#0a0a0c] border-white/10 text-white rounded-3xl shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.1),transparent)] pointer-events-none" />
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
              <ShieldAlert className="text-red-500" />
              Purge Record?
            </DialogTitle>
            <DialogDescription className="text-gray-500 uppercase text-[10px] font-bold tracking-widest leading-loose mt-2">
              This operation is irreversible. All directive data for <span className="text-white">"{selectedGuide?.title}"</span> will be permanently expunged from the network.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-6 relative z-10">
            <DialogClose asChild>
              <Button variant="ghost" className="rounded-xl font-bold uppercase tracking-widest text-[10px]">Abort Operation</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} className="bg-red-600 hover:bg-red-700 rounded-xl font-black uppercase tracking-[0.1em] text-[10px] h-11 px-8">Confirm Purge</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GuidesManager;
