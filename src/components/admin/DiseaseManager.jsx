import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Loader2, Link as LinkIcon, Skull, Upload, Info, Tag, Image as ImageIcon, CheckCircle, XCircle, Activity, Crosshair } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/mySupabaseClient';
import { Checkbox } from "@/components/ui/checkbox";
import MedicineManager from './MedicineManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormContainer, FormSection, FormInput, FormTextarea, FormFileUpload } from './AdminUIComponents';

const DiseaseForm = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ name: '', description: '', is_lethal: false, image_url: '', image_path: '' });
    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();

    useEffect(() => { if (item) setFormData({ ...formData, ...item }); }, [item]);

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

    return (
        <FormContainer
            title={item?.id ? `Analyzing Pathogen: ${formData.name}` : 'Documenting New Biothreat'}
            onSave={() => onSave(formData)}
            onCancel={onCancel}
            isSaving={uploading}
        >
            <FormSection title="Pathogen Intelligence" icon={Info}>
                <FormInput
                    label="Threat Designation"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <div className="flex items-center gap-4 py-2">
                    <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/10 px-4 py-3 rounded-xl flex-grow">
                        <Checkbox
                            id="is_lethal"
                            checked={formData.is_lethal}
                            onCheckedChange={c => setFormData({ ...formData, is_lethal: c })}
                            className="border-red-500/50 data-[state=checked]:bg-red-500"
                        />
                        <label htmlFor="is_lethal" className="text-[10px] font-black uppercase tracking-widest text-red-400 cursor-pointer">Lethal Potential Detected</label>
                    </div>
                </div>
                <FormFileUpload
                    label="Visual Identification"
                    onChange={handleFileChange}
                    previewUrl={formData.image_url}
                    fileName={formData.image_path?.split('/').pop()}
                    icon={ImageIcon}
                />
            </FormSection>
            <FormSection title="Diagnostic Profile" icon={Tag} columns={1}>
                <FormTextarea
                    label="Pathogen Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Document symptoms and infection vectors..."
                />
            </FormSection>
        </FormContainer>
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
            } else {
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
                if (onLinkChange) onLinkChange();
            }
            else toast({ title: "Protocol Refused", description: error.message, variant: "destructive" });
        } else {
            const { error } = await supabase.from('medicine_treats_disease').insert(linkData);
            if (!error) {
                setLinkedItems(prev => [...prev, targetId]);
                if (onLinkChange) onLinkChange();
            }
            else toast({ title: "Integration Failed", description: error.message, variant: "destructive" });
        }
    };

    return (
        <DialogContent className="bg-[#0a0a0c] border-white/10 text-white max-w-xl rounded-[2rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.05),transparent)] pointer-events-none" />
            <DialogHeader className="p-8 border-b border-white/5">
                <div className="flex items-center gap-3 mb-1">
                    <Crosshair className="w-4 h-4 text-red-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Treat-Protocol Mapping</span>
                </div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Sync: {item.name}</DialogTitle>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">Linking to {isDisease ? 'Counter-Pharmaceuticals' : 'Target Pathogens'}</p>
            </DialogHeader>
            <div className="p-8">
                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="animate-spin w-10 h-10 text-red-500" />
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar">
                        {allItems.map(i => {
                            const isSelected = linkedItems.includes(i.id);
                            return (
                                <div key={i.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${isSelected ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                                    }`}>
                                    <span className={`text-[11px] font-bold uppercase tracking-wider ${isSelected ? 'text-emerald-400' : 'text-gray-400'}`}>{i.name}</span>
                                    <Button
                                        size="sm"
                                        onClick={() => handleLink(i.id)}
                                        className={`h-9 px-6 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all ${isSelected ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                                            }`}
                                    >
                                        {isSelected ? <><CheckCircle className="w-3.5 h-3.5 mr-2" /> Synced</> : 'Link Protocol'}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DialogContent>
    );
};

const DiseaseManager = ({ sharedMetadata }) => {
    const [diseases, setDiseases] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [relations, setRelations] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [editingMed, setEditingMed] = useState(null);
    const [showDiseaseForm, setShowDiseaseForm] = useState(false);
    const [showMedicineManager, setShowMedicineManager] = useState(false);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const loadData = useCallback(async () => {
        setLoading(true);
        const { data: disData, error: disErr } = await supabase.from('diseases').select('*').order('name');
        const { data: medData, error: medErr } = await supabase.from('medicines').select('*, rarity:rarities(name, color)').order('name');
        const { data: relData, error: relErr } = await supabase.from('medicine_treats_disease').select('*');

        if (disErr || medErr || relErr) toast({ title: "Error", description: "Database connectivity interrupted.", variant: "destructive" });
        else { setDiseases(disData || []); setMedicines(medData || []); setRelations(relData || []); }
        setLoading(false);
    }, [toast]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleSaveDisease = async (item) => {
        const { id, ...itemData } = item;
        const { error } = id ? await supabase.from('diseases').update(itemData).eq('id', id) : await supabase.from('diseases').insert(itemData);
        if (error) toast({ title: "Protocol Rejected", description: error.message, variant: "destructive" });
        else { toast({ title: "Record Synced", description: "Pathogen data updated." }); setShowDiseaseForm(false); setEditingItem(null); loadData(); }
    };

    const handleDelete = async (item, type) => {
        if (!confirm(`Confirm purging of ${type}: ${item.name}?`)) return;
        if (item.image_path) await supabase.storage.from('Items').remove([item.image_path]);

        if (type === 'disease') {
            await supabase.from('medicine_treats_disease').delete().eq('disease_id', item.id);
            const { error } = await supabase.from('diseases').delete().eq('id', item.id);
            if (error) toast({ title: "Purge Failed", description: error.message, variant: "destructive" });
            else { toast({ title: "Expunged", description: "Pathogen record removed." }); loadData(); }
        } else {
            await supabase.from('medicine_treats_disease').delete().eq('medicine_id', item.id);
            const { error } = await supabase.from('medicines').delete().eq('id', item.id);
            if (error) toast({ title: "Purge Failed", description: error.message, variant: "destructive" });
            else { toast({ title: "Expunged", description: "Medical item removed." }); loadData(); }
        }
    };

    if (showMedicineManager) {
        return (
            <div className="animate-in fade-in duration-500">
                <Button
                    onClick={() => { setShowMedicineManager(false); loadData(); }}
                    variant="ghost"
                    className="mb-8 text-gray-500 hover:text-white font-bold uppercase tracking-widest text-[10px]"
                >
                    <Activity className="w-4 h-4 mr-2" /> Back to Biothreat Dashboard
                </Button>
                <MedicineManager onSaveCallback={loadData} sharedMetadata={sharedMetadata} initialItem={editingMed} />
            </div>
        )
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center text-white">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-3">
                        <Skull className="text-red-600" />
                        Bio-Threat Surveillance
                    </h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Monitor pathogens and pharmaceutical counter-measures</p>
                </div>
            </div>

            <Dialog>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                    {/* Diseases Section */}
                    <div className="bg-[#0a0a0c] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                                <Activity className="text-red-500 h-4 w-4" />
                                Active Pathogens
                            </h3>
                            <Button
                                onClick={() => { setEditingItem(null); setShowDiseaseForm(true); }}
                                className="h-9 px-5 bg-red-600 hover:bg-red-500 rounded-xl font-bold uppercase tracking-widest text-[9px]"
                            >
                                <Plus className="w-3.5 h-3.5 mr-2" /> New Threat
                            </Button>
                        </div>

                        <div className="p-8 flex-grow">
                            {showDiseaseForm && (
                                <div className="mb-8 animate-in fade-in slide-in-from-top-4">
                                    <DiseaseForm item={editingItem} onSave={handleSaveDisease} onCancel={() => setShowDiseaseForm(false)} />
                                </div>
                            )}

                            {loading ? (
                                <div className="flex justify-center p-12">
                                    <Loader2 className="animate-spin h-10 w-10 text-red-500" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {diseases.map(item => {
                                        const treatsCount = relations.filter(r => r.disease_id === item.id).length;
                                        return (
                                            <div key={item.id} className="group relative bg-white/[0.02] border border-white/5 hover:border-red-500/30 p-5 rounded-2xl transition-all duration-300">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/5 p-2 flex items-center justify-center shrink-0">
                                                            {item.image_url ? (
                                                                <img src={item.image_url} alt="" className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                                                            ) : (
                                                                <Skull className="text-gray-700 h-5 w-5" />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-white uppercase tracking-wide group-hover:text-red-500 transition-colors leading-none">{item.name}</span>
                                                                {item.is_lethal && <div className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[7px] font-black text-red-500 uppercase tracking-widest animate-pulse">Lethal</div>}
                                                            </div>
                                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.1em] mt-1.5">{treatsCount} ACTIVE COUNTER-MEASURES</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <DialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10"><LinkIcon size={16} /></Button>
                                                        </DialogTrigger>
                                                        <Button onClick={() => { setEditingItem(item); setShowDiseaseForm(true); }} variant="ghost" size="icon" className="h-9 w-9 text-gray-500 hover:text-white"><Edit size={16} /></Button>
                                                        <Button onClick={() => handleDelete(item, 'disease')} variant="ghost" size="icon" className="h-9 w-9 text-gray-500 hover:text-red-500"><Trash2 size={16} /></Button>
                                                    </div>
                                                </div>
                                                <LinkerContent item={item} onLinkChange={loadData} />
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Medicines Section */}
                    <div className="bg-[#0a0a0c] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                                <Activity className="text-emerald-500 h-4 w-4" />
                                Effective Antidotes
                            </h3>
                            <Button
                                onClick={() => setShowMedicineManager(true)}
                                className="h-9 px-5 bg-emerald-600 hover:bg-emerald-500 border-none rounded-xl font-bold uppercase tracking-widest text-[9px]"
                            >
                                <Plus className="w-3.5 h-3.5 mr-2" /> Central Dispensary
                            </Button>
                        </div>

                        <div className="p-8 flex-grow">
                            {loading ? (
                                <div className="flex justify-center p-12">
                                    <Loader2 className="animate-spin h-10 w-10 text-emerald-500" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {medicines.map(item => {
                                        const treatsCount = relations.filter(r => r.medicine_id === item.id).length;
                                        return (
                                            <div key={item.id} className="group relative bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 p-5 rounded-2xl transition-all duration-300">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/5 p-2 flex items-center justify-center shrink-0">
                                                            {item.image_url ? (
                                                                <img src={item.image_url} alt="" className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                                                            ) : (
                                                                <Activity className="text-gray-700 h-5 w-5" />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-white uppercase tracking-wide group-hover:text-emerald-500 transition-colors leading-none">{item.name}</span>
                                                                {item.rarity && (
                                                                    <div className="px-2 py-0.5 rounded bg-black/40 border border-white/5 flex items-center gap-1.5 backdrop-blur-md">
                                                                        <div className="w-1 h-1 rounded-full bg-current" style={{ color: item.rarity.color }} />
                                                                        <span className="text-[7px] font-black uppercase tracking-widest text-gray-400">{item.rarity.name}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.1em] mt-1.5">TREAETS {treatsCount} TARGET PATHOGENS</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button 
                                                            onClick={() => { setEditingMed(item); setShowMedicineManager(true); }} 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-9 w-9 text-gray-500 hover:text-emerald-500"
                                                        >
                                                            <Edit size={16} />
                                                        </Button>
                                                        <DialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10"><LinkIcon size={16} /></Button>
                                                        </DialogTrigger>
                                                        <Button onClick={() => handleDelete(item, 'medicine')} variant="ghost" size="icon" className="h-9 w-9 text-gray-500 hover:text-red-500"><Trash2 size={16} /></Button>
                                                    </div>
                                                </div>
                                                <LinkerContent item={item} onLinkChange={loadData} />
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default DiseaseManager;
