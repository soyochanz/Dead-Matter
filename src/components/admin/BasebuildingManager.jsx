import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Trash2, Edit, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const CATEGORIES = ["Items", "Storage", "Walls", "Doors", "Window", "Lighting", "Tents"];

const RequirementsManager = ({ requirements, setRequirements }) => {
    const [materials, setMaterials] = useState([]);

    useEffect(() => {
        const fetchMaterials = async () => {
            const { data } = await supabase.from('crafting_materials').select('id, name').order('name');
            setMaterials(data || []);
        };
        fetchMaterials();
    }, []);

    const addRequirement = () => setRequirements([...(requirements || []), { item_id: '', quantity: 1 }]);
    const removeRequirement = (index) => setRequirements(requirements.filter((_, i) => i !== index));
    const updateRequirement = (index, field, value) => {
        const newRequirements = [...requirements];
        newRequirements[index][field] = value;
        setRequirements(newRequirements);
    };

    return (
        <div className="space-y-3 p-3 bg-black/30 rounded-md">
            <Label>Requirements (for craftable items)</Label>
            {(requirements || []).map((req, index) => (
                <div key={index} className="flex items-center gap-2">
                    <select
                        value={req.item_id}
                        onChange={(e) => updateRequirement(index, 'item_id', e.target.value)}
                        className="w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white ring-offset-slate-900 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                        <option value="">Select Material</option>
                        {materials.map(mat => <option key={mat.id} value={mat.id}>{mat.name}</option>)}
                    </select>
                    <Input type="number" placeholder="Qty" value={req.quantity} onChange={(e) => updateRequirement(index, 'quantity', parseInt(e.target.value) || 1)} className="w-24" />
                    <Button type="button" variant="destructive" size="icon" onClick={() => removeRequirement(index)}><Trash2 className="w-4 h-4" /></Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addRequirement}>Add Requirement</Button>
        </div>
    );
};

const ImageUploader = ({ label, imageUrl, onUpload }) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const { toast } = useToast();

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setUploading(true);
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `basebuilding/${fileName}`;
        const { error } = await supabase.storage.from('Items').upload(filePath, file);
        if (error) {
            toast({ title: "Upload Error", description: error.message, variant: "destructive" });
        } else {
            const { data: { publicUrl } } = supabase.storage.from('Items').getPublicUrl(filePath);
            onUpload(publicUrl, filePath);
        }
        setUploading(false);
    };

    return (
        <div>
            <Label>{label}</Label>
            <div className="flex items-center gap-4 mt-2">
                <Button type="button" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                {imageUrl && <img src={imageUrl} alt="Preview" className="h-16 w-16 object-contain rounded-md bg-gray-700" />}
            </div>
        </div>
    );
};

