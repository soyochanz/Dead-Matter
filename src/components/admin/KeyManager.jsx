import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/mySupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, Loader2, Upload, Lock, DoorOpen, DollarSign, MapPin, Image as ImageIcon, Key } from 'lucide-react';
import { FormContainer, FormSection, FormInput, FormSelect, FormTextarea, FormFileUpload } from './AdminUIComponents';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const DoorForm = ({ door, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ door_description: '', door_image_url: '', door_image_path: '' });
    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (door) setFormData(door);
    }, [door]);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setUploading(true);
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `doors/${fileName}`;
        const { error } = await supabase.storage.from('Items').upload(filePath, file);
        if (error) {
            toast({ title: "Upload Error", description: error.message, variant: "destructive" });
        } else {
            const { data: { publicUrl } } = supabase.storage.from('Items').getPublicUrl(filePath);
            setFormData(prev => ({ ...prev, door_image_url: publicUrl, door_image_path: filePath }));
        }
        setUploading(false);
    };

    return (
        <div className="mt-4 p-6 bg-white/[0.03] border border-white/10 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2 mb-2">
                <DoorOpen className="w-4 h-4 text-red-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Door Physical Asset</span>
            </div>

            <FormInput
                label="Asset Description"
                placeholder="e.g. North Maintenance Gate"
                value={formData.door_description}
                onChange={e => setFormData(p => ({ ...p, door_description: e.target.value }))}
            />

            <FormFileUpload
                label="Physical Reference Image"
                onChange={handleFileChange}
                previewUrl={formData.door_image_url}
                fileName={formData.door_image_path?.split('/').pop()}
                icon={ImageIcon}
                className="bg-black/20"
            />

            <div className="flex gap-2 pt-2">
                <Button
                    onClick={() => onSave(formData)}
                    disabled={uploading || !formData.door_description}
                    className="bg-red-600 hover:bg-red-500 font-bold uppercase tracking-widest text-[10px] h-9 px-6"
                >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sync Door Asset'}
                </Button>
                <Button variant="ghost" onClick={onCancel} className="text-[10px] font-bold uppercase tracking-widest h-9">Cancel</Button>
            </div>
        </div>
    );
};

const KeyForm = ({ item, onSave, onCancel, sharedMetadata }) => {
    const defaultState = { name: '', price: 0, sell_price: 0, rarity_id: null, spawn_locations: '', image_url: '', image_path: '' };
    const [formData, setFormData] = useState(defaultState);
    const [rarities, setRarities] = useState([]);
    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (sharedMetadata?.rarities) setRarities(sharedMetadata.rarities);
    }, [sharedMetadata]);

    useEffect(() => {
        if (item) setFormData({ ...defaultState, ...item });
        else setFormData(defaultState);
    }, [item]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) || 0 : value }));
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setUploading(true);
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `keys/${fileName}`;
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
            title={item?.id ? `Modifying Key Asset: ${formData.name}` : 'Initializing New Security Key'}
            onSave={() => onSave(formData)}
            onCancel={onCancel}
            isSaving={uploading}
        >
            <FormSection title="Core Identification" icon={Key}>
                <FormInput
                    label="Access Nomenclature"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Key designation..."
                />
                <FormSelect
                    label="Rarity Grade"
                    name="rarity_id"
                    value={formData.rarity_id || ''}
                    onChange={handleChange}
                >
                    <option value="">Select Category</option>
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

            <FormSection title="Logistics & Recon" icon={MapPin} columns={1}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <FormInput
                        label="Acquisition Value"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleChange}
                    />
                    <FormInput
                        label="Recovery Value"
                        name="sell_price"
                        type="number"
                        value={formData.sell_price}
                        onChange={handleChange}
                    />
                </div>
                <FormTextarea
                    label="Intelligence: Known Spawn Coordinates"
                    name="spawn_locations"
                    value={formData.spawn_locations}
                    onChange={handleChange}
                    placeholder="Document suspected locations..."
                />
            </FormSection>
        </FormContainer>
    );
};

