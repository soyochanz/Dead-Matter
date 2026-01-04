import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/mySupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

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
        // Reset id if type changes
        if(field === 'type') effect.id = '';
        newEffects[index] = effect;
        setEffects(newEffects);
    };

    const selectClass = "w-full bg-white/5 backdrop-blur-sm border border-white/10 p-2 rounded h-10 text-white";

    return (
        <div className="space-y-4 border-t border-slate-700 pt-4">
            <h4 className="text-lg font-semibold text-white">Effects</h4>
            {(effects || []).map((effect, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-black/20 p-4 rounded-lg items-center">
                    <select value={effect.type} onChange={e => updateEffect(index, 'type', e.target.value)} className={selectClass}>
                        <option value="skills">Skill</option>
                        <option value="attributes">Attribute</option>
                        <option value="stats">Stat</option>
                    </select>
                    <select value={effect.id} onChange={e => updateEffect(index, 'id', e.target.value)} className={selectClass}>
                        <option value="">Select Target...</option>
                        {(available[effect.type] || []).map(item => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                    </select>
                    <Input type="number" placeholder="Value" value={effect.value} onChange={e => updateEffect(index, 'value', parseInt(e.target.value) || 0)} />
                    <Button variant="destructive" size="icon" onClick={() => removeEffect(index)}><Trash2 className="w-4 h-4" /></Button>
                </div>
            ))}
            <Button onClick={addEffect} type="button">Add Effect</Button>
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
    const selectClass = "w-full bg-white/5 backdrop-blur-sm border border-white/10 p-2 rounded h-10 text-white";

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

    const handleSave = async () => {
        const table = editingType;
        const {id, ...dataToSave} = editingItem;
        
        let error;
        if (id) {
            ({ error } = await supabase.from(table).update(dataToSave).eq('id', id));
        } else {
            ({ error } = await supabase.from(table).insert([dataToSave]));
        }

        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Success", description: `${table.slice(0, -1)} saved successfully` });
            setEditingItem(null);
            setEditingType(null);
            fetchData();
        }
    };

    const handleDelete = async (type, id) => {
        const table = type;
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
        else { toast({ title: "Success", description: `${type.slice(0,-1)} deleted` }); fetchData(); }
    };
    
    const handleEditClick = (item, type) => { setEditingItem(item); setEditingType(type); };
    const handleAddClick = (type, defaults) => { setEditingItem(defaults); setEditingType(type); };

    const renderPerkForm = () => (
        <form onSubmit={e => { e.preventDefault(); handleSave(); }} className="space-y-4 bg-white/5 border border-white/10 p-6 rounded-lg">
            <h3 className="text-2xl font-bold text-white">{editingItem?.id ? "Edit Perk" : "New Perk"}</h3>
            <Input placeholder="Perk Name" value={editingItem?.name || ''} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} required/>
            <textarea placeholder="Description" value={editingItem?.description || ''} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} className="w-full bg-white/5 backdrop-blur-sm border border-white/10 p-2 rounded" />
            <Input type="number" placeholder="Point Cost" value={editingItem?.point_cost === 0 ? 0 : (editingItem?.point_cost || '')} onChange={(e) => setEditingItem({ ...editingItem, point_cost: parseInt(e.target.value) })} />
            <div className="flex items-center gap-2">
                <Checkbox id="is_negative" checked={editingItem?.is_negative || false} onCheckedChange={(checked) => setEditingItem({ ...editingItem, is_negative: checked })} />
                <label htmlFor="is_negative" className="text-white">Negative Perk (Adds points)</label>
            </div>
            
            <EffectsManager effects={editingItem.effects} setEffects={(effects) => setEditingItem({...editingItem, effects})} available={availableEffects} />

            <div className="flex gap-2">
                <Button type="submit"><Save className="w-4 h-4 mr-2" />Save</Button>
                <Button type="button" variant="outline" onClick={() => setEditingItem(null)}><X className="w-4 h-4 mr-2" />Cancel</Button>
            </div>
        </form>
    );

    const renderOccupationForm = () => (
        <form onSubmit={e => { e.preventDefault(); handleSave(); }} className="space-y-4 bg-white/5 border border-white/10 p-6 rounded-lg">
            <h3 className="text-2xl font-bold text-white">{editingItem?.id ? "Edit Occupation" : "New Occupation"}</h3>
            <Input placeholder="Occupation Name" value={editingItem?.name || ''} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} required/>
            <textarea placeholder="Description" value={editingItem?.description || ''} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} className="w-full bg-white/5 backdrop-blur-sm border border-white/10 p-2 rounded" />
            <Input type="number" placeholder="Starting Points" value={editingItem?.starting_points === 0 ? 0 : (editingItem?.starting_points || '')} onChange={(e) => setEditingItem({ ...editingItem, starting_points: parseInt(e.target.value) })}/>
            
            <EffectsManager effects={editingItem.effects} setEffects={(effects) => setEditingItem({...editingItem, effects})} available={availableEffects} />

            <div className="flex gap-2">
                <Button type="submit"><Save className="w-4 h-4 mr-2" />Save</Button>
                <Button type="button" variant="outline" onClick={() => setEditingItem(null)}><X className="w-4 h-4 mr-2" />Cancel</Button>
            </div>
        </form>
    );

    const renderSimpleForm = () => (
        <form onSubmit={e => { e.preventDefault(); handleSave(); }} className="space-y-4 bg-white/5 border border-white/10 p-6 rounded-lg">
            <h3 className="text-2xl font-bold text-white">{editingItem?.id ? `Edit ${editingType.slice(0,-1)}` : `New ${editingType.slice(0,-1)}`}</h3>
            <Input placeholder="Name" value={editingItem?.name || ''} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} required/>
            <Input placeholder="Description" value={editingItem?.description || ''} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}/>
            {editingType !== 'stats' && <Input type="number" placeholder="Max Value" value={editingItem?.max_value === 0 ? 0 : (editingItem?.max_value || '')} onChange={(e) => setEditingItem({ ...editingItem, max_value: parseInt(e.target.value) })}/>}
            <div className="flex gap-2">
                <Button type="submit"><Save className="w-4 h-4 mr-2" />Save</Button>
                <Button type="button" variant="outline" onClick={() => setEditingItem(null)}><X className="w-4 h-4 mr-2" />Cancel</Button>
            </div>
        </form>
    );

    const renderList = (items, type) => (
        <div className="space-y-2">
            {items.map(item => (
                <div key={item.id} className="bg-white/5 p-4 rounded-lg flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-white">{item.name}</h3>
                        <p className="text-sm text-gray-400">{item.description}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button size="icon" variant="outline" onClick={() => handleEditClick(item, type)}><Edit className="w-4 h-4" /></Button>
                        <Button size="icon" variant="destructive" onClick={() => handleDelete(type, item.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
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

    if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-12 h-12 text-red-500 animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Perks & Character System</h2>
            {renderFormForType()}
            <Tabs defaultValue="perks">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="perks">Perks</TabsTrigger>
                    <TabsTrigger value="occupations">Occupations</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                    <TabsTrigger value="attributes">Attributes</TabsTrigger>
                    <TabsTrigger value="stats">Stats</TabsTrigger>
                </TabsList>
                <TabsContent value="perks" className="space-y-4 pt-4"><Button onClick={() => handleAddClick('perks', { name: '', description: '', is_negative: false, point_cost: 0, effects: [] })}><Plus className="w-4 h-4 mr-2" />Add Perk</Button>{renderList(perks, 'perks')}</TabsContent>
                <TabsContent value="occupations" className="space-y-4 pt-4"><Button onClick={() => handleAddClick('occupations', { name: '', description: '', starting_points: 0, effects: [] })}><Plus className="w-4 h-4 mr-2" />Add Occupation</Button>{renderList(occupations, 'occupations')}</TabsContent>
                <TabsContent value="skills" className="space-y-4 pt-4"><Button onClick={() => handleAddClick('skills', { name: '', description: '', max_value: 100 })}><Plus className="w-4 h-4 mr-2" />Add Skill</Button>{renderList(skills, 'skills')}</TabsContent>
                <TabsContent value="attributes" className="space-y-4 pt-4"><Button onClick={() => handleAddClick('attributes', { name: '', description: '', max_value: 10 })}><Plus className="w-4 h-4 mr-2" />Add Attribute</Button>{renderList(attributes, 'attributes')}</TabsContent>
                <TabsContent value="stats" className="space-y-4 pt-4"><Button onClick={() => handleAddClick('stats', { name: '', description: '' })}><Plus className="w-4 h-4 mr-2" />Add Stat</Button>{renderList(stats, 'stats')}</TabsContent>
            </Tabs>
        </div>
    );
};

export default PerksOccupationsManager;
