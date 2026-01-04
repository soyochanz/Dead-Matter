import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/mySupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const VehicleComponentManager = () => {
    const [components, setComponents] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('vehicle_components').select('*').order('name');
        if (error) toast({ title: "Error fetching components", description: error.message, variant: "destructive" });
        else setComponents(data);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!editingItem || !editingItem.name) {
            toast({ title: "Name is required", variant: "destructive" });
            return;
        }

        let error;
        if (editingItem.id) {
            ({ error } = await supabase.from('vehicle_components').update(editingItem).eq('id', editingItem.id));
        } else {
            // Remove id before inserting a new item
            const { id, ...newItem } = editingItem;
            ({ error } = await supabase.from('vehicle_components').insert([newItem]));
        }

        if (error) {
            toast({ title: "Error saving component", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Component saved successfully" });
            setEditingItem(null);
            fetchData();
        }
    };

    const handleDelete = async (id) => {
        // First, check if component is linked to any vehicles
        const { data: links, error: linkError } = await supabase.from('vehicle_required_components').select('vehicle_id').eq('component_id', id).limit(1);

        if (linkError) {
             toast({ title: "Error checking links", description: linkError.message, variant: "destructive" });
             return;
        }
        if (links && links.length > 0) {
            toast({ title: "Cannot delete", description: "This component is required by at least one vehicle. Unlink it first.", variant: "destructive" });
            return;
        }

        const { error } = await supabase.from('vehicle_components').delete().eq('id', id);
        if (error) {
            toast({ title: "Error deleting component", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Component deleted" });
            fetchData();
        }
    };
    
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `vehicle_components/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('Items').upload(filePath, file);

        if (uploadError) {
            toast({ title: "Error uploading image", description: uploadError.message, variant: "destructive" });
            return;
        }

        const { data } = supabase.storage.from('Items').getPublicUrl(filePath);
        setEditingItem({ ...editingItem, image_url: data.publicUrl, image_path: filePath });
    };

    const renderForm = () => (
        <div className="bg-slate-900 p-6 rounded-lg space-y-6 my-4 border border-slate-700">
            <h3 className="text-2xl font-bold text-white">{editingItem.id ? 'Edit Component' : 'Add New Component'}</h3>
            <Input placeholder="Name" value={editingItem.name || ''} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} />
            <textarea placeholder="Description" value={editingItem.description || ''} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} className="w-full bg-slate-800 p-2 rounded" />
            
            <div className="flex items-center gap-4">
                <Input type="file" accept="image/*" onChange={handleImageUpload} className="bg-slate-800 flex-grow"/>
                {editingItem.image_url && <img src={editingItem.image_url} alt="preview" className="w-20 h-20 object-contain rounded bg-slate-700"/>}
            </div>

            <div className="flex gap-4">
                <Button onClick={handleSave}><Save className="w-4 h-4 mr-2"/>Save</Button>
                <Button variant="outline" onClick={() => setEditingItem(null)}><X className="w-4 h-4 mr-2"/>Cancel</Button>
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Manage Vehicle Mechanics</h2>
                <Button onClick={() => setEditingItem({ name: '', description: '', image_url: '', image_path: '' })}><Plus className="w-4 h-4 mr-2"/>Add Component</Button>
            </div>

            {loading && <div className="flex justify-center p-8"><Loader2 className="animate-spin w-8 h-8 text-red-500" /></div>}
            
            {editingItem && renderForm()}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {components.map(item => (
                    <div key={item.id} className="bg-slate-800 rounded-lg p-4 flex flex-col justify-between">
                        <div>
                            {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-32 object-contain rounded-md bg-slate-700 mb-2"/>}
                            <h3 className="font-bold text-white">{item.name}</h3>
                            <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button size="icon" variant="outline" onClick={() => setEditingItem(item)}><Edit className="w-4 h-4"/></Button>
                            <Button size="icon" variant="destructive" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4"/></Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VehicleComponentManager;