const KeyManager = ({ sharedMetadata }) => {
    const [items, setItems] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [managingDoorsForKey, setManagingDoorsForKey] = useState(null);
    const { toast } = useToast();

    const loadItems = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('keys').select('*, rarity:rarities(name, color), doors:key_doors(*)').order('name');
        if (error) toast({ title: "Error", description: "Could not load access keys.", variant: "destructive" });
        else setItems(data || []);
        setLoading(false);
    }, [toast]);

    useEffect(() => { loadItems(); }, [loadItems]);

    const handleSaveKey = async (item) => {
        const { id, rarity, doors, ...itemData } = item;
        const { error } = id ? await supabase.from('keys').update(itemData).eq('id', id) : await supabase.from('keys').insert(itemData);
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else {
            toast({ title: "Synchronized", description: "Access key protocols updated." });
            setShowForm(false);
            setEditingItem(null);
            loadItems();
        }
    };

    const handleDeleteKey = async (item) => {
        if (!confirm(`Confirm decommissioning of key: ${item.name}?`)) return;
        if (item.image_path) await supabase.storage.from('Items').remove([item.image_path]);
        await supabase.from('key_doors').delete().eq('key_id', item.id);
        const { error } = await supabase.from('keys').delete().eq('id', item.id);
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else { toast({ title: "Deleted", description: "Key credentials purged." }); loadItems(); }
    };

    const handleSaveDoor = async (door) => {
        const { id, ...doorData } = door;
        const payload = { ...doorData, key_id: managingDoorsForKey.keyId };
        const { error } = managingDoorsForKey.doorId ? await supabase.from('key_doors').update(payload).eq('id', managingDoorsForKey.doorId) : await supabase.from('key_doors').insert(payload);
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else { toast({ title: "Success", description: "Door reference linked." }); setManagingDoorsForKey(null); loadItems(); }
    };

    const handleDeleteDoor = async (doorId, doorPath) => {
        if (!confirm("Remove door physical link?")) return;
        if (doorPath) await supabase.storage.from('Items').remove([doorPath]);
        const { error } = await supabase.from('key_doors').delete().eq('id', doorId);
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else { toast({ title: "Removed", description: "Door link decommissioned." }); loadItems(); }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center text-white">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-3">
                        <Key className="text-red-600" />
                        Security Infrastructure
                    </h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Manage access keys and physical door links</p>
                </div>
                <Button
                    onClick={() => { setEditingItem(null); setShowForm(true); }}
                    className="bg-red-600 hover:bg-red-500 rounded-xl px-6 h-10 font-bold uppercase tracking-widest text-[10px]"
                >
                    <Plus className="w-4 h-4 mr-2" /> New Access Key
                </Button>
            </div>

            {showForm && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <KeyForm
                        item={editingItem}
                        onSave={handleSaveKey}
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
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {items.map(item => (
                        <div key={item.id} className="group relative bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden hover:border-red-500/30 transition-all duration-300 flex flex-col">
                            <div className="p-5 flex items-start gap-5">
                                <div className="w-16 h-16 bg-black/40 rounded-xl border border-white/5 p-2 flex items-center justify-center shrink-0">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt="" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <Key className="w-6 h-6 text-gray-700" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-grow">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-bold text-white tracking-wide truncate group-hover:text-red-500 transition-colors">{item.name}</h3>
                                        <div
                                            className="w-2 h-2 rounded-full mt-2 shrink-0 shadow-[0_0_8px_currentColor]"
                                            style={{ color: item.rarity?.color || '#333' }}
                                        />
                                    </div>
                                    <div className="text-[10px] text-gray-500 font-mono uppercase tracking-tighter mt-1">
                                        UID: {item.id.slice(0, 8)}
                                    </div>
                                    <div className="flex gap-4 mt-3">
                                        <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                                            <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                                            {item.price} CR
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                            <div className="w-1 h-1 bg-gray-400 rounded-full" />
                                            {item.doors?.length || 0} LINKS
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-5 pb-5 mt-auto">
                                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Linked Access Points</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setManagingDoorsForKey({ keyId: item.id, doorId: null, door: null })}
                                            className="h-6 w-6 p-0 text-red-500 hover:bg-red-500/10"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </Button>
                                    </div>

                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                        {item.doors?.map(d => (
                                            <div key={d.id} className="flex justify-between items-center bg-black/40 border border-white/5 p-2 px-3 rounded-lg group/door">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    {d.door_image_url && <img src={d.door_image_url} className="w-6 h-6 rounded bg-black object-cover" />}
                                                    <span className="text-[10px] text-gray-300 truncate font-medium">{d.door_description}</span>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover/door:opacity-100 transition-opacity">
                                                    <button onClick={() => setManagingDoorsForKey({ keyId: item.id, doorId: d.id, door: d })} className="p-1 text-gray-500 hover:text-white"><Edit size={12} /></button>
                                                    <button onClick={() => handleDeleteDoor(d.id, d.door_image_path)} className="p-1 text-gray-500 hover:text-red-500"><Trash2 size={12} /></button>
                                                </div>
                                            </div>
                                        ))}
                                        {(!item.doors || item.doors.length === 0) && (
                                            <div className="text-[9px] text-gray-600 text-center py-2 uppercase tracking-widest italic">No points linked</div>
                                        )}
                                    </div>

                                    {managingDoorsForKey?.keyId === item.id && (
                                        <DoorForm
                                            door={managingDoorsForKey.door}
                                            onSave={handleSaveDoor}
                                            onCancel={() => setManagingDoorsForKey(null)}
                                        />
                                    )}
                                </div>

                                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-white/5">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => { setEditingItem(item); setShowForm(true); }}
                                        className="h-8 w-8 text-gray-500 hover:text-white"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteKey(item)}
                                        className="h-8 w-8 text-gray-500 hover:text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default KeyManager;
