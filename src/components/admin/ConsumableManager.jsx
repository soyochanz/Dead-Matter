import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Sparkles, Droplet, HeartPulse, ShieldAlert, FileKey, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/mySupabaseClient';
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from '@/components/ui/input';
import { AdminItemCard } from './AdminItemCard';
import { FormContainer, FormSection, FormInput, FormSelect, FormTextarea, FormFileUpload } from './AdminUIComponents';
import { Info, Tag, FlaskConical, DollarSign, Image as ImageIcon, Sparkles, Droplet, HeartPulse, ShieldAlert, FileKey } from 'lucide-react';

const ConsumableForm = ({ item, onSave, onCancel, filterType, sharedMetadata }) => {
    const defaultState = {
        name: '', description: '', image_url: '', image_path: '', subcategory_id: null,
        type: filterType || 'food', hydration: 0, energy: 0, health: 0, is_refillable: false,
        requires_can_opener: false, is_safe_to_eat_raw: true,
        side_effects_raw: {}, cooked_version_id: null,
        price: 0, sell_price: 0, rarity_id: null, side_effects: {}
    };

    const [formData, setFormData] = useState(defaultState);
    const [subcategories, setSubcategories] = useState([]);
    const [allConsumables, setAllConsumables] = useState([]);
    const [rarities, setRarities] = useState([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const { toast } = useToast();

    useEffect(() => {
        if (!sharedMetadata) return;

        // Filter subcategories for Consumables category
        if (sharedMetadata.categories?.length && sharedMetadata.subcategories?.length) {
            const cat = sharedMetadata.categories.find(c => c.name === 'Consumables');
            if (cat) {
                const subs = sharedMetadata.subcategories.filter(s => s.category_id === cat.id);
                setSubcategories(subs);
            }
        }
        setRarities(sharedMetadata.rarities || []);

        // Items list is still needed for "Cooked Version" selection
        const fetchItems = async () => {
            const { data } = await supabase.from('consumables').select('id, name');
            setAllConsumables(data || []);
        };
        fetchItems();
    }, [sharedMetadata]);

    useEffect(() => {
        const initialState = { ...defaultState, type: filterType || 'food' };
        if (item) {
            setFormData({
                ...initialState,
                ...item,
                side_effects_raw: item.side_effects_raw || {},
                side_effects: item.side_effects || {},
                subcategory_id: item.subcategory_id || null,
            });
        } else {
            setFormData(initialState);
        }
    }, [item, filterType]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value }));
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setUploading(true);
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `public/${fileName}`;
        const { error } = await supabase.storage.from('Items').upload(filePath, file);
        if (error) {
            toast({ title: "Upload Error", description: error.message, variant: "destructive" });
            setUploading(false);
            return;
        }
        const { data: { publicUrl } } = supabase.storage.from('Items').getPublicUrl(filePath);
        setFormData(prev => ({ ...prev, image_url: publicUrl, image_path: filePath }));
        setUploading(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSave = { ...formData };
        if (dataToSave.type === 'drink') {
            dataToSave.requires_can_opener = false;
            dataToSave.is_safe_to_eat_raw = true;
            dataToSave.cooked_version_id = null;
        }
        if (dataToSave.type === 'food' && dataToSave.is_safe_to_eat_raw) {
            dataToSave.cooked_version_id = null;
        }
        onSave(dataToSave);
    };

    const formSelectClass = "w-full h-10 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 backdrop-blur-sm";
    const formLabelClass = "block text-sm font-medium text-gray-300 mb-1";

    return (
        <FormContainer
            title={item?.id ? `Modify ${formData.name}` : `Catalog New ${formData.type === 'drink' ? 'Hydration' : 'Nutrient'} Source`}
            onSave={handleSubmit}
            onCancel={onCancel}
            isSaving={uploading}
        >
            <FormSection title="Source Specifications" icon={Info}>
                <FormInput
                    label="Nomenclature"
                    name="name"
                    placeholder="Item Name"
                    value={formData.name}
                    onChange={handleChange}
                />
                {!filterType && (
                    <FormSelect label="Source Type" name="type" value={formData.type} onChange={handleChange}>
                        <option value="food">Food (Nutrient)</option>
                        <option value="drink">Drink (Hydration)</option>
                    </FormSelect>
                )}
                <FormSelect
                    label="Class Assignment"
                    name="subcategory_id"
                    value={formData.subcategory_id}
                    onChange={handleChange}
                >
                    <option value="">Select Subcategory</option>
                    {subcategories.filter(s => s && s.wiki_categories).map(s => (
                        <option key={s.id} value={s.id}>{s.wiki_categories.name} / {s.name}</option>
                    ))}
                </FormSelect>
                <FormSelect
                    label="Rarity Grade"
                    name="rarity_id"
                    value={formData.rarity_id}
                    onChange={handleChange}
                >
                    <option value="">Select Rarity</option>
                    {rarities.filter(r => r).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </FormSelect>
                <FormFileUpload
                    label="Neural Visual Asset"
                    accept="image/*"
                    onChange={handleFileChange}
                    previewUrl={formData.image_url}
                    fileName={formData.image_path?.split('/').pop()}
                    icon={ImageIcon}
                />
            </FormSection>

            <FormSection title="Narrative & Effects" icon={Tag} columns={1}>
                <FormTextarea
                    label="Detailed Description"
                    name="description"
                    placeholder="Enter item deployment notes..."
                    value={formData.description}
                    onChange={handleChange}
                />
                <FormTextarea
                    label="Physiological Side Effects (JSON)"
                    name="side_effects"
                    placeholder='{ "Drowsiness": "Reduces stamina regeneration" }'
                    value={typeof formData.side_effects === 'object' ? JSON.stringify(formData.side_effects, null, 2) : formData.side_effects}
                    onChange={(e) => setFormData(p => ({ ...p, side_effects: e.target.value }))}
                />
            </FormSection>

            <FormSection title="Economic Value" icon={DollarSign} columns={2}>
                <FormInput
                    label="Acquisition Price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                />
                <FormInput
                    label="Resale Recovery"
                    name="sell_price"
                    type="number"
                    value={formData.sell_price}
                    onChange={handleChange}
                />
            </FormSection>

            <FormSection title="Physiological Impact" icon={FlaskConical}>
                <FormInput
                    label="Hydration Restore"
                    name="hydration"
                    type="number"
                    value={formData.hydration}
                    onChange={handleChange}
                />
                <FormInput
                    label="Energy Replenishment"
                    name="energy"
                    type="number"
                    value={formData.energy}
                    onChange={handleChange}
                />
                <FormInput
                    label="Vitality Recovery"
                    name="health"
                    type="number"
                    value={formData.health}
                    onChange={handleChange}
                />
            </FormSection>

            {(formData.type === 'drink' || formData.type === 'food') && (
                <FormSection title="Environmental Interaction" icon={ShieldAlert}>
                    {formData.type === 'drink' && (
                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                            <Checkbox
                                id="is_refillable"
                                checked={formData.is_refillable}
                                onCheckedChange={(checked) => handleChange({ target: { name: 'is_refillable', type: 'checkbox', checked } })}
                            />
                            <label htmlFor="is_refillable" className="text-[10px] font-black uppercase text-white tracking-widest cursor-pointer">Re-fillable System</label>
                        </div>
                    )}
                    {formData.type === 'food' && (
                        <>
                            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                                <Checkbox
                                    id="requires_can_opener"
                                    checked={formData.requires_can_opener}
                                    onCheckedChange={(checked) => handleChange({ target: { name: 'requires_can_opener', type: 'checkbox', checked } })}
                                />
                                <label htmlFor="requires_can_opener" className="text-[10px] font-black uppercase text-white tracking-widest cursor-pointer">Seal Integrity (Can Opener)</label>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                                <Checkbox
                                    id="is_safe_to_eat_raw"
                                    checked={formData.is_safe_to_eat_raw}
                                    onCheckedChange={(checked) => handleChange({ target: { name: 'is_safe_to_eat_raw', type: 'checkbox', checked } })}
                                />
                                <label htmlFor="is_safe_to_eat_raw" className="text-[10px] font-black uppercase text-white tracking-widest cursor-pointer">Biological Safety (Safe Raw)</label>
                            </div>
                            {!formData.is_safe_to_eat_raw && (
                                <FormSelect
                                    label="Processed Counterpart"
                                    name="cooked_version_id"
                                    value={formData.cooked_version_id}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Cooked Item</option>
                                    {allConsumables.filter(c => c && c.id !== item?.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </FormSelect>
                            )}
                        </>
                    )}
                </FormSection>
            )}
        </FormContainer>
    );
};

const ConsumableManager = ({ onSaveCallback, sharedMetadata }) => {
    const [items, setItems] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const loadItems = useCallback(async () => {
        setLoading(true);
        let query = supabase.from('consumables').select('*, subcategory:wiki_subcategories(name), rarity:rarities(name, color)').order('created_at').or('type.eq.food,type.eq.drink');

        const { data, error } = await query;

        if (error) toast({ title: "Error", description: "Could not load consumables.", variant: "destructive" });
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
                dataToSubmit.side_effects = null;
            }
        } catch (e) {
            toast({ title: "Invalid JSON", description: "Side Effects format is not valid JSON.", variant: "destructive" });
            return;
        }

        const { error } = id
            ? await supabase.from('consumables').update(dataToSubmit).eq('id', id)
            : await supabase.from('consumables').insert(dataToSubmit);

        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else {
            toast({ title: "Saved!", description: "Consumable saved." });
            setShowForm(false);
            setEditingItem(null);
            loadItems();
            if (onSaveCallback) onSaveCallback();
        }
    };

    const handleDelete = async (item) => {
        if (item.image_path) {
            await supabase.storage.from('Items').remove([item.image_path]);
        }
        const { error } = await supabase.from('consumables').delete().eq('id', item.id);
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else {
            toast({ title: "Deleted!", description: "Consumable deleted." });
            loadItems();
            if (onSaveCallback) onSaveCallback();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center text-white">
                <h2 className="text-2xl font-bold uppercase tracking-tight">Manage Consumables (Food & Drink)</h2>
                <Button
                    onClick={() => { setEditingItem(null); setShowForm(true); }}
                    className="bg-red-600 hover:bg-red-500 rounded-xl px-6 h-10 font-bold uppercase tracking-widest text-[10px]"
                >
                    <Plus className="w-4 h-4 mr-2" /> New Consumable
                </Button>
            </div>
            {showForm && (
                <div className="mt-8">
                    <ConsumableForm
                        item={editingItem}
                        onSave={handleSave}
                        onCancel={() => setShowForm(false)}
                        sharedMetadata={sharedMetadata}
                    />
                </div>
            )}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-red-500 h-8 w-8" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mt-8">
                    {items.filter(i => i).map((item, idx) => (
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

export default ConsumableManager;
