import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/mySupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Trash2, Edit, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const MaterialForm = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState(item || {});
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const { toast } = useToast();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setUploading(true);
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `crafting_materials/${fileName}`;
        const { error } = await supabase.storage.from('Items').upload(filePath, file);
        if (error) {
            toast({ title: "Upload Error", description: error.message, variant: "destructive" });
        } else {
            const { data: { publicUrl } } = supabase.storage.from('Items').getPublicUrl(filePath);
            setFormData(prev => ({ ...prev, image_url: publicUrl, image_path: filePath }));
        }
        setUploading(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="name" placeholder="Material Name" value={formData.name || ''} onChange={handleChange} required />
            <textarea name="description" placeholder="Description" value={formData.description || ''} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 backdrop-blur-sm min-h-[80px]" />
            
            <div>
                <Label>Image</Label>
                <div className="flex items-center gap-4 mt-2">
                    <Button type="button" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    </Button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    {formData.image_url && <img src={formData.image_url} alt="Preview" className="h-16 w-16 object-contain rounded-md bg-gray-700" />}
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Material</Button>
            </div>
        </form>
    );
};

const CraftingMaterialsManager = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const { toast } = useToast();

    const fetchMaterials = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('crafting_materials').select('*').order('name');
        if (error) {
            toast({ title: 'Error fetching materials', description: error.message, variant: 'destructive' });
        } else {
            setMaterials(data);
        }
        setLoading(false);
    }, [toast]);

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    const handleSave = async (formData) => {
        const { id, ...updateData } = formData;
        const { data, error } = id
            ? await supabase.from('crafting_materials').update(updateData).eq('id', id).select()
            : await supabase.from('crafting_materials').insert(updateData).select();
        
        if (error) {
            toast({ title: 'Error saving material', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: `Material ${id ? 'updated' : 'created'} successfully!`, description: data[0].name });
            setIsFormOpen(false);
            setEditingItem(null);
            fetchMaterials();
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm("Are you sure you want to delete this material?")) return;
        
        if (item.image_path) {
            await supabase.storage.from('Items').remove([item.image_path]);
        }

        const { error } = await supabase.from('crafting_materials').delete().eq('id', item.id);
        if (error) {
            toast({ title: 'Error deleting material', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Material deleted successfully!' });
            fetchMaterials();
        }
    };

    const openForm = (item = null) => {
        setEditingItem(item);
        setIsFormOpen(true);
    };

    if (loading) return <div className="flex justify-center items-center"><Loader2 className="animate-spin h-8 w-8 text-red-500" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Manage Crafting Materials</h2>
                <Button onClick={() => openForm()}><PlusCircle className="mr-2 h-4 w-4" /> Add Material</Button>
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit' : 'Add'} Crafting Material</DialogTitle>
                    </DialogHeader>
                    <MaterialForm 
                        item={editingItem} 
                        onSave={handleSave} 
                        onCancel={() => { setIsFormOpen(false); setEditingItem(null); }}
                    />
                </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {materials.map(item => (
                    <div key={item.id} className="bg-gray-800/50 p-4 rounded-lg flex flex-col justify-between">
                        <div>
                           <img src={item.image_url} alt={item.name} className="w-full h-32 object-contain mb-2 rounded bg-black/20" />
                            <h3 className="font-bold">{item.name}</h3>
                            <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" size="icon" onClick={() => openForm(item)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="destructive" size="icon" onClick={() => handleDelete(item)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CraftingMaterialsManager;
