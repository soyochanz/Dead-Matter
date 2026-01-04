import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Loader2, Link, Skull, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Checkbox } from "@/components/ui/checkbox";
import MedicineManager from './MedicineManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const DiseaseForm = ({ item, onSave, onCancel }) => {
    const defaultState = { name: '', description: '', is_lethal: false, image_url: '', image_path: '' };
    const [formData, setFormData] = useState(defaultState);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const { toast } = useToast();
    const formInputClass = "w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500";
    
    useEffect(() => { if (item) setFormData({...defaultState, ...item}); else setFormData(defaultState); }, [item]);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setUploading(true);
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `diseases/${fileName}`;
        const { error } = await supabase.storage.from('Items').upload(filePath, file);
        if (error) {
            toast({ title: "Upload Error", description: error.message, variant: "destructive" });
        } else {
            const { data: { publicUrl } } = supabase.storage.from('Items').getPublicUrl(filePath);
            setFormData(prev => ({ ...prev, image_url: publicUrl, image_path: filePath }));
        }
        setUploading(false);
    };

    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };
    
    return (
        <form onSubmit={handleSubmit} className="bg-white/5 p-6 rounded-lg space-y-4">
            <h3 className="text-xl font-bold text-white">{item ? 'Edit' : 'New'} Disease</h3>
            <div><label className="text-sm text-gray-300">Name</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={formInputClass} required /></div>
            <div><label className="text-sm text-gray-300">Description</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className={formInputClass} /></div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-white"><Checkbox id="is_lethal" checked={formData.is_lethal} onCheckedChange={c => setFormData({...formData, is_lethal:c})} /><label htmlFor="is_lethal">Is Lethal?</label></div>
            </div>
             <div>
                <label className="text-sm text-gray-300">Image</label>
                <div className="flex items-center gap-4">
                    <Button type="button" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                        {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
                    </Button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    {formData.image_url && <img src={formData.image_url} alt="Preview" className="h-16 w-16 object-cover rounded-md" />}
                </div>
            </div>
            <div className="flex gap-2"><Button type="submit">Save</Button><Button type="button" onClick={onCancel} variant="outline">Cancel</Button></div>
        </form>
    );
};