const BasebuildingForm = ({ item, onSave, onCancel, rarities }) => {
    const [formData, setFormData] = useState(item || { category: CATEGORIES[0] });
    const [requirements, setRequirements] = useState(item?.requirements || []);

    const isCraftable = !["Items", "Tents"].includes(formData.category);
    const isStorage = formData.category === "Storage";
    const isItems = formData.category === "Items";
    const isTent = formData.category === "Tents";

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSave = { ...formData };
        if (isCraftable) {
            dataToSave.requirements = requirements.filter(r => r.item_id && r.quantity > 0);
        } else {
            delete dataToSave.requirements;
        }
        if (!isStorage) delete dataToSave.slots;
        if (!isItems) delete dataToSave.use;

        onSave(dataToSave);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto p-2">
            <Input name="name" placeholder="Item Name" value={formData.name || ''} onChange={handleChange} required />
            <Input name="description" placeholder="Description" value={formData.description || ''} onChange={handleChange} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageUploader 
                    label="Image (Packed)" 
                    imageUrl={formData.image_url} 
                    onUpload={(url, path) => setFormData(p => ({...p, image_url: url, image_path: path}))}
                />
                {isTent && (
                    <ImageUploader 
                        label="Image (Unpacked)" 
                        imageUrl={formData.image_unpacked_url} 
                        onUpload={(url, path) => setFormData(p => ({...p, image_unpacked_url: url, image_unpacked_path: path}))}
                    />
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label>Category</Label>
                    <select name="category" value={formData.category || ''} onChange={handleChange} className="w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white ring-offset-slate-900 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                 <div>
                    <Label>Rarity</Label>
                    <select name="rarity_id" value={formData.rarity_id || ''} onChange={handleChange} className="w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white ring-offset-slate-900 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                        <option value="">Select Rarity</option>
                        {rarities.map(rarity => <option key={rarity.id} value={rarity.id}>{rarity.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input name="price" type="number" placeholder="Buy Price" value={formData.price || ''} onChange={handleChange} />
                <Input name="sell_price" type="number" step="0.1" placeholder="Sell Price" value={formData.sell_price || ''} onChange={handleChange} />
                <Input name="weight" type="number" step="0.1" placeholder="Weight" value={formData.weight || ''} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <Input name="health" type="number" placeholder="Health" value={formData.health || ''} onChange={handleChange} />
                {isStorage && <Input name="slots" type="number" placeholder="Inventory Slots" value={formData.slots || ''} onChange={handleChange} />}
                {isItems && <Input name="use" placeholder="Use (e.g., 'Generates Power')" value={formData.use || ''} onChange={handleChange} />}
            </div>

            {isCraftable && <RequirementsManager requirements={requirements} setRequirements={setRequirements} />}

            <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Item</Button>
            </div>
        </form>
    );
};


const BasebuildingManager = () => {
    const [items, setItems] = useState([]);
    const [rarities, setRarities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const { toast } = useToast();

    const fetchItems = useCallback(async () => {
        setLoading(true);
        const { data: itemsData, error: itemsError } = await supabase.from('basebuilding_items').select('*, rarity:rarities(name, color)').order('name');
        if (itemsError) {
            toast({ title: 'Error fetching items', description: itemsError.message, variant: 'destructive' });
        } else {
            setItems(itemsData);
        }

        const { data: raritiesData, error: raritiesError } = await supabase.from('rarities').select('*');
        if (raritiesError) {
            toast({ title: 'Error fetching rarities', description: raritiesError.message, variant: 'destructive' });
        } else {
            setRarities(raritiesData);
        }

        setLoading(false);
    }, [toast]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleSave = async (formData) => {
        const { id, rarity, ...updateData } = formData;
        
        // Ensure null for empty string rarity_id
        if (updateData.rarity_id === '') {
            updateData.rarity_id = null;
        }

        const { data, error } = id
            ? await supabase.from('basebuilding_items').update(updateData).eq('id', id).select()
            : await supabase.from('basebuilding_items').insert(updateData).select();
        
        if (error) {
            toast({ title: 'Error saving item', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: `Item ${id ? 'updated' : 'created'} successfully!`, description: data[0].name });
            setIsFormOpen(false);
            setEditingItem(null);
            fetchItems();
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        
        const pathsToRemove = [item.image_path, item.image_unpacked_path].filter(Boolean);
        if (pathsToRemove.length > 0) {
            await supabase.storage.from('Items').remove(pathsToRemove);
        }

        const { error } = await supabase.from('basebuilding_items').delete().eq('id', item.id);
        if (error) {
            toast({ title: 'Error deleting item', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Item deleted successfully!' });
            fetchItems();
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
                <h2 className="text-2xl font-bold">Manage Basebuilding Items</h2>
                <Button onClick={() => openForm()}><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit' : 'Add'} Basebuilding Item</DialogTitle>
                    </DialogHeader>
                    <BasebuildingForm 
                        item={editingItem} 
                        onSave={handleSave} 
                        onCancel={() => { setIsFormOpen(false); setEditingItem(null); }}
                        rarities={rarities}
                    />
                </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map(item => (
                    <div key={item.id} className="bg-gray-800/50 p-4 rounded-lg flex flex-col justify-between" style={{ borderBottom: `2px solid ${item.rarity?.color || 'transparent'}` }}>
                        <div>
                           <img src={item.image_url} alt={item.name} className="w-full h-32 object-contain mb-2 rounded bg-black/20" />
                            <h3 className="font-bold">{item.name}</h3>
                            <p className="text-sm text-gray-400">{item.category}</p>
                            <p className="text-sm" style={{ color: item.rarity?.color }}>{item.rarity?.name || 'Common'}</p>
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

export default BasebuildingManager;