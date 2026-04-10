import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/mySupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Users, MapPin, Image as ImageIcon, Briefcase, ShoppingBag, Save, X, Trash2, Edit } from 'lucide-react';
import { FormContainer, FormSection, FormInput, FormFileUpload } from './AdminUIComponents';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const ManageMissionsDialog = ({ npc, open, onOpenChange, onRefresh }) => {
    const { toast } = useToast();
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMission, setNewMission] = useState({ title: '', difficulty: 'Medium', content_html: '' });

    const fetchMissions = useCallback(async () => {
        if (!npc?.id) return;
        const { data, error } = await supabase.from('missions').select('*').eq('npc_id', npc.id);
        if (error) console.error(error);
        else setMissions(data || []);
    }, [npc]);

    useEffect(() => { if (open) fetchMissions(); }, [open, fetchMissions]);

    const handleAddMission = async () => {
        if (!newMission.title) return;
        setLoading(true);
        const { error } = await supabase.from('missions').insert([{ npc_id: npc.id, ...newMission }]);
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else {
            toast({ title: "Success", description: "Mission added." });
            setNewMission({ title: '', difficulty: 'Medium', content_html: '' });
            fetchMissions();
            onRefresh();
        }
        setLoading(false);
    };

    const handleDeleteMission = async (id) => {
        const { error } = await supabase.from('missions').delete().eq('id', id);
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else { fetchMissions(); onRefresh(); }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#0a0a0c] border-white/10 text-white max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold uppercase tracking-wider flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-red-500" />
                        Mission Directives: {npc?.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-grow overflow-y-auto space-y-6 pr-2">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
                        <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest">New Directive</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <FormInput
                                label="Operation Title"
                                value={newMission.title}
                                onChange={(e) => setNewMission({ ...newMission, title: e.target.value })}
                                placeholder="Assignment name..."
                            />
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Threat Level</label>
                                <select
                                    value={newMission.difficulty}
                                    onChange={(e) => setNewMission({ ...newMission, difficulty: e.target.value })}
                                    className="w-full h-10 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Directive Details (HTML Support)</label>
                            <textarea
                                value={newMission.content_html}
                                onChange={(e) => setNewMission({ ...newMission, content_html: e.target.value })}
                                className="w-full h-24 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                                placeholder="Detail the operation requirements..."
                            />
                        </div>
                        <Button
                            onClick={handleAddMission}
                            disabled={loading || !newMission.title}
                            className="w-full bg-red-600 hover:bg-red-500 rounded-lg font-bold uppercase tracking-widest text-[10px]"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                            Deploy Directive
                        </Button>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Active Protocols ({missions.length})</h4>
                        {missions.map(m => (
                            <div key={m.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                                <div>
                                    <div className="font-bold text-sm text-white flex items-center gap-2">
                                        {m.title}
                                        <span className={`text-[8px] px-1.5 py-0.5 rounded border ${m.difficulty === 'Hard' ? 'border-red-500/50 text-red-400 bg-red-500/10' : m.difficulty === 'Medium' ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' : 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'}`}>
                                            {m.difficulty}
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-gray-500 mt-1 line-clamp-1">{m.content_html?.replace(/<[^>]*>/g, '')}</div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteMission(m.id)}
                                    className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const ManageInventoryDialog = ({ npc, open, onOpenChange, onRefresh }) => {
    const { toast } = useToast();
    const [inventory, setInventory] = useState([]);
    const [allItems, setAllItems] = useState({ weapons: [], gear: [], consumables: [], keys: [], toolbelts: [], medicines: [] });
    const [loading, setLoading] = useState(false);

    const fetchAllData = useCallback(async () => {
        if (!npc?.id) return;
        setLoading(true);
        const [weapons, gear, consumables, keys, toolbelts, medicines, inv] = await Promise.all([
            supabase.from('weapons').select('id, name, image_url'),
            supabase.from('gear').select('id, name, image_url'),
            supabase.from('consumables').select('id, name, image_url'),
            supabase.from('keys').select('id, name, image_url'),
            supabase.from('toolbelts').select('id, name, image_url'),
            supabase.from('medicines').select('id, name, image_url'),
            supabase.from('npc_inventory').select('*').eq('npc_id', npc.id)
        ]);
        setAllItems({
            weapons: weapons.data || [],
            gear: gear.data || [],
            consumables: consumables.data || [],
            keys: keys.data || [],
            toolbelts: toolbelts.data || [],
            medicines: medicines.data || [],
        });
        setInventory(inv.data || []);
        setLoading(false);
    }, [npc]);

    useEffect(() => { if (open) fetchAllData(); }, [open, fetchAllData]);

    const handleAddItem = async (itemType, itemId) => {
        if (inventory.some(i => i.item_type === itemType && i.item_id === itemId)) return;
        const { error } = await supabase.from('npc_inventory').insert([{ npc_id: npc.id, item_type: itemType, item_id: itemId }]);
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else fetchAllData();
    };

    const handleRemoveItem = async (type, id) => {
        const { error } = await supabase.from('npc_inventory').delete().match({ npc_id: npc.id, item_type: type, item_id: id });
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else fetchAllData();
    };

    const getItemDetails = (type, id) => {
        return (allItems[type] || []).find(i => i.id === id);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#0a0a0c] border-white/10 text-white max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold uppercase tracking-wider flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-red-500" />
                        Logistics & Trade: {npc?.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden mt-4">
                    <div className="space-y-4 overflow-y-auto pr-2">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Asset Catalogs</h4>
                        {Object.entries(allItems).map(([type, items]) => (
                            <div key={type} className="space-y-2">
                                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter ml-1">{type}</label>
                                <select
                                    onChange={(e) => { if (e.target.value) handleAddItem(type, e.target.value); e.target.value = ''; }}
                                    className="w-full h-8 bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                                >
                                    <option value="">Select {type.slice(0, -1)}...</option>
                                    {items.map(item => (
                                        <option key={item.id} value={item.id}>{item.name}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4 overflow-y-auto pr-2 border-l border-white/10 pl-4">
                        <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1">Approved Trade Assets ({inventory.length})</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {inventory.map((inv, idx) => {
                                const details = getItemDetails(inv.item_type, inv.item_id);
                                return (
                                    <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-2 relative group flex items-center gap-3">
                                        <div className="w-10 h-10 bg-black/40 rounded-lg border border-white/5 flex items-center justify-center shrink-0">
                                            {details?.image_url ? (
                                                <img src={details.image_url} alt="" className="w-8 h-8 object-contain" />
                                            ) : (
                                                <ImageIcon className="w-4 h-4 text-gray-600" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[10px] font-bold text-white truncate">{details?.name || 'Unknown Asset'}</div>
                                            <div className="text-[8px] text-gray-500 uppercase">{inv.item_type.slice(0, -1)}</div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveItem(inv.item_type, inv.item_id)}
                                            className="absolute top-1 right-1 h-5 w-5 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-0"
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const NpcForm = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ name: '', location: '', image_url: '', image_path: '', lat: null, lng: null });
    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (item) setFormData(item);
    }, [item]);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setUploading(true);
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `npcs/${fileName}`;
        const { error } = await supabase.storage.from('Items').upload(filePath, file);
        if (error) { toast({ title: "Upload Error", description: error.message, variant: "destructive" }); }
        else {
            const { data: { publicUrl } } = supabase.storage.from('Items').getPublicUrl(filePath);
            setFormData(prev => ({ ...prev, image_url: publicUrl, image_path: filePath }));
        }
        setUploading(false);
    };

    return (
        <FormContainer
            title={item?.id ? `Modifying Profile: ${item.name}` : 'Enlisting New Operative'}
            onSave={() => onSave(formData)}
            onCancel={onCancel}
            isSaving={uploading}
        >
            <FormSection title="Operative Identification" icon={Users}>
                <FormInput
                    label="Codename"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Subject Designation"
                />
                <FormInput
                    label="Current Deployment Zone"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Coordinate sector..."
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormInput
                        label="Latitude"
                        type="number"
                        step="any"
                        value={formData.lat || ''}
                        onChange={(e) => setFormData({ ...formData, lat: e.target.value ? parseFloat(e.target.value) : null })}
                        placeholder="0.0000"
                    />
                    <FormInput
                        label="Longitude"
                        type="number"
                        step="any"
                        value={formData.lng || ''}
                        onChange={(e) => setFormData({ ...formData, lng: e.target.value ? parseFloat(e.target.value) : null })}
                        placeholder="0.0000"
                    />
                </div>
                <FormFileUpload
                    label="Visual Profile Data"
                    accept="image/*"
                    onChange={handleFileChange}
                    previewUrl={formData.image_url}
                    fileName={formData.image_path?.split('/').pop()}
                    icon={ImageIcon}
                />
            </FormSection>
        </FormContainer>
    );
};

const NpcManager = () => {
    const [npcs, setNpcs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingNpc, setEditingNpc] = useState(null);
    const [missionNpc, setMissionNpc] = useState(null);
    const [inventoryNpc, setInventoryNpc] = useState(null);
    const { toast } = useToast();

    const fetchNpcs = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('npcs').select('*').order('name');
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else setNpcs(data || []);
        setLoading(false);
    }, [toast]);

    useEffect(() => { fetchNpcs(); }, [fetchNpcs]);

    const handleSave = async (formData) => {
        const { id, ...data } = formData;
        const { error } = id ? await supabase.from('npcs').update(data).eq('id', id) : await supabase.from('npcs').insert([data]);
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else {
            toast({ title: "Success", description: "Operative profile updated." });
            setShowForm(false);
            setEditingNpc(null);
            fetchNpcs();
        }
    };

    const handleDelete = async (npc) => {
        if (!confirm(`Confirm decommissioning of ${npc.name}? All mission data will be lost.`)) return;
        if (npc.image_path) await supabase.storage.from('Items').remove([npc.image_path]);
        await supabase.from('missions').delete().eq('npc_id', npc.id);
        await supabase.from('npc_inventory').delete().eq('npc_id', npc.id);
        const { error } = await supabase.from('npcs').delete().eq('id', npc.id);
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else { toast({ title: "Deleted", description: "Subject removed from network." }); fetchNpcs(); }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center text-white">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-3">
                        <Users className="text-red-600" />
                        Network Operatives
                    </h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Manage field contacts and personnel</p>
                </div>
                <Button
                    onClick={() => { setEditingNpc(null); setShowForm(true); }}
                    className="bg-red-600 hover:bg-red-500 rounded-xl px-6 h-10 font-bold uppercase tracking-widest text-[10px]"
                >
                    <Plus className="w-4 h-4 mr-2" /> Enlist New Subject
                </Button>
            </div>

            {showForm && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <NpcForm
                        item={editingNpc}
                        onSave={handleSave}
                        onCancel={() => { setShowForm(false); setEditingNpc(null); }}
                    />
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-red-500 h-12 w-12" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {npcs.map((npc) => (
                        <div key={npc.id} className="group relative bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden hover:border-red-500/30 transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent z-10 opacity-80" />
                            <div className="h-48 relative overflow-hidden bg-black/40">
                                {npc.image_url ? (
                                    <img src={npc.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center opacity-10">
                                        <Users className="w-16 h-16" />
                                    </div>
                                )}
                            </div>
                            <div className="p-5 relative z-20 -mt-10">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-white tracking-wide group-hover:text-red-500 transition-colors">{npc.name}</h3>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono uppercase">
                                        <MapPin className="w-3 h-3" /> {npc.location || 'Unknown Coordinates'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-6">
                                    <button
                                        onClick={() => setMissionNpc(npc)}
                                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/5 hover:border-red-500/30 hover:bg-white/10 transition-all gap-1"
                                    >
                                        <Briefcase className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                                        <span className="text-[8px] font-bold text-gray-500 uppercase">Directives</span>
                                    </button>
                                    <button
                                        onClick={() => setInventoryNpc(npc)}
                                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/5 hover:border-red-500/30 hover:bg-white/10 transition-all gap-1"
                                    >
                                        <ShoppingBag className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                                        <span className="text-[8px] font-bold text-gray-500 uppercase">Logistics</span>
                                    </button>
                                </div>

                                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-white/5">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => { setEditingNpc(npc); setShowForm(true); }}
                                        className="h-8 w-8 text-gray-500 hover:text-white"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(npc)}
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

            <ManageMissionsDialog npc={missionNpc} open={!!missionNpc} onOpenChange={(open) => !open && setMissionNpc(null)} onRefresh={fetchNpcs} />
            <ManageInventoryDialog npc={inventoryNpc} open={!!inventoryNpc} onOpenChange={(open) => !open && setInventoryNpc(null)} onRefresh={fetchNpcs} />
        </div>
    );
};

export default NpcManager;
