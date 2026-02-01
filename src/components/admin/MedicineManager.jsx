import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Loader2, Image as ImageIcon, HeartPulse, DollarSign, Droplet, Sparkles, Activity, Tag, Info, Sliders } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/mySupabaseClient';
import { FormContainer, FormSection, FormInput, FormSelect, FormTextarea, FormFileUpload } from './AdminUIComponents';
import { AdminItemCard } from './AdminItemCard';

const MedicineForm = ({ item, onSave, onCancel, sharedMetadata }) => {
    const [formData, setFormData] = useState({
        name: '', description: '', image_url: '', image_path: '', subcategory_id: null,
        health: 0, price: 0, sell_price: 0, rarity_id: null, side_effects: {},
        hydration: 0, energy: 0
    });
    const [subcategories, setSubcategories] = useState([]);
    const [rarities, setRarities] = useState([]);
    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (!sharedMetadata) return;
        if (sharedMetadata.categories?.length && sharedMetadata.subcategories?.length) {
            const cat = sharedMetadata.categories.find(c => c.name === 'Meds');
            if (cat) {
                const subs = sharedMetadata.subcategories.filter(s => s.category_id === cat.id);
                setSubcategories(subs);
            }
        }
        setRarities(sharedMetadata.rarities || []);
    }, [sharedMetadata]);

    useEffect(() => {
        if (item) setFormData({ ...formData, ...item, side_effects: item.side_effects || {} });
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
        const filePath = `medicines/${fileName}`;
        const { error } = await supabase.storage.from('Items').upload(filePath, file);
        if (error) toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
        else {
            const { data: { publicUrl } } = supabase.storage.from('Items').getPublicUrl(filePath);
            setFormData(prev => ({ ...prev, image_url: publicUrl, image_path: filePath }));
        }
        setUploading(false);
    };

    return (
        <FormContainer
            title={item?.id ? `Calibrating Bio-chemical: ${formData.name}` : 'Synthesizing New Medical Asset'}
            onSave={() => onSave(formData)}
            onCancel={onCancel}
            isSaving={uploading}
        >
            <FormSection title="Biological Identity" icon={Info}>
                <FormInput
                    label="Compound Designation"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Item name..."
                />
                <FormSelect
                    label="Classification"
                    name="subcategory_id"
                    value={formData.subcategory_id || ''}
                    onChange={handleChange}
                >
                    <option value="">Select Subcategory</option>
                    {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </FormSelect>
                <FormSelect
                    label="Purity Grade (Rarity)"
                    name="rarity_id"
                    value={formData.rarity_id || ''}
                    onChange={handleChange}
                >
                    <option value="">Select Rarity</option>
                    {rarities.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </FormSelect>
                <FormFileUpload
                    label="Molecular Template"
                    onChange={handleFileChange}
                    previewUrl={formData.image_url}
                    fileName={formData.image_path?.split('/').pop()}
                    icon={ImageIcon}
                />
            </FormSection>

            <FormSection title="Efficacy Parameters" icon={Activity} columns={3}>
                <FormInput
                    label="Bio-Regen (Health)"
                    name="health"
                    type="number"
                    value={formData.health}
                    onChange={handleChange}
                />
                <FormInput
                    label="Hydration Level"
                    name="hydration"
                    type="number"
                    value={formData.hydration}
                    onChange={handleChange}
                />
                <FormInput
                    label="Neuro-Energy"
                    name="energy"
                    type="number"
                    value={formData.energy}
                    onChange={handleChange}
                />
            </FormSection>

            <FormSection title="Economic Value" icon={DollarSign} columns={2}>
                <FormInput
                    label="Acquisition Credits"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                />
                <FormInput
                    label="Recycle Credit"
                    name="sell_price"
                    type="number"
                    value={formData.sell_price}
                    onChange={handleChange}
                />
            </FormSection>

            <FormSection title="Medical Intelligence" icon={Tag} columns={1}>
                <FormTextarea
                    label="Compound Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Document pharmaceutical properties..."
                />
                <div className="mt-4">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Adverse Side Effects (JSON Protocol)</label>
                    <textarea
                        className="w-full bg-[#0f0f12] border border-white/5 rounded-xl p-4 text-xs font-mono text-gray-400 focus:outline-none focus:border-red-500/30 transition-all min-h-[100px]"
                        placeholder='{ "Drowsiness": "Reduced stamina recovery" }'
                        value={typeof formData.side_effects === 'object' ? JSON.stringify(formData.side_effects, null, 2) : formData.side_effects}
                        onChange={(e) => setFormData(p => ({ ...p, side_effects: e.target.value }))}
                    />
                </div>
            </FormSection>
        </FormContainer>
    );
};

const MedicineManager = ({ onSaveCallback, sharedMetadata }) => {
    const [items, setItems] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const loadItems = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('medicines').select('*, subcategory:wiki_subcategories(name), rarity:rarities(name, color)').order('created_at');
        if (error) toast({ title: "Fetch Aborted", description: "Could not sync med-records.", variant: "destructive" });
        else setItems(data || []);
        setLoading(false);
    }, [toast]);

    useEffect(() => { loadItems(); }, [loadItems]);

    const handleSave = async (item) => {
        const { id, subcategory, rarity, ...itemData } = item;
        const dataToSubmit = { ...itemData };
        if (dataToSubmit.subcategory_id === '') dataToSubmit.subcategory_id = null;
        if (dataToSubmit.rarity_id === '') dataToSubmit.rarity_id = null;

        try {
            if (typeof dataToSubmit.side_effects === 'string' && dataToSubmit.side_effects.trim()) {
                dataToSubmit.side_effects = JSON.parse(dataToSubmit.side_effects);
            } else if (typeof dataToSubmit.side_effects === 'string' && !dataToSubmit.side_effects.trim()) {
                dataToSubmit.side_effects = {};
            }
        } catch (e) {
            toast({ title: "Protocol Error", description: "Side effects must be valid JSON.", variant: "destructive" });
            return;
        }

        const { error } = id
            ? await supabase.from('medicines').update(dataToSubmit).eq('id', id)
            : await supabase.from('medicines').insert(dataToSubmit);

        if (error) toast({ title: "Write Failed", description: error.message, variant: "destructive" });
        else {
            toast({ title: "Synchronized", description: "Compound protocols updated." });
            setShowForm(false);
            setEditingItem(null);
            loadItems();
            if (onSaveCallback) onSaveCallback();
        }
    };

    const handleDelete = async (item) => {
        if (!confirm(`Confirm purging of medical asset: ${item.name}?`)) return;
        if (item.image_path) await supabase.storage.from('Items').remove([item.image_path]);
        const { error } = await supabase.from('medicines').delete().eq('id', item.id);
        if (error) toast({ title: "Purge Aborted", description: error.message, variant: "destructive" });
        else {
            toast({ title: "Purged", description: "Medical record expunged." });
            loadItems();
            if (onSaveCallback) onSaveCallback();
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center text-white">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-3">
                        <HeartPulse className="text-red-600" />
                        Bio-Tactical Dispensary
                    </h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Manage pharmaceutical compounds and medical supplies</p>
                </div>
                <Button
                    onClick={() => { setEditingItem(null); setShowForm(true); }}
                    className="bg-red-600 hover:bg-red-500 rounded-xl px-6 h-10 font-bold uppercase tracking-widest text-[10px]"
                >
                    <Plus className="w-4 h-4 mr-2" /> Register Compound
                </Button>
            </div>

            {showForm && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <MedicineForm
                        item={editingItem}
                        onSave={handleSave}
                        onCancel={() => { setShowForm(false); setEditingItem(null); }}
                        sharedMetadata={sharedMetadata}
                    />
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-red-500 h-12 w-12" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {items.map((item, idx) => (
                        <AdminItemCard
                            key={item.id}
                            index={idx}
                            item={item}
                            type="consumable"
                            onEdit={(it) => { setEditingItem(it); setShowForm(true); }}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MedicineManager;
