import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/mySupabaseClient';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Edit, Trash2, Package, Info, Tag, Layers, Sliders, Image as ImageIcon, Weight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { FormContainer, FormSection, FormInput, FormSelect, FormTextarea, FormFileUpload } from './AdminUIComponents';
import { AdminItemCard } from './AdminItemCard';
import CustomStatManager from './CustomStatManager';

const ToolbeltForm = ({ item, onSave, onCancel, rarities }) => {
    const [formData, setFormData] = useState({
        name: '', description: '', price: 0, sell_price: 0,
        weight: 0, size: '', storage_capacity: 0, use_function: '',
        rarity_id: null, image_url: '', image_path: '', stats: {}
    });
    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (item) setFormData({ ...formData, ...item, stats: item.stats || {} });
    }, [item]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setUploading(true);
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `toolbelts/${fileName}`;
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
            title={item?.id ? `Calibrating Loadout: ${formData.name}` : 'Initializing Toolbelt Prototype'}
            onSave={() => onSave(formData)}
            onCancel={onCancel}
            isSaving={uploading}
        >
            <FormSection title="Rig Logistics" icon={Info}>
                <FormInput
                    label="Module Designation"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Toolbelt name..."
                />
                <FormSelect
                    label="Integrity Grade"
                    name="rarity_id"
                    value={formData.rarity_id || ''}
                    onChange={handleChange}
                >
                    <option value="">Select Rarity</option>
                    {rarities.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </FormSelect>
                <FormFileUpload
                    label="Neural Visual Asset"
                    onChange={handleFileChange}
                    previewUrl={formData.image_url}
                    fileName={formData.image_path?.split('/').pop()}
                    icon={ImageIcon}
                />
            </FormSection>

            <FormSection title="Technical Specs" icon={Sliders} columns={2}>
                <FormInput
                    label="Mass (KG)"
                    name="weight"
                    type="number"
                    value={formData.weight}
                    onChange={handleChange}
                />
                <FormInput
                    label="Storage Capacity (Units)"
                    name="storage_capacity"
                    type="number"
                    value={formData.storage_capacity}
                    onChange={handleChange}
                />
                <FormInput
                    label="Form Factor (Size)"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    placeholder="e.g. 2x2"
                />
                <FormInput
                    label="Operational Utility"
                    name="use_function"
                    value={formData.use_function}
                    onChange={handleChange}
                    placeholder="Primary function..."
                />
            </FormSection>

            <FormSection title="Economic Valuation" icon={Layers} columns={2}>
                <FormInput
                    label="Acquisition Value"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                />
                <FormInput
                    label="Recycle Recovery"
                    name="sell_price"
                    type="number"
                    value={formData.sell_price}
                    onChange={handleChange}
                />
            </FormSection>

            <FormSection title="Field Profile" icon={Tag} columns={1}>
                <FormTextarea
                    label="Deployment Narrative"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Technical description and field notes..."
                />
            </FormSection>

            <div className="pt-8 border-t border-white/5">
                <CustomStatManager
                    stats={formData.stats}
                    setStats={stats => setFormData(prev => ({ ...prev, stats }))}
                />
            </div>
        </FormContainer>
    );
};

const ToolbeltManager = ({ sharedMetadata }) => {
    const [toolbelts, setToolbelts] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [rarities, setRarities] = useState([]);
    const { toast } = useToast();

    const fetchToolbelts = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('toolbelts').select('*, rarity:rarities(name, color)').order('name');
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else setToolbelts(data || []);

        if (sharedMetadata?.rarities) setRarities(sharedMetadata.rarities);
        else {
            const { data: raritiesData } = await supabase.from('rarities').select('*');
            setRarities(raritiesData || []);
        }
        setLoading(false);
    }, [toast, sharedMetadata]);

    useEffect(() => { fetchToolbelts(); }, [fetchToolbelts]);

    const handleSave = async (formData) => {
        const { id, rarity, ...data } = formData;
        const { error } = id
            ? await supabase.from('toolbelts').update(data).eq('id', id)
            : await supabase.from('toolbelts').insert([data]);

        if (error) toast({ title: "Submission Error", description: error.message, variant: "destructive" });
        else {
            toast({ title: "Synchronized", description: `Loadout ${id ? 'recalibrated' : 'registered'}.` });
            setShowForm(false);
            setEditingItem(null);
            fetchToolbelts();
        }
    };

    const handleDelete = async (item) => {
        if (!confirm(`Purge toolbelt module: ${item.name}?`)) return;
        if (item.image_path) await supabase.storage.from('Items').remove([item.image_path]);
        const { error } = await supabase.from('toolbelts').delete().eq('id', item.id);
        if (error) toast({ title: "Purge Failed", description: error.message, variant: "destructive" });
        else { toast({ title: "Success", description: "Module removed from inventory." }); fetchToolbelts(); }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center text-white">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-3">
                        <Layers className="text-red-600" />
                        Auxiliary Tactical Rigs
                    </h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Manage utility belts and modular carry systems</p>
                </div>
                <Button
                    onClick={() => { setEditingItem(null); setShowForm(true); }}
                    className="bg-red-600 hover:bg-red-500 rounded-xl px-6 h-10 font-bold uppercase tracking-widest text-[10px]"
                >
                    <Plus className="w-4 h-4 mr-2" /> Register Carry System
                </Button>
            </div>

            {showForm && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <ToolbeltForm
                        item={editingItem}
                        onSave={handleSave}
                        onCancel={() => { setShowForm(false); setEditingItem(null); }}
                        rarities={rarities}
                    />
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-red-500 h-12 w-12" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {toolbelts.map((item, idx) => (
                        <AdminItemCard
                            key={item.id}
                            item={item}
                            type="toolbelt"
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

export default ToolbeltManager;