const LinkerContent = ({ item, onLinkChange }) => {
    const [allItems, setAllItems] = useState([]);
    const [linkedItems, setLinkedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const isDisease = 'is_lethal' in item;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            if (isDisease) {
                const { data: meds } = await supabase.from('medicines').select('id, name');
                const { data: links } = await supabase.from('medicine_treats_disease').select('medicine_id').eq('disease_id', item.id);
                setAllItems(meds || []);
                setLinkedItems(links?.map(l => l.medicine_id) || []);
            } else { // It's a medicine
                const { data: diseases } = await supabase.from('diseases').select('id, name');
                const { data: links } = await supabase.from('medicine_treats_disease').select('disease_id').eq('medicine_id', item.id);
                setAllItems(diseases || []);
                setLinkedItems(links?.map(l => l.disease_id) || []);
            }
            setLoading(false);
        };
        fetchData();
    }, [item, isDisease]);

    const handleLink = async (targetId) => {
        const isLinked = linkedItems.includes(targetId);
        const linkData = isDisease ? { disease_id: item.id, medicine_id: targetId } : { medicine_id: item.id, disease_id: targetId };

        if (isLinked) {
            const { error } = await supabase.from('medicine_treats_disease').delete().match(linkData);
            if (!error) {
                 setLinkedItems(prev => prev.filter(id => id !== targetId));
                 if(onLinkChange) onLinkChange();
            }
            else toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
            const { error } = await supabase.from('medicine_treats_disease').insert(linkData);
            if (!error) {
                setLinkedItems(prev => [...prev, targetId]);
                if(onLinkChange) onLinkChange();
            }
            else toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    return (
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
                <DialogTitle>Link '{item.name}' to {isDisease ? 'Medicines' : 'Diseases'}</DialogTitle>
            </DialogHeader>
            {loading ? <Loader2 className="animate-spin mx-auto" /> : (
                <div className="max-h-[60vh] overflow-y-auto space-y-2 p-1">{allItems.map(i => (
                    <div key={i.id} className="flex items-center justify-between bg-black/20 p-2 rounded-md">
                        <span>{i.name}</span>
                        <Button size="sm" onClick={() => handleLink(i.id)}>{linkedItems.includes(i.id) ? 'Unlink' : 'Link'}</Button>
                    </div>
                ))}</div>
            )}
        </DialogContent>
    );
};

const DiseaseManager = () => {
    const [diseases, setDiseases] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [relations, setRelations] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [showDiseaseForm, setShowDiseaseForm] = useState(false);
    const [showMedicineManager, setShowMedicineManager] = useState(false);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const loadData = useCallback(async () => {
        setLoading(true);
        const { data: disData, error: disErr } = await supabase.from('diseases').select('*').order('name');
        const { data: medData, error: medErr } = await supabase.from('medicines').select('*, rarity:rarities(name, color)').order('name');
        const { data: relData, error: relErr } = await supabase.from('medicine_treats_disease').select('*');

        if (disErr || medErr || relErr) toast({ title: "Error", description: "Could not load data.", variant: "destructive" });
        else { setDiseases(disData || []); setMedicines(medData || []); setRelations(relData || []); }
        setLoading(false);
    }, [toast]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleSaveDisease = async (item) => {
        const { id, ...itemData } = item;
        const { error } = id ? await supabase.from('diseases').update(itemData).eq('id', id) : await supabase.from('diseases').insert(itemData);
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else { toast({ title: "Saved!", description: "Disease saved." }); setShowDiseaseForm(false); setEditingItem(null); loadData(); }
    };
    
    const handleDelete = async (item, type) => {
        if (item.image_path) await supabase.storage.from('Items').remove([item.image_path]);

        if (type === 'disease') {
            await supabase.from('medicine_treats_disease').delete().eq('disease_id', item.id);
            const { error } = await supabase.from('diseases').delete().eq('id', item.id);
            if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
            else { toast({ title: "Deleted!", description: "Disease deleted." }); loadData(); }
        } else { // medicine
             await supabase.from('medicine_treats_disease').delete().eq('medicine_id', item.id);
             const { error } = await supabase.from('medicines').delete().eq('id', item.id);
             if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
             else { toast({ title: "Deleted!", description: "Medicine deleted." }); loadData(); }
        }
    };
    
    if (showMedicineManager) {
        return (
            <div>
                 <Button onClick={() => {setShowMedicineManager(false); loadData();}} className="mb-4">Back to Diseases/Medicines</Button>
                 <MedicineManager onSaveCallback={loadData} />
            </div>
        )
    }

    return (
        <Dialog>
            <div className="space-y-8">
                {/* Diseases Box */}
                <div className="bg-white/5 p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold text-white">Diseases</h2><Button onClick={() => { setEditingItem(null); setShowDiseaseForm(true); }} className="gap-2"><Plus /> New Disease</Button></div>
                    {showDiseaseForm && <DiseaseForm item={editingItem} onSave={handleSaveDisease} onCancel={() => setShowDiseaseForm(false)} />}
                    {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : <div className="space-y-4">{diseases.map(item => {
                        const treatsCount = relations.filter(r => r.disease_id === item.id).length;
                        return (
                            <div key={item.id} className="bg-black/20 p-3 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        {item.image_url && <img src={item.image_url} alt={item.name} className="h-10 w-10 object-cover rounded-md" />}
                                        <span className="font-bold text-white flex items-center gap-2">{item.name} {item.is_lethal && <Skull className="text-red-500 h-5 w-5" />}</span>
                                        <span className="text-xs text-gray-400">({treatsCount} {treatsCount === 1 ? 'treatment' : 'treatments'})</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <DialogTrigger asChild><Button variant="outline" size="icon"><Link /></Button></DialogTrigger>
                                        <Button onClick={() => { setEditingItem(item); setShowDiseaseForm(true);}} variant="outline" size="icon"><Edit /></Button>
                                        <Button onClick={() => handleDelete(item, 'disease')} variant="destructive" size="icon"><Trash2 /></Button>
                                    </div>
                                </div>
                                <DialogContent className="bg-slate-900 border-slate-700 text-white"><LinkerContent item={item} onLinkChange={loadData} /></DialogContent>
                            </div>
                        )})}
                    </div>}
                </div>

                {/* Medicines Box */}
                 <div className="bg-white/5 p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold text-white">Medicines</h2><Button onClick={() => setShowMedicineManager(true)} className="gap-2"><Plus /> New/Edit Medicine</Button></div>
                    {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : <div className="space-y-4">{medicines.map(item => {
                        const treatsCount = relations.filter(r => r.medicine_id === item.id).length;
                        return (
                            <div key={item.id} className="bg-black/20 p-3 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        {item.image_url && <img src={item.image_url} alt={item.name} className="h-10 w-10 object-cover rounded-md" />}
                                        <div>
                                            <span className="font-bold text-white">{item.name}</span>
                                            {item.rarity && <span className="text-xs ml-2 px-2 py-1 rounded" style={{backgroundColor: item.rarity.color || '#888'}}>{item.rarity.name}</span>}
                                        </div>
                                         <span className="text-xs text-gray-400">(treats {treatsCount} {treatsCount === 1 ? 'disease' : 'diseases'})</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <DialogTrigger asChild><Button variant="outline" size="icon"><Link /></Button></DialogTrigger>
                                        <Button onClick={() => handleDelete(item, 'medicine')} variant="destructive" size="icon"><Trash2 /></Button>
                                    </div>
                                </div>
                                <DialogContent className="bg-slate-900 border-slate-700 text-white"><LinkerContent item={item} onLinkChange={loadData} /></DialogContent>
                            </div>
                        )})}
                    </div>}
                </div>
            </div>
        </Dialog>
    );
};

export default DiseaseManager;