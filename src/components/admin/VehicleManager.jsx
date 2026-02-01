import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/mySupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Gauge, Users, Fuel, HeartPulse, Sliders, Image as ImageIcon, Wrench, Edit, Trash2, Tag, Info, Link2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormContainer, FormSection, FormInput, FormSelect, FormTextarea, FormFileUpload } from './AdminUIComponents';
import { AdminItemCard } from './AdminItemCard';
import CustomStatManager from './CustomStatManager';

const VehicleMechanicsManager = ({ vehicleId, vehicleName, onClose }) => {
    const [components, setComponents] = useState([]);
    const [linkedComponents, setLinkedComponents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        const { data: componentsData } = await supabase.from('vehicle_components').select('*').order('name');
        const { data: linkedData } = await supabase.from('vehicle_required_components').select('*').eq('vehicle_id', vehicleId);
        setComponents(componentsData || []);
        setLinkedComponents(linkedData || []);
        setLoading(false);
    }, [vehicleId]);

    useEffect(() => { if (vehicleId) fetchData(); }, [vehicleId, fetchData]);

    const handleLinkToggle = async (componentId) => {
        const isLinked = linkedComponents.some(lc => lc.component_id === componentId);
        if (isLinked) {
            const { error } = await supabase.from('vehicle_required_components').delete().match({ vehicle_id: vehicleId, component_id: componentId });
            if (error) toast({ title: "Link Corrupted", description: error.message, variant: "destructive" });
            else setLinkedComponents(prev => prev.filter(lc => lc.component_id !== componentId));
        } else {
            const { data, error } = await supabase.from('vehicle_required_components').insert({ vehicle_id: vehicleId, component_id: componentId, quantity: 1 }).select().single();
            if (error) toast({ title: "Synch Error", description: error.message, variant: "destructive" });
            else setLinkedComponents(prev => [...prev, data]);
        }
    };

    const handleQuantityChange = async (componentId, newQuantity) => {
        const quantity = parseInt(newQuantity, 10);
        if (isNaN(quantity) || quantity < 1) return;
        const { error } = await supabase.from('vehicle_required_components').update({ quantity }).match({ vehicle_id: vehicleId, component_id: componentId });
        if (error) toast({ title: "Param Error", description: error.message, variant: "destructive" });
        else setLinkedComponents(prev => prev.map(lc => lc.component_id === componentId ? { ...lc, quantity } : lc));
    };

    return (
        <DialogContent className="bg-[#0a0a0c] border-white/10 text-white max-w-4xl rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] p-0">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            <DialogHeader className="p-10 border-b border-white/5 relative z-10 bg-white/[0.02]">
                <div className="flex items-center gap-3 mb-2">
                    <Wrench className="w-4 h-4 text-red-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 font-mono">System Hardware Configuration</span>
                </div>
                <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Diagnostic: {vehicleName}</DialogTitle>
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] mt-2">Associate critical mechanical components and required subsystems</p>
            </DialogHeader>

            <div className="p-10 relative z-10">
                {loading ? (
                    <div className="flex justify-center p-20">
                        <Loader2 className="animate-spin w-16 h-16 text-red-500" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[55vh] overflow-y-auto pr-6 custom-scrollbar">
                        {components.map(component => {
                            const linked = linkedComponents.find(lc => lc.component_id === component.id);
                            return (
                                <div key={component.id} className={`group relative flex items-center justify-between p-5 rounded-[1.5rem] border transition-all duration-500 ${linked ? 'bg-red-500/[0.03] border-red-500/20' : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                    }`}>
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-2xl bg-black/60 border border-white/5 p-3 flex items-center justify-center shrink-0">
                                            {component.image_url ? (
                                                <img src={component.image_url} alt="" className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <Wrench className="text-gray-800 h-6 w-6" />
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className={`text-xs font-black uppercase tracking-wide truncate transition-colors ${linked ? 'text-red-500' : 'text-gray-300'}`}>
                                                {component.name}
                                            </span>
                                            <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest mt-1">MODULE v2.1</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {linked && (
                                            <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
                                                <span className="text-[7px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1">Units</span>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="w-12 h-8 bg-black/60 border border-white/10 rounded-lg text-center text-[10px] font-black text-white focus:border-red-500/50 focus:outline-none transition-all font-mono"
                                                    value={linked.quantity}
                                                    onChange={(e) => handleQuantityChange(component.id, e.target.value)}
                                                />
                                            </div>
                                        )}
                                        <Button
                                            onClick={() => handleLinkToggle(component.id)}
                                            variant="ghost"
                                            className={`h-10 px-5 rounded-xl font-black uppercase tracking-[0.15em] text-[8px] transition-all ${linked
                                                ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:bg-red-500'
                                                : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10'
                                                }`}
                                        >
                                            {linked ? 'Sync' : 'Init'}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DialogContent>
    );
};

const VehicleForm = ({ item, onSave, onCancel, subcategories }) => {
    const [formData, setFormData] = useState({
        name: '', description: '', subcategory_id: null, capacity: '', use_case: '',
        image_url: '', image_path: '', inventory_slots: 0, speed: 0,
        driving_handling: 0, occupants: 0, fuel_capacity: 0, health: 100, stats: {}
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

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `vehicles/${fileName}`;
        const { error } = await supabase.storage.from('Items').upload(filePath, file);
        if (error) toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
        else {
            const { data } = supabase.storage.from('Items').getPublicUrl(filePath);
            setFormData({ ...formData, image_url: data.publicUrl, image_path: filePath });
        }
        setUploading(false);
    };

    return (
        <FormContainer
            title={item?.id ? `Recalibrating System: ${formData.name}` : 'Initializing New Vehicle Framework'}
            onSave={() => onSave(formData)}
            onCancel={onCancel}
            isSaving={uploading}
        >
            <FormSection title="Modular Identity" icon={Info}>
                <FormInput
                    label="System Nomenclature"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Vehicle designation..."
                />
                <FormSelect
                    label="Chassis Classification"
                    name="subcategory_id"
                    value={formData.subcategory_id || ''}
                    onChange={handleChange}
                >
                    <option value="">Select Subcategory</option>
                    {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </FormSelect>
                <div className="grid grid-cols-2 gap-4">
                    <FormInput
                        label="Logistics Capacity"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleChange}
                        placeholder="e.g. 2000kg"
                    />
                    <FormInput
                        label="Operational Role"
                        name="use_case"
                        value={formData.use_case}
                        onChange={handleChange}
                        placeholder="e.g. Transport"
                    />
                </div>
                <FormFileUpload
                    label="Neural Visual Asset"
                    onChange={handleImageUpload}
                    previewUrl={formData.image_url}
                    fileName={formData.image_path?.split('/').pop()}
                    icon={ImageIcon}
                />
            </FormSection>

            <FormSection title="Performance Parameters" icon={Sliders}>
                <FormInput
                    label="Cargo Grid (Slots)"
                    name="inventory_slots"
                    type="number"
                    value={formData.inventory_slots || 0}
                    onChange={handleChange}
                />
                <FormInput
                    label="Terminal Velocity (km/h)"
                    name="speed"
                    type="number"
                    value={formData.speed || 0}
                    onChange={handleChange}
                />
                <FormInput
                    label="Handling Coefficient"
                    name="driving_handling"
                    type="number"
                    value={formData.driving_handling || 0}
                    onChange={handleChange}
                />
                <FormInput
                    label="Occupancy Modules"
                    name="occupants"
                    type="number"
                    value={formData.occupants || 0}
                    onChange={handleChange}
                />
                <FormInput
                    label="Fuel Reservoir (L)"
                    name="fuel_capacity"
                    type="number"
                    value={formData.fuel_capacity || 0}
                    onChange={handleChange}
                />
                <FormInput
                    label="Structural Integrity"
                    name="health"
                    type="number"
                    value={formData.health || 0}
                    onChange={handleChange}
                />
            </FormSection>

            <FormSection title="Tactical Narrative" icon={Tag} columns={1}>
                <FormTextarea
                    label="Deployment Logs"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter system technical specifications..."
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

const VehicleManager = ({ sharedMetadata }) => {
    const [vehicles, setVehicles] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subcategories, setSubcategories] = useState([]);
    const [managingMechanicsFor, setManagingMechanicsFor] = useState(null);
    const { toast } = useToast();

    const fetchVehicles = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('vehicles').select('*, subcategory:wiki_subcategories(name)').order('name');
        if (error) toast({ title: "Fetch Aborted", description: error.message, variant: "destructive" });
        else setVehicles(data || []);

        if (sharedMetadata?.categories?.length && sharedMetadata?.subcategories?.length) {
            const cat = sharedMetadata.categories.find(c => c.name === 'Vehicles');
            if (cat) {
                const subs = sharedMetadata.subcategories.filter(s => s.category_id === cat.id);
                setSubcategories(subs);
            }
        }
        setLoading(false);
    }, [toast, sharedMetadata]);

    useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

    const handleSave = async (formData) => {
        const { id, subcategory, ...data } = formData;
        const { error } = id
            ? await supabase.from('vehicles').update(data).eq('id', id)
            : await supabase.from('vehicles').insert([data]);

        if (error) toast({ title: "Write Error", description: error.message, variant: "destructive" });
        else {
            toast({ title: "Protocol Saved", description: "Vehicle system has been synchronized." });
            setEditingItem(null);
            fetchVehicles();
        }
    };

    const handleDelete = async (item) => {
        if (!confirm(`Purge vehicle system: ${item.name}?`)) return;
        await supabase.from('vehicle_required_components').delete().eq('vehicle_id', item.id);
        const { error } = await supabase.from('vehicles').delete().eq('id', item.id);
        if (error) toast({ title: "Purge Failed", description: error.message, variant: "destructive" });
        else { toast({ title: "System Deleted", description: "Vehicle record expunged." }); fetchVehicles(); }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center text-white">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-3">
                        <Gauge className="text-red-600" />
                        Vehicle Fleet Logistics
                    </h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Manage motorized transport and mechanical requirements</p>
                </div>
                <Button
                    onClick={() => setEditingItem({})}
                    className="bg-red-600 hover:bg-red-500 rounded-xl px-6 h-10 font-bold uppercase tracking-widest text-[10px]"
                >
                    <Plus className="w-4 h-4 mr-2" /> Initialize Chassis
                </Button>
            </div>

            {editingItem && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <VehicleForm
                        item={editingItem}
                        onSave={handleSave}
                        onCancel={() => setEditingItem(null)}
                        subcategories={subcategories}
                    />
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-red-500 h-12 w-12" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {vehicles.map((item, idx) => (
                        <AdminItemCard
                            key={item.id}
                            index={idx}
                            item={item}
                            type="vehicle"
                            onEdit={setEditingItem}
                            onDelete={handleDelete}
                            onLink={setManagingMechanicsFor}
                        />
                    ))}
                </div>
            )}

            <Dialog open={!!managingMechanicsFor} onOpenChange={(open) => !open && setManagingMechanicsFor(null)}>
                {managingMechanicsFor && (
                    <VehicleMechanicsManager
                        vehicleId={managingMechanicsFor.id}
                        vehicleName={managingMechanicsFor.name}
                    />
                )}
            </Dialog>
        </div>
    );
};

export default VehicleManager;
