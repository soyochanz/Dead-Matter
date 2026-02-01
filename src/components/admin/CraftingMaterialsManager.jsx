import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/mySupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Trash2, Edit, Image as ImageIcon, Hammer, Info, Tag } from 'lucide-react';
import { FormContainer, FormSection, FormInput, FormTextarea, FormFileUpload } from './AdminUIComponents';
import { AdminItemCard } from './AdminItemCard';

const MaterialForm = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState(item || { name: '', description: '', image_url: '', image_path: '' });
    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();

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

    return (
        <FormContainer
            title={item?.id ? `Calibrating Resource: ${formData.name}` : 'Synthesizing New Raw Material'}
            onSave={() => onSave(formData)}
            onCancel={onCancel}
            isSaving={uploading}
        >
            <FormSection title="Resource Specifications" icon={Info}>
                <FormInput
                    label="Material Nomenclature"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Material designation..."
                />
                <FormFileUpload
                    label="Molecular Reference Image"
                    onChange={handleFileChange}
                    previewUrl={formData.image_url}
                    fileName={formData.image_path?.split('/').pop()}
                    icon={ImageIcon}
                />
            </FormSection>
            <FormSection title="Composition Details" icon={Tag} columns={1}>
                <FormTextarea
                    label="Material Properties"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe industrial applications and physical properties..."
                />
            </FormSection>
        </FormContainer>
    );
};

const CraftingMaterialsManager = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const { toast } = useToast();

    const fetchMaterials = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('crafting_materials').select('*').order('name');
        if (error) {
            toast({ title: 'Error', description: 'Failed to access material records.', variant: 'destructive' });
        } else {
            setMaterials(data || []);
        }
        setLoading(false);
    }, [toast]);

    useEffect(() => { fetchMaterials(); }, [fetchMaterials]);

    const handleSave = async (formData) => {
        const { id, ...updateData } = formData;
        const { error } = id
            ? await supabase.from('crafting_materials').update(updateData).eq('id', id)
            : await supabase.from('crafting_materials').insert(updateData);

        if (error) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Success', description: `Material record ${id ? 'calibrated' : 'synthesized'}.` });
            setShowForm(false);
            setEditingItem(null);
            fetchMaterials();
        }
    };

    const handleDelete = async (item) => {
        if (!confirm(`Permanently expunge ${item.name} from resource database?`)) return;
        if (item.image_path) await supabase.storage.from('Items').remove([item.image_path]);
        const { error } = await supabase.from('crafting_materials').delete().eq('id', item.id);
        if (error) toast({ title: 'Purge Failed', description: error.message, variant: 'destructive' });
        else { toast({ title: 'Expunged', description: 'Resource record removed.' }); fetchMaterials(); }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center text-white">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-3">
                        <Hammer className="text-red-600" />
                        Industrial Logistics
                    </h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Manage raw materials and crafting components</p>
                </div>
                <Button
                    onClick={() => { setEditingItem(null); setShowForm(true); }}
                    className="bg-red-600 hover:bg-red-500 rounded-xl px-6 h-10 font-bold uppercase tracking-widest text-[10px]"
                >
                    <Plus className="w-4 h-4 mr-2" /> Register Resource
                </Button>
            </div>

            {showForm && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <MaterialForm
                        item={editingItem}
                        onSave={handleSave}
                        onCancel={() => { setShowForm(false); setEditingItem(null); }}
                    />
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-red-500 h-12 w-12" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {materials.map((item, idx) => (
                        <AdminItemCard
                            key={item.id}
                            item={item}
                            type="crafting_material"
                            index={idx}
                            onEdit={(it) => { setEditingItem(it); setShowForm(true); }}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CraftingMaterialsManager;
