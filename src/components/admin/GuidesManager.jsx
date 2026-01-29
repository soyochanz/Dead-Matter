import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/mySupabaseClient';
import { Loader2, Check, X, Trash2, ShieldAlert } from 'lucide-react';
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
      console.error('Error fetching guides:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch guides.' });
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
      toast({ variant: 'destructive', title: 'Error', description: `Failed to ${status} guide.` });
    } else {
      toast({ title: 'Success', description: `Guide has been ${status}.` });
      fetchGuides();
    }
  };

  const handleDelete = async () => {
    if (!selectedGuide) return;
    const { error } = await supabase.from('guides').delete().eq('id', selectedGuide.id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete guide.' });
    } else {
      toast({ title: 'Success', description: 'Guide has been deleted.' });
      fetchGuides();
      setIsDeleteDialogOpen(false);
      setSelectedGuide(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div>;
  }

  // Edit / Create Form Overlay (Simple version for admin)
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
    <div className="text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Guides</h2>
        {/* We can add a "New Guide" button here if needed, but usually guides are community-driven */}
      </div>
      <div className="bg-gray-800/50 border border-white/10 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/5 text-gray-400">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Author</th>
              <th className="p-4">Status</th>
              <th className="p-4">Reports</th>
              <th className="p-4">Created At</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {guides.map((guide) => (
              <tr key={guide.id} className="border-b border-white/10 hover:bg-white/[0.02] transition-colors">
                <td className="p-4 font-medium">{guide.title}</td>
                <td className="p-4">{guide.author?.username || 'Unknown'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${guide.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    guide.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                    {guide.status}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center">
                    {guide.reports[0]?.count > 0 ? (
                      <ShieldAlert className="text-red-500 mr-1.5 h-4 w-4" />
                    ) : null}
                    {guide.reports[0]?.count || 0}
                  </div>
                </td>
                <td className="p-4 text-gray-500">{new Date(guide.created_at).toLocaleDateString()}</td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="hover:bg-blue-500/10 text-blue-400"
                      onClick={() => setSelectedGuide(guide)}
                    >
                      Edit
                    </Button>
                    {guide.status === 'pending' && (
                      <Button size="sm" variant="ghost" className="hover:bg-green-500/10 text-green-500" onClick={() => handleUpdateStatus(guide.id, 'approved')}>
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="hover:bg-red-500/10 text-red-500" onClick={() => { setSelectedGuide(guide); setIsDeleteDialogOpen(true); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-gray-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete the guide "{selectedGuide?.title}".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild><Button variant="outline" className="border-white/10 text-white">Cancel</Button></DialogClose>
            <Button variant="destructive" onClick={handleDelete}>Delete Permanently</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Sub-component for editing guides with translation support
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, Save, ArrowLeft } from 'lucide-react';
import { translateContent } from '@/lib/gemini';

const AdminGuideForm = ({ guide, onSave, onCancel }) => {
  const [title, setTitle] = useState(guide.title || '');
  const [description, setDescription] = useState(guide.description || '');
  const [content, setContent] = useState(guide.content_html || '');
  const [titleEs, setTitleEs] = useState(guide.title_es || '');
  const [titlePt, setTitlePt] = useState(guide.title_pt || '');
  const [descriptionEs, setDescriptionEs] = useState(guide.description_es || '');
  const [descriptionPt, setDescriptionPt] = useState(guide.description_pt || '');
  const [contentEs, setContentEs] = useState(guide.content_es || '');
  const [contentPt, setContentPt] = useState(guide.content_pt || '');
  const [isTranslating, setIsTranslating] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleTranslateAll = async () => {
    if (!title || !description || !content) {
      toast({ title: "Incomplete", description: "Fill title, description, and content first.", variant: "destructive" });
      return;
    }

    setIsTranslating(true);
    try {
      const [tEs, dEs, cEs] = await Promise.all([
        translateContent(title, 'Spanish'),
        translateContent(description, 'Spanish'),
        translateContent(content, 'Spanish')
      ]);
      setTitleEs(tEs);
      setDescriptionEs(dEs);
      setContentEs(cEs);

      const [tPt, dPt, cPt] = await Promise.all([
        translateContent(title, 'Portuguese'),
        translateContent(description, 'Portuguese'),
        translateContent(content, 'Portuguese')
      ]);
      setTitlePt(tPt);
      setDescriptionPt(dPt);
      setContentPt(cPt);

      toast({ title: "Success", description: "Translations generated." });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase.from('guides').update({
      title,
      description,
      content_html: content,
      title_es: titleEs,
      title_pt: titlePt,
      description_es: descriptionEs,
      description_pt: descriptionPt,
      content_es: contentEs,
      content_pt: contentPt,
      updated_at: new Date()
    }).eq('id', guide.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Guide updated successfully." });
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
    <div className="p-6 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onCancel}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
        <h2 className="text-2xl font-bold text-white">Edit Guide: {guide.title}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label className="text-gray-400 mb-2 block">English Title (Main)</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-gray-800 border-white/10" />
            </div>
            <div>
              <Label className="text-gray-400 mb-2 block">English Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} className="bg-gray-800 border-white/10" />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleTranslateAll}
              disabled={isTranslating}
              className="gap-2 border-blue-500/30 text-blue-400"
            >
              {isTranslating ? <Loader2 className="animate-spin h-4 w-4" /> : <Globe className="h-4 w-4" />}
              Translate Content (Gemini)
            </Button>
          </div>
        </div>

        <div>
          <Label className="text-gray-400 mb-2 block">English Content (Main HTML)</Label>
          <div className="bg-gray-800 rounded-lg border border-white/10 overflow-hidden">
            <ReactQuill theme="snow" value={content} onChange={setContent} modules={modules} />
          </div>
        </div>

        {/* Translation Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
          <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/5">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Spanish Version</h4>
            <Input value={titleEs} onChange={(e) => setTitleEs(e.target.value)} placeholder="Spanish Title" className="bg-gray-800 border-white/10" />
            <Input value={descriptionEs} onChange={(e) => setDescriptionEs(e.target.value)} placeholder="Spanish Description" className="bg-gray-800 border-white/10" />
            <textarea
              value={contentEs}
              onChange={(e) => setContentEs(e.target.value)}
              placeholder="Spanish Content"
              className="w-full h-40 bg-gray-800 border border-white/10 rounded-md p-3 text-sm text-gray-300 focus:outline-none"
            />
          </div>
          <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/5">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Portuguese Version</h4>
            <Input value={titlePt} onChange={(e) => setTitlePt(e.target.value)} placeholder="Portuguese Title" className="bg-gray-800 border-white/10" />
            <Input value={descriptionPt} onChange={(e) => setDescriptionPt(e.target.value)} placeholder="Portuguese Description" className="bg-gray-800 border-white/10" />
            <textarea
              value={contentPt}
              onChange={(e) => setContentPt(e.target.value)}
              placeholder="Portuguese Content"
              className="w-full h-40 bg-gray-800 border border-white/10 rounded-md p-3 text-sm text-gray-300 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700 font-bold px-8">
            {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel} className="text-gray-400 hover:text-white">Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default GuidesManager;
