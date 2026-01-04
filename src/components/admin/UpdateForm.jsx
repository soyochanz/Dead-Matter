import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { X } from 'lucide-react';

const UpdateForm = ({ update: existingUpdate, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [content, setContent] = useState('');
  const [version, setVersion] = useState('');
  const [category, setCategory] = useState('Major updates');
  const [id, setId] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (existingUpdate) {
      setTitle(existingUpdate.title);
      setDate(existingUpdate.date);
      setContent(existingUpdate.content || '');
      setVersion(existingUpdate.version || '');
      setCategory(existingUpdate.category || 'Major updates');
      setId(existingUpdate.id);
    } else {
      setTitle('');
      setDate(new Date().toISOString().slice(0, 10));
      setContent('');
      setVersion('');
      setCategory('Major updates');
      setId(null);
    }
  }, [existingUpdate]);

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
    };

    let error;
    if (id) {
      ({ error } = await supabase.from('updates').update(updateData).eq('id', id));
    } else {
      ({ error } = await supabase.from('updates').insert([updateData]));
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
      ['bold', 'italic', 'underline','strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
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
        
        <ReactQuill 
            theme="snow" 
            value={content} 
            onChange={setContent}
            modules={modules}
        />
        
        <div className="flex gap-4">
            <Button type="submit">{id ? 'Save Changes' : 'Create Update'}</Button>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
        </form>
    </div>
  );
};

export default UpdateForm;