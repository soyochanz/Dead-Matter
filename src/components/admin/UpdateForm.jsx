import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { supabase } from '@/lib/mySupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { X, Search, Check, Zap } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const UpdateForm = ({ update: existingUpdate, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [content, setContent] = useState('');
  const [version, setVersion] = useState('');
  const [category, setCategory] = useState('Major updates');
  const [id, setId] = useState(null);

  // Translation State
  const [titleEs, setTitleEs] = useState('');
  const [titlePt, setTitlePt] = useState('');
  const [contentEs, setContentEs] = useState('');
  const [contentPt, setContentPt] = useState('');
  
  // Micro Changes Linking State
  const [allMicroChanges, setAllMicroChanges] = useState([]);
  const [selectedChangeIds, setSelectedChangeIds] = useState([]);
  const [mcSearch, setMcSearch] = useState('');
  const [isLoadingMC, setIsLoadingMC] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (existingUpdate) {
      setTitle(existingUpdate.title);
      setDate(existingUpdate.date);
      setContent(existingUpdate.content || '');
      setVersion(existingUpdate.version || '');
      setCategory(existingUpdate.category || 'Major updates');
      setId(existingUpdate.id);
      setTitleEs(existingUpdate.title_es || '');
      setTitlePt(existingUpdate.title_pt || '');
      setContentEs(existingUpdate.content_es || '');
      setContentPt(existingUpdate.content_pt || '');
      fetchExistingAssociations(existingUpdate.id);
    } else {
      setTitle('');
      setDate(new Date().toISOString().slice(0, 10));
      setContent('');
      setVersion('');
      setCategory('Major updates');
      setId(null);
      setTitleEs('');
      setTitlePt('');
      setContentEs('');
      setContentPt('');
      setSelectedChangeIds([]);
    }
    fetchAllMicroChanges();
  }, [existingUpdate]);

  const fetchAllMicroChanges = async () => {
    setIsLoadingMC(true);
    const { data, error } = await supabase
      .from('micro_changes')
      .select('id, message, commit_hash, category')
      .order('created_at', { ascending: false });
    
    if (!error && data) setAllMicroChanges(data);
    setIsLoadingMC(false);
  };

  const fetchExistingAssociations = async (updateId) => {
    const { data, error } = await supabase
      .from('update_micro_changes')
      .select('micro_change_id')
      .eq('update_id', updateId);
    
    if (!error && data) {
      setSelectedChangeIds(data.map(d => d.micro_change_id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !date) {
      toast({
        title: "Missing Fields",
        description: "Title and date are required.",
        variant: "destructive",
      });
      return;
    }

    const updateData = {
      title,
      date,
      content,
      version,
      category,
      title_es: titleEs,
      title_pt: titlePt,
      content_es: contentEs,
      content_pt: contentPt
    };

    let error;
    let savedUpdateId = id;

    if (id) {
      ({ error } = await supabase.from('updates').update(updateData).eq('id', id));
    } else {
      const { data, error: insertError } = await supabase.from('updates').insert([updateData]).select();
      error = insertError;
      if (data?.[0]) savedUpdateId = data[0].id;
    }

    if (!error && savedUpdateId) {
      // Sync micro changes
      // 1. Delete old
      await supabase.from('update_micro_changes').delete().eq('update_id', savedUpdateId);
      
      // 2. Insert new
      if (selectedChangeIds.length > 0) {
        const associations = selectedChangeIds.map(mcId => ({
          update_id: savedUpdateId,
          micro_change_id: mcId
        }));
        const { error: assocError } = await supabase.from('update_micro_changes').insert(associations);
        if (assocError) {
          console.error('Error saving associations:', assocError);
        }
      }
    }

    if (error) {
      toast({
        title: "Error saving update",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: `Update ${id ? 'saved' : 'created'} successfully!`,
      });
      onSave();
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  return (
    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white">{id ? 'Edit Update' : 'Create New Update'}</h3>
        <Button variant="ghost" size="icon" onClick={onCancel}><X className="h-6 w-6" /></Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          placeholder="Update Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-white bg-slate-800"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-white bg-slate-800"
          />
          <Input
            type="text"
            placeholder="Version (e.g., 0.11.2)"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className="text-white bg-slate-800"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white"
          >
            <option>Major updates</option>
            <option>Hotfixes</option>
            <option>Nightly updates</option>
          </select>
        </div>

        <div>
          <Label className="text-gray-400 mb-2 block">English Content (Main)</Label>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
          />
        </div>

        {/* Translation Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
          <div className="space-y-3 p-3 bg-white/5 rounded-lg border border-white/5">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">🇪🇸 Spanish Version (Manual Translation)</span>
            <div>
              <Label className="text-gray-400 mb-2 block text-xs">Title (ES)</Label>
              <Input
                value={titleEs}
                onChange={(e) => setTitleEs(e.target.value)}
                placeholder="Spanish Title"
                className="h-8 text-xs bg-slate-900 border-white/10"
              />
            </div>
            <div>
              <Label className="text-gray-400 mb-2 block text-xs">Content (ES) - Preserve HTML structure</Label>
              <div className="bg-slate-900 rounded-lg border border-white/10 overflow-hidden">
                <ReactQuill
                  theme="snow"
                  value={contentEs}
                  onChange={setContentEs}
                  modules={modules}
                  placeholder="Translate the content manually, keeping the same structure and images..."
                />
              </div>
            </div>
          </div>
          <div className="space-y-3 p-3 bg-white/5 rounded-lg border border-white/5">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">🇵🇹 Portuguese Version (Manual Translation)</span>
            <div>
              <Label className="text-gray-400 mb-2 block text-xs">Title (PT)</Label>
              <Input
                value={titlePt}
                onChange={(e) => setTitlePt(e.target.value)}
                placeholder="Portuguese Title"
                className="h-8 text-xs bg-slate-900 border-white/10"
              />
            </div>
            <div>
              <Label className="text-gray-400 mb-2 block text-xs">Content (PT) - Preserve HTML structure</Label>
              <div className="bg-slate-900 rounded-lg border border-white/10 overflow-hidden">
                <ReactQuill
                  theme="snow"
                  value={contentPt}
                  onChange={setContentPt}
                  modules={modules}
                  placeholder="Translate the content manually, keeping the same structure and images..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Micro Changes Selector */}
        <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/5">
          <div className="flex justify-between items-center mb-1">
            <Label className="text-gray-300 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
              <Zap size={14} className="text-yellow-500" />
              Link Micro Changes (Commits)
            </Label>
            <span className="text-[10px] text-gray-500 font-bold">{selectedChangeIds.length} Selected</span>
          </div>
          
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search commits..."
              value={mcSearch}
              onChange={(e) => setMcSearch(e.target.value)}
              className="pl-9 h-9 bg-slate-900 border-white/10 text-xs"
            />
          </div>

          <div className="h-48 rounded-md border border-white/10 bg-black/20 p-2 overflow-y-auto custom-scrollbar">
            {allMicroChanges
              .filter(mc => 
                mc.message.toLowerCase().includes(mcSearch.toLowerCase()) || 
                mc.commit_hash?.toLowerCase().includes(mcSearch.toLowerCase())
              )
              .map(mc => (
                <div 
                  key={mc.id} 
                  className={`flex items-start gap-3 p-2 rounded-lg mb-1 transition-colors cursor-pointer hover:bg-white/5 ${selectedChangeIds.includes(mc.id) ? 'bg-white/5' : ''}`}
                  onClick={() => {
                    setSelectedChangeIds(prev => 
                      prev.includes(mc.id) ? prev.filter(i => i !== mc.id) : [...prev, mc.id]
                    );
                  }}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedChangeIds.includes(mc.id) ? 'bg-red-600 border-red-600' : 'border-white/20'}`}>
                    {selectedChangeIds.includes(mc.id) && <Check size={10} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-300 line-clamp-1 leading-tight mb-1">{mc.message}</p>
                    <div className="flex items-center gap-2 text-[9px] font-mono">
                      <span className="text-blue-400">#{mc.commit_hash || mc.id.substring(0,6)}</span>
                      {mc.category && <span className="text-gray-600 uppercase font-black">{mc.category}</span>}
                    </div>
                  </div>
                </div>
              ))}
            {allMicroChanges.length === 0 && !isLoadingMC && <div className="text-center py-4 text-xs text-gray-600">No commits found.</div>}
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit">{id ? 'Save Changes' : 'Create Update'}</Button>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default UpdateForm;
