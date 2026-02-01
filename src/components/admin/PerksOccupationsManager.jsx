import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/mySupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Edit, Trash2, Save, X, User, Zap, Star, Shield, Activity, Target, Sliders, Info, Tag, Layers, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { FormContainer, FormSection, FormInput, FormSelect, FormTextarea } from './AdminUIComponents';

const EffectsManager = ({ effects, setEffects, available }) => {
    const addEffect = () => {
        setEffects([...(effects || []), { type: 'skills', id: '', value: 0 }]);
    };

    const removeEffect = (index) => {
        setEffects((effects || []).filter((_, i) => i !== index));
    };

    const updateEffect = (index, field, value) => {
        const newEffects = [...(effects || [])];
        const effect = { ...newEffects[index], [field]: value };
        if (field === 'type') effect.id = '';
        newEffects[index] = effect;
        setEffects(newEffects);
    };

    return (
        <div className="space-y-6 pt-8 border-t border-white/5">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Biological Enhancements / Detriments</span>
                </div>
                <Button
                    onClick={addEffect}
                    type="button"
                    variant="ghost"
                    className="h-8 px-4 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 text-[10px] font-black uppercase tracking-widest rounded-lg"
                >
                    <Plus className="w-3 h-3 mr-2" /> Inject Effect
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {(effects || []).map((effect, index) => (
                    <div key={index} className="group flex flex-col md:flex-row items-center gap-4 bg-black/40 border border-white/5 p-5 rounded-2xl hover:border-amber-500/30 transition-all animate-in fade-in slide-in-from-right-2">
                        <div className="w-full md:w-1/3">
                            <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1.5 block ml-1">Effect Category</label>
                            <select
                                value={effect.type}
                                onChange={e => updateEffect(index, 'type', e.target.value)}
                                className="w-full h-10 bg-[#0f0f12] border border-white/10 rounded-xl px-4 text-xs font-bold text-white focus:outline-none focus:border-amber-500/40"
                            >
                                <option value="skills">Skill Calibration</option>
                                <option value="attributes">Base Attributes</option>
                                <option value="stats">Metabolic Stats</option>
                            </select>
                        </div>
                        <div className="w-full md:flex-grow">
                            <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1.5 block ml-1">Target Internal ID</label>
                            <select
                                value={effect.id}
                                onChange={e => updateEffect(index, 'id', e.target.value)}
                                className="w-full h-10 bg-[#0f0f12] border border-white/10 rounded-xl px-4 text-xs font-bold text-white focus:outline-none focus:border-amber-500/40"
                            >
                                <option value="">Select Target...</option>
                                {(available[effect.type] || []).map(item => (
                                    <option key={item.id} value={item.id}>{item.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-full md:w-32">
                            <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1.5 block ml-1">Magnitude</label>
                            <input
                                type="number"
                                value={effect.value}
                                onChange={e => updateEffect(index, 'value', parseInt(e.target.value) || 0)}
                                className="w-full h-10 bg-[#0f0f12] border border-white/10 rounded-xl px-4 text-center text-xs font-black text-white focus:border-amber-500/40"
                            />
                        </div>
                        <div className="pt-6">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeEffect(index)}
                                className="h-10 w-10 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
                {(!effects || effects.length === 0) && (
                    <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-3xl">
                        <span className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] italic">No neural overrides configured</span>
                    </div>
                )}
            </div>
        </div>
    );
};


const PerksOccupationsManager = () => {
    const [perks, setPerks] = useState([]);
    const [occupations, setOccupations] = useState([]);
    const [skills, setSkills] = useState([]);
    const [attributes, setAttributes] = useState([]);
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [editingType, setEditingType] = useState(null);
    const { toast } = useToast();

    const availableEffects = { skills, attributes, stats };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [perksRes, occRes, skillsRes, attrsRes, statsRes] = await Promise.all([
            supabase.from('perks').select('*').order('name'),
            supabase.from('occupations').select('*').order('name'),
            supabase.from('skills').select('*').order('name'),
            supabase.from('attributes').select('*').order('name'),
            supabase.from('stats').select('*').order('name')
        ]);

        if (perksRes.data) setPerks(perksRes.data);
        if (occRes.data) setOccupations(occRes.data);
        if (skillsRes.data) setSkills(skillsRes.data);
        if (attrsRes.data) setAttributes(attrsRes.data);
        if (statsRes.data) setStats(statsRes.data);
        setLoading(false);
    };

    const handleSave = async (formData) => {
        const table = editingType;
        const { id, ...dataToSave } = formData;

        let error;
        if (id) {
            ({ error } = await supabase.from(table).update(dataToSave).eq('id', id));
        } else {
            ({ error } = await supabase.from(table).insert([dataToSave]));
        }

        if (error) {
            toast({ title: "Write Failed", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Synchronized", description: `${table.slice(0, -1).toUpperCase()} record updated.` });
            setEditingItem(null);
            setEditingType(null);
            fetchData();
        }
    };

    const handleDelete = async (type, id, name) => {
        if (!confirm(`Purge character protocol: ${name}?`)) return;
        const { error } = await supabase.from(type).delete().eq('id', id);
        if (error) toast({ title: "Purge Aborted", description: error.message, variant: "destructive" });
        else { toast({ title: "Expunged", description: "Record removed from character database." }); fetchData(); }
    };

    const handleEditClick = (item, type) => { setEditingItem(item); setEditingType(type); };
    const handleAddClick = (type, defaults) => { setEditingItem(defaults); setEditingType(type); };

    const renderPerkForm = () => (
        <FormContainer
            title={editingItem?.id ? `Calibrating Perk: ${editingItem.name}` : 'Initializing New Biological Perk'}
            onSave={() => handleSave(editingItem)}
            onCancel={() => { setEditingItem(null); setEditingType(null); }}
        >
            <FormSection title="Core Designation" icon={Star}>
                <FormInput
                    label="Trait Title"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    placeholder="Perk designation..."
                />
                <FormInput
                    label="Metabolic Cost (Points)"
                    type="number"
                    value={editingItem.point_cost}
                    onChange={(e) => setEditingItem({ ...editingItem, point_cost: parseInt(e.target.value) || 0 })}
                />
                <div className="flex items-center gap-4 py-2">
                    <div className={`flex items-center gap-3 border px-4 py-3 rounded-xl flex-grow transition-colors ${editingItem.is_negative ? 'bg-red-500/5 border-red-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                        <Checkbox
                            id="is_negative"
                            checked={editingItem.is_negative}
                            onCheckedChange={(checked) => setEditingItem({ ...editingItem, is_negative: checked })}
                        />
                        <label htmlFor="is_negative" className={`text-[10px] font-black uppercase tracking-widest cursor-pointer ${editingItem.is_negative ? 'text-red-400' : 'text-emerald-400'}`}>
                            {editingItem.is_negative ? 'Inhibitor Prototype (Grants Points)' : 'Enhancement Protocol (Consumes Points)'}
                        </label>
                    </div>
                </div>
            </FormSection>
            <FormSection title="Narrative Context" icon={Tag} columns={1}>
                <FormTextarea
                    label="Biological Impact Description"
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    placeholder="Describe effect on field performance..."
                />
            </FormSection>

            <EffectsManager
                effects={editingItem.effects}
                setEffects={(effects) => setEditingItem({ ...editingItem, effects })}
                available={availableEffects}
            />
        </FormContainer>
    );

    const renderOccupationForm = () => (
        <FormContainer
            title={editingItem?.id ? `Analyzing Background: ${editingItem.name}` : 'Documenting New Survival Background'}
            onSave={() => handleSave(editingItem)}
            onCancel={() => { setEditingItem(null); setEditingType(null); }}
        >
            <FormSection title="Historical Identity" icon={User}>
                <FormInput
                    label="Occupation Nomenclature"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    placeholder="Former role..."
                />
                <FormInput
                    label="Asset Allocation (Starting Points)"
                    type="number"
                    value={editingItem.starting_points}
                    onChange={(e) => setEditingItem({ ...editingItem, starting_points: parseInt(e.target.value) || 0 })}
                />
            </FormSection>
            <FormSection title="Historical Context" icon={Tag} columns={1}>
                <FormTextarea
                    label="Background Summary"
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    placeholder="Describe professional history and expertise..."
                />
            </FormSection>

            <EffectsManager
                effects={editingItem.effects}
                setEffects={(effects) => setEditingItem({ ...editingItem, effects })}
                available={availableEffects}
            />
        </FormContainer>
    );

    const renderSimpleForm = () => (
        <FormContainer
            title={editingItem?.id ? `Calibrating ${editingType.slice(0, -1).toUpperCase()}: ${editingItem.name}` : `Defining New Character ${editingType.slice(0, -1).toUpperCase()}`}
            onSave={() => handleSave(editingItem)}
            onCancel={() => { setEditingItem(null); setEditingType(null); }}
        >
            <FormSection title="Unit Specifications" icon={Sliders}>
                <FormInput
                    label="Label"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    placeholder="Designation..."
                />
                {editingType !== 'stats' && (
                    <FormInput
                        label="Operational Ceiling (Max)"
                        type="number"
                        value={editingItem.max_value}
                        onChange={(e) => setEditingItem({ ...editingItem, max_value: parseInt(e.target.value) || 0 })}
                    />
                )}
            </FormSection>
            <FormSection title="Function Definition" icon={Tag} columns={1}>
                <FormTextarea
                    label="Effect Narrative"
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    placeholder="Technical description of this parameter..."
                />
            </FormSection>
        </FormContainer>
    );

    const renderList = (items, type) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {items.map(item => (
                <div key={item.id} className="group relative bg-[#0a0a0c] border border-white/5 rounded-3xl p-6 hover:border-red-500/30 transition-all duration-300 flex flex-col h-full shadow-2xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-white group-hover:text-red-500 transition-colors uppercase tracking-tight">{item.name}</h3>
                            <div className="flex gap-4">
                                {(type === 'perks') && (
                                    <div className={`text-[9px] font-black uppercase tracking-widest ${item.is_negative ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {item.is_negative ? 'Negative' : 'Positive'} • {item.point_cost} PT
                                    </div>
                                )}
                                {(type === 'occupations') && (
                                    <div className="text-[9px] font-black uppercase tracking-widest text-emerald-500">
                                        Starting Assets: {item.starting_points}
                                    </div>
                                )}
                                {(type !== 'perks' && type !== 'occupations' && item.max_value) && (
                                    <div className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                                        Ceiling: {item.max_value}
                                    </div>
                                )}
                                <div className="text-[9px] font-mono text-gray-700">ID: {item.id.slice(0, 8)}</div>
                            </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-9 w-9 text-gray-500 hover:text-white hover:bg-white/10" onClick={() => handleEditClick(item, type)}><Edit className="w-4 h-4" /></Button>
                            <Button size="icon" variant="ghost" className="h-9 w-9 text-gray-500 hover:text-red-500 hover:bg-red-500/10" onClick={() => handleDelete(type, item.id, item.name)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                    </div>

                    <p className="text-[11px] text-gray-500 leading-relaxed mb-6 flex-grow line-clamp-3 italic">
                        {item.description || 'No system logs provided for this character initialization protocol.'}
                    </p>

                    {(item.effects && item.effects.length > 0) && (
                        <div className="mt-auto space-y-2">
                            <div className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1.5 ml-1">Hardwired Effects</div>
                            <div className="flex flex-wrap gap-2">
                                {item.effects.map((fx, idx) => (
                                    <div key={idx} className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg flex items-center gap-2">
                                        <div className={`w-1 h-1 rounded-full ${fx.value >= 0 ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]'}`} />
                                        <span className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter">
                                            {fx.value >= 0 ? '+' : ''}{fx.value} {fx.id.split('_').slice(-1)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    const renderFormForType = () => {
        if (!editingItem) return null;
        switch (editingType) {
            case 'perks': return renderPerkForm();
            case 'occupations': return renderOccupationForm();
            case 'skills': case 'attributes': case 'stats': return renderSimpleForm();
            default: return null;
        }
    }

    if (loading) return (
        <div className="flex justify-center items-center py-40">
            <Loader2 className="w-16 h-16 text-red-500 animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center text-white">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-3">
                        <User className="text-red-600" />
                        Human Evolution Protocol
                    </h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Calibrate character perks, occupations, and foundational biological parameters</p>
                </div>
            </div>

            {renderFormForType()}

            {!editingItem && (
                <Tabs defaultValue="perks" className="w-full">
                    <div className="flex justify-center mb-8">
                        <TabsList className="bg-white/[0.02] border border-white/5 p-1 h-14 rounded-2xl grid w-full max-w-4xl grid-cols-5 gap-2">
                            {[
                                { id: 'perks', label: 'Traits', icon: Star },
                                { id: 'occupations', label: 'Origins', icon: Layers },
                                { id: 'skills', label: 'Skills', icon: Target },
                                { id: 'attributes', label: 'Biology', icon: Sliders },
                                { id: 'stats', label: 'Metabolics', icon: Activity }
                            ].map((tab) => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className="data-[state=active]:bg-red-600 data-[state=active]:text-white h-full rounded-xl transition-all duration-300 text-[10px] font-black uppercase tracking-widest gap-2"
                                >
                                    <tab.icon className="hidden md:block w-3.5 h-3.5" />
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <TabsContent value="perks" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-end mb-6">
                            <Button
                                onClick={() => handleAddClick('perks', { name: '', description: '', is_negative: false, point_cost: 0, effects: [] })}
                                className="bg-red-600 hover:bg-red-500 rounded-xl px-6 h-10 font-bold uppercase tracking-widest text-[10px] text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Register Trait
                            </Button>
                        </div>
                        {renderList(perks, 'perks')}
                    </TabsContent>

                    <TabsContent value="occupations" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-end mb-6">
                            <Button
                                onClick={() => handleAddClick('occupations', { name: '', description: '', starting_points: 0, effects: [] })}
                                className="bg-red-600 hover:bg-red-500 rounded-xl px-6 h-10 font-bold uppercase tracking-widest text-[10px] text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Document Origin
                            </Button>
                        </div>
                        {renderList(occupations, 'occupations')}
                    </TabsContent>

                    <TabsContent value="skills" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-end mb-6">
                            <Button
                                onClick={() => handleAddClick('skills', { name: '', description: '', max_value: 100 })}
                                className="bg-red-600 hover:bg-red-500 rounded-xl px-6 h-10 font-bold uppercase tracking-widest text-[10px] text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Define Skill
                            </Button>
                        </div>
                        {renderList(skills, 'skills')}
                    </TabsContent>

                    <TabsContent value="attributes" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-end mb-6">
                            <Button
                                onClick={() => handleAddClick('attributes', { name: '', description: '', max_value: 10 })}
                                className="bg-red-600 hover:bg-red-500 rounded-xl px-6 h-10 font-bold uppercase tracking-widest text-[10px] text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Base Protocol
                            </Button>
                        </div>
                        {renderList(attributes, 'attributes')}
                    </TabsContent>

                    <TabsContent value="stats" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-end mb-6">
                            <Button
                                onClick={() => handleAddClick('stats', { name: '', description: '' })}
                                className="bg-red-600 hover:bg-red-500 rounded-xl px-6 h-10 font-bold uppercase tracking-widest text-[10px] text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" /> Metabolic Param
                            </Button>
                        </div>
                        {renderList(stats, 'stats')}
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
};

export default PerksOccupationsManager;
