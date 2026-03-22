import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/mySupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, MapPin, Trash2, Compass, Square, X, Save, ChevronDown, ChevronUp, GripVertical, Flag, Target, Navigation } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useMapData } from '@/hooks/useMapData';
import InteractiveMap from '@/components/map/InteractiveMap';

// Tag options configuration
const TAG_OPTIONS = [
    { label: 'Military', color: '#ef4444' },
    { label: 'Industrial', color: '#f97316' },
    { label: 'Civilian', color: '#22c55e' },
    { label: 'Medical', color: '#a855f7' },
    { label: 'Food', color: '#eab308' },
    { label: 'Calculated', color: '#3b82f6' },
    { label: 'Clothes', color: '#ec4899' },
    { label: 'Weapons', color: '#64748b' },
    { label: 'Base Items', color: '#a16207' }
];

// ─── Mission Step Card ────────────────────────────────────────────────────────
const MissionStepCard = ({ step, idx, total, onChange, onDelete }) => {
    const [expanded, setExpanded] = useState(true);

    return (
        <div
            style={{
                background: 'linear-gradient(135deg, rgba(251,191,36,0.05) 0%, rgba(0,0,0,0) 100%)',
                border: '1px solid rgba(251,191,36,0.15)',
                borderLeft: '3px solid #f59e0b',
                borderRadius: '8px',
                marginBottom: '8px',
                overflow: 'hidden',
                transition: 'border-color 0.2s'
            }}
        >
            {/* Step Header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    userSelect: 'none',
                }}
                onClick={() => setExpanded(e => !e)}
            >
                <div style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: 'rgba(251,191,36,0.15)',
                    border: '1px solid rgba(251,191,36,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: '700', color: '#f59e0b',
                    flexShrink: 0
                }}>
                    {idx === 0 ? <Flag size={10} /> : idx === total - 1 ? <Target size={10} /> : idx + 1}
                </div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#e5e7eb', flex: 1 }}>
                    {step.title || `Step ${idx + 1}`}
                </span>
                {step.lat !== 0 && (
                    <span style={{ fontSize: '10px', color: '#6b7280', fontFamily: 'monospace' }}>
                        {step.lat.toFixed(4)}, {step.lng.toFixed(4)}
                    </span>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(idx); }}
                    style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', lineHeight: 1 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
                >
                    <X size={13} />
                </button>
                <span style={{ color: '#6b7280', lineHeight: 1 }}>
                    {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </span>
            </div>

            {/* Step Body */}
            {expanded && (
                <div style={{ padding: '0 12px 12px', display: 'grid', gap: '8px' }}>
                    <input
                        value={step.title}
                        onChange={e => onChange(idx, { title: e.target.value })}
                        placeholder="Step title..."
                        style={{
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '6px', padding: '5px 8px', fontSize: '12px', color: '#e5e7eb',
                            outline: 'none', width: '100%', boxSizing: 'border-box'
                        }}
                    />
                    <textarea
                        value={step.description}
                        onChange={e => onChange(idx, { description: e.target.value })}
                        placeholder="Instructions for this step..."
                        rows={2}
                        style={{
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '6px', padding: '5px 8px', fontSize: '12px', color: '#9ca3af',
                            outline: 'none', width: '100%', resize: 'vertical', boxSizing: 'border-box',
                            fontFamily: 'inherit'
                        }}
                    />
                    <input
                        value={step.image_url}
                        onChange={e => onChange(idx, { image_url: e.target.value })}
                        placeholder="Image URL (optional)"
                        style={{
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '6px', padding: '4px 8px', fontSize: '11px', color: '#6b7280',
                            outline: 'none', width: '100%', boxSizing: 'border-box'
                        }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        {['lat', 'lng'].map(field => (
                            <div key={field} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '10px', color: '#f59e0b', fontWeight: '700', textTransform: 'uppercase', width: '22px', flexShrink: 0 }}>{field}</span>
                                <input
                                    type="number"
                                    value={step[field]}
                                    onChange={e => onChange(idx, { [field]: parseFloat(e.target.value) || 0 })}
                                    style={{
                                        background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)',
                                        borderRadius: '4px', padding: '3px 6px', fontSize: '10px', color: '#e5e7eb',
                                        outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'monospace'
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const MapManager = () => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [missionDialogOpen, setMissionDialogOpen] = useState(false);

    const { categories, markers: initialMarkers, lootTags: initialTags, keys: availableKeys, missions: initialMissions, polygons: initialPolygons, paths: initialPaths } = useMapData(0);

    const [searchParams, setSearchParams] = useSearchParams();
    const [markers, setMarkers] = useState([]);
    const [missions, setMissions] = useState([]);
    const [polygons, setPolygons] = useState([]);
    const [paths, setPaths] = useState([]);
    const [lootTags, setLootTags] = useState([]);

    const viewMode = searchParams.get('mode') || 'markers';
    const setViewMode = (mode) => setSearchParams({ ...Object.fromEntries(searchParams), mode });

    // ── Refs for stable callbacks ─────────────────────────────────────────────
    // We store mutable state in refs so callbacks stay stable (no re-memoization)
    const viewModeRef = useRef(viewMode);
    const isAddingStepRef = useRef(false);
    const activeZonePointsRef = useRef([]);
    const activePathPointsRef = useRef([]);
    const categoriesRef = useRef(categories);

    // Keep refs in sync
    useEffect(() => { viewModeRef.current = viewMode; }, [viewMode]);
    useEffect(() => { categoriesRef.current = categories; }, [categories]);

    const [isAddingStep, setIsAddingStep] = useState(false);
    const [activeZonePoints, setActiveZonePoints] = useState([]);
    const [activePathPoints, setActivePathPoints] = useState([]);
    const [pathDialogOpen, setPathDialogOpen] = useState(false);
    const [pathFormData, setPathFormData] = useState({ name: '', type: 'road' });

    // Sync isAddingStep to ref
    useEffect(() => { isAddingStepRef.current = isAddingStep; }, [isAddingStep]);
    useEffect(() => { activeZonePointsRef.current = activeZonePoints; }, [activeZonePoints]);
    useEffect(() => { activePathPointsRef.current = activePathPoints; }, [activePathPoints]);

    // Initialize local state from fetched data (only once)
    useEffect(() => {
        if (initialMarkers?.length > 0) setMarkers(prev => prev.length === 0 ? initialMarkers : prev);
    }, [initialMarkers]);
    useEffect(() => {
        if (initialTags?.length > 0) setLootTags(prev => prev.length === 0 ? initialTags : prev);
    }, [initialTags]);
    useEffect(() => {
        if (initialMissions) setMissions(prev => prev.length === 0 ? initialMissions : prev);
    }, [initialMissions]);
    useEffect(() => {
        if (initialPolygons) setPolygons(prev => prev.length === 0 ? initialPolygons : prev);
    }, [initialPolygons]);
    useEffect(() => {
        if (initialPaths) setPaths(prev => prev.length === 0 ? initialPaths : prev);
    }, [initialPaths]);

    // ── Form State ────────────────────────────────────────────────────────────
    const [formData, setFormData] = useState({
        title: '', description: '', category_id: '', image_url: '',
        infected_level: 'Low', selectedTags: [], requires_key: false,
        required_key_ids: [], required_key_id: '', has_water_source: false
    });

    const [missionForm, setMissionForm] = useState({
        title: '', description: '', npc_id: '', start_npc_id: '', steps: []
    });

    // Ref so map click handler can read current mission form without re-memoizing
    const missionFormRef = useRef(missionForm);
    useEffect(() => { missionFormRef.current = missionForm; }, [missionForm]);

    const [markerPos, setMarkerPos] = useState({ lat: 0, lng: 0 });
    const [editingMarker, setEditingMarker] = useState(null);

    // ── Stable Callbacks ──────────────────────────────────────────────────────

    const handleZoneSave = useCallback(async (points) => {
        setLoading(true);
        try {
            const tempZone = { id: `temp-${Date.now()}`, points, type: 'house' };
            setPolygons(prev => [...prev, tempZone]);
            toast({ title: 'Zone Added', description: 'Building zone marked.' });

            const { data, error } = await supabase.from('map_polygons').insert({ points, type: 'house' }).select().single();
            if (error) throw error;
            setPolygons(prev => prev.map(p => p.id === tempZone.id ? data : p));
        } catch (e) {
            console.error(e);
            toast({ title: 'Error saving zone', description: e.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    // ✅ FIX: handleZoneDelete is now stable via useCallback with no changing deps
    const handleZoneDelete = useCallback(async (id, entityType = 'zone') => {
        if (!confirm(`Delete this ${entityType}?`)) return;
        setLoading(true);
        try {
            if (entityType === 'path') {
                setPaths(prev => prev.filter(p => p.id !== id));
                await supabase.from('map_paths').delete().eq('id', id);
            } else {
                setPolygons(prev => prev.filter(p => p.id !== id));
                await supabase.from('map_polygons').delete().eq('id', id);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ FIX: handleMapClick uses refs to read mutable state — stays stable
    const handleMapClick = useCallback((latlng) => {
        const mode = viewModeRef.current;

        if (mode === 'missions') {
            if (isAddingStepRef.current) {
                setMissionForm(prev => ({
                    ...prev,
                    steps: [...prev.steps, {
                        title: `Step ${prev.steps.length + 1}`,
                        description: '',
                        lat: latlng.lat,
                        lng: latlng.lng,
                        image_url: ''
                    }]
                }));
                setIsAddingStep(false);
                isAddingStepRef.current = false;
                setMissionDialogOpen(true); // Reopen dialog after placing step
            }
            return;
        }

        if (mode === 'zones') {
            const newPoints = [...activeZonePointsRef.current, [latlng.lat, latlng.lng]];
            setActiveZonePoints(newPoints);
            if (newPoints.length === 4) {
                handleZoneSave(newPoints);
                setActiveZonePoints([]);
                activeZonePointsRef.current = [];
            }
            return;
        }

        if (mode === 'paths') {
            setActivePathPoints(prev => [...prev, [latlng.lat, latlng.lng]]);
            return;
        }

        // Default: Marker Mode
        setEditingMarker(null);
        setMarkerPos(latlng);
        setFormData({
            title: '', description: '',
            category_id: categoriesRef.current.length > 0 ? categoriesRef.current[0].id : '',
            image_url: '', infected_level: 'Low', selectedTags: [],
            requires_key: false, required_key_id: '', has_water_source: false
        });
        setDialogOpen(true);
    }, [handleZoneSave]); // handleZoneSave is stable, so this stays stable too

    // ✅ FIX: handleMarkerClick is also stable
    const handleMarkerClick = useCallback(async (marker) => {
        if (['missions', 'zones', 'paths'].includes(viewModeRef.current)) return;
        setLoading(true);
        try {
            setEditingMarker(marker);
            setMarkerPos({ lat: marker.lat, lng: marker.lng });
            const { data: tags, error: tagError } = await supabase
                .from('marker_loot_tags').select('label').eq('marker_id', marker.id);
            if (tagError) throw tagError;
            setFormData({
                title: marker.title, description: marker.description || '',
                category_id: marker.category_id, image_url: marker.image_url || '',
                infected_level: marker.infected_level || 'Low',
                selectedTags: tags ? tags.map(t => t.label) : [],
                requires_key: marker.requires_key || false,
                required_key_ids: marker.required_key_ids || (marker.required_key_id ? [marker.required_key_id] : []),
                has_water_source: marker.has_water_source || false
            });
            setDialogOpen(true);
        } catch (error) {
            toast({ title: 'Error loading marker', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const handleUpdateMissionStep = useCallback((idx, data) => {
        setMissionForm(prev => {
            const newSteps = [...prev.steps];
            newSteps[idx] = { ...newSteps[idx], ...data };
            return { ...prev, steps: newSteps };
        });
    }, []);

    const handleDeleteMissionStep = useCallback((idx) => {
        setMissionForm(prev => ({
            ...prev,
            steps: prev.steps.filter((_, i) => i !== idx)
        }));
    }, []);

    // ── Path Save ─────────────────────────────────────────────────────────────
    const handlePathSave = async () => {
        if (activePathPoints.length < 2) return;
        setLoading(true);
        try {
            const { data, error } = await supabase.from('map_paths').insert({
                name: pathFormData.name, type: pathFormData.type, points: activePathPoints
            }).select().single();
            if (error) throw error;
            setPaths(prev => [...prev, data]);
            setActivePathPoints([]);
            setPathDialogOpen(false);
            setPathFormData({ name: '', type: 'road' });
            toast({ title: 'Path Saved', description: `${data.name} created.` });
        } catch (e) {
            toast({ title: 'Error', description: e.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    // ── Mission Save ──────────────────────────────────────────────────────────
    const handleCreateMission = () => {
        setMissionForm({ title: '', description: '', npc_id: '', start_npc_id: '', steps: [] });
        setIsAddingStep(false);
        setEditingMarker(null);
        setMissionDialogOpen(true);
    };

    const handleMissionSave = async () => {
        if (!missionForm.title.trim()) {
            toast({ title: 'Error', description: 'The mission must have a title.', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const { data, error: missionError } = await supabase
                .from('missions')
                .insert({
                    title: missionForm.title.trim(),
                    content_html: missionForm.description || '',
                    npc_id: missionForm.npc_id && missionForm.npc_id !== "" ? missionForm.npc_id : null,
                    start_npc_id: missionForm.start_npc_id && missionForm.start_npc_id !== "" ? missionForm.start_npc_id : null
                })
                .select();

            if (missionError) throw missionError;
            if (!data || data.length === 0) throw new Error("Could not create mission record.");
            
            const mission = data[0];

            if (missionForm.steps.length > 0) {
                const stepInserts = missionForm.steps.map((step, index) => ({
                    mission_id: mission.id,
                    step_order: index + 1,
                    title: step.title || `Step ${index + 1}`,
                    description: step.description || '',
                    image_url: step.image_url || null,
                    lat: step.lat || 0,
                    lng: step.lng || 0
                }));
                
                const { error: stepsError } = await supabase.from('mission_steps').insert(stepInserts);
                if (stepsError) throw stepsError;
            }

            toast({ title: 'Mission Created', description: `"${mission.title}" successfully saved.` });
            setMissions(prev => [{ ...mission, mission_steps: missionForm.steps }, ...prev]);
            setMissionForm({ title: '', description: '', npc_id: '', start_npc_id: '', steps: [] });
            setMissionDialogOpen(false);
        } catch (e) {
            console.error("Save error:", e);
            toast({ title: 'Error', variant: 'destructive', description: e.message || 'Database error' });
        } finally {
            setLoading(false);
        }
    };

    // ── Marker Save/Delete ────────────────────────────────────────────────────
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTagToggle = (tagLabel) => {
        setFormData(prev => ({
            ...prev,
            selectedTags: prev.selectedTags.includes(tagLabel)
                ? prev.selectedTags.filter(t => t !== tagLabel)
                : [...prev.selectedTags, tagLabel]
        }));
    };

    const handleKeyToggle = (keyId) => {
        setFormData(prev => ({
            ...prev,
            required_key_ids: (prev.required_key_ids || []).includes(keyId)
                ? prev.required_key_ids.filter(k => k !== keyId)
                : [...(prev.required_key_ids || []), keyId]
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        const tempId = editingMarker ? editingMarker.id : `temp-${Date.now()}`;
        try {
            const payload = {
                lat: markerPos.lat, lng: markerPos.lng, title: formData.title,
                description: formData.description, category_id: formData.category_id,
                image_url: formData.image_url || null, infected_level: formData.infected_level,
                requires_key: formData.requires_key,
                required_key_ids: formData.requires_key ? formData.required_key_ids : [],
                required_key_id: (formData.requires_key && formData.required_key_ids?.length > 0) ? formData.required_key_ids[0] : null,
                has_water_source: formData.has_water_source
            };

            let optimisticMarker = { ...payload, id: tempId };
            if (editingMarker) {
                setMarkers(prev => prev.map(m => m.id === tempId ? { ...m, ...optimisticMarker } : m));
            } else {
                setMarkers(prev => [...prev, optimisticMarker]);
            }

            setLootTags(prev => prev.filter(t => t.marker_id !== tempId));
            const optimisticTags = formData.selectedTags.map(label => {
                const tagConfig = TAG_OPTIONS.find(t => t.label === label);
                return { id: `temp-tag-${Math.random()}`, marker_id: tempId, label, color: tagConfig?.color || '#ffffff' };
            });
            setLootTags(prev => [...prev, ...optimisticTags]);
            setDialogOpen(false);

            let targetMarkerId = editingMarker?.id;
            let finalMarker = null;

            if (editingMarker) {
                const { data, error } = await supabase.from('map_markers').update(payload).eq('id', editingMarker.id).select().single();
                if (error) throw error;
                finalMarker = data;
                toast({ title: 'Success', description: 'Marker updated!' });
            } else {
                const { data, error } = await supabase.from('map_markers').insert(payload).select().single();
                if (error) throw error;
                finalMarker = data;
                targetMarkerId = finalMarker.id;
                toast({ title: 'Success', description: 'Marker created!' });
                setMarkers(prev => prev.map(m => m.id === tempId ? finalMarker : m));
                setLootTags(prev => prev.map(t => t.marker_id === tempId ? { ...t, marker_id: finalMarker.id } : t));
            }

            if (targetMarkerId) {
                const { error: deleteError } = await supabase.from('marker_loot_tags').delete().eq('marker_id', targetMarkerId);
                if (deleteError) throw deleteError;

                if (formData.selectedTags.length > 0) {
                    const tagInserts = formData.selectedTags.map(label => {
                        const tagConfig = TAG_OPTIONS.find(t => t.label === label);
                        return { marker_id: targetMarkerId, label, color: tagConfig?.color || '#ffffff' };
                    });
                    const { data: newTags, error: insertError } = await supabase.from('marker_loot_tags').insert(tagInserts).select();
                    if (insertError) throw insertError;
                    setLootTags(prev => [...prev.filter(t => t.marker_id !== targetMarkerId), ...newTags]);
                } else {
                    setLootTags(prev => prev.filter(t => t.marker_id !== targetMarkerId));
                }
            }
        } catch (error) {
            toast({ title: 'Error saving', description: error.message, variant: 'destructive' });
            if (!editingMarker) setMarkers(prev => prev.filter(m => !String(m.id).startsWith('temp-')));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!editingMarker || !confirm('Are you sure you want to delete this marker?')) return;
        setLoading(true);
        const idToDelete = editingMarker.id;
        try {
            setMarkers(prev => prev.filter(m => m.id !== idToDelete));
            setLootTags(prev => prev.filter(t => t.marker_id !== idToDelete));
            setDialogOpen(false);
            const { error } = await supabase.from('map_markers').delete().eq('id', idToDelete);
            if (error) throw error;
            toast({ title: 'Deleted', description: 'Marker deleted successfully.' });
        } catch (error) {
            toast({ title: 'Error deleting', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    // ── Memoized map polylines ────────────────────────────────────────────────
    const manualPolylines = useMemo(() => {
        if (viewMode === 'missions' && missionForm.steps.length > 0) {
            const poly = missionForm.steps.map(s => [s.lat, s.lng]);
            if (missionForm.npc_id) {
                const npc = markers.find(m => m.id === missionForm.npc_id);
                if (npc) poly.push([npc.lat, npc.lng]);
            }
            return [poly];
        }
        return [];
    }, [viewMode, missionForm.steps, missionForm.npc_id, markers]);

    // ── ✅ Stable memoized map — callbacks are now stable, won't re-render ────
    const memoMap = useMemo(() => {
        const polylines = viewMode === 'paths' && activePathPoints.length > 0
            ? [...manualPolylines, activePathPoints]
            : manualPolylines;

        return (
            <div className="flex flex-col flex-grow min-h-0">
                {viewMode === 'zones' && (
                    <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '13px', color: '#93c5fd' }}>
                            <strong style={{ color: '#60a5fa' }}>Add Building Zone:</strong> Click 4 corner points on the map.
                            {activeZonePoints.length > 0 && (
                                <span style={{ marginLeft: '8px', background: '#2563eb', color: '#fff', padding: '2px 8px', borderRadius: '999px', fontSize: '11px' }}>
                                    {activeZonePoints.length} / 4 points
                                </span>
                            )}
                        </div>
                        {activeZonePoints.length > 0 && (
                            <button onClick={() => setActiveZonePoints([])} style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <X size={12} /> Clear
                            </button>
                        )}
                    </div>
                )}
                {viewMode === 'paths' && (
                    <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '13px', color: '#6ee7b7' }}>
                            <strong style={{ color: '#34d399' }}>Add Path:</strong> Click multiple points to form a road, rail, or river.
                            {activePathPoints.length > 0 && (
                                <span style={{ marginLeft: '8px', background: '#059669', color: '#fff', padding: '2px 8px', borderRadius: '999px', fontSize: '11px' }}>
                                    {activePathPoints.length} points
                                </span>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {activePathPoints.length >= 2 && (
                                <Button size="sm" className="h-7 bg-emerald-600 hover:bg-emerald-700" onClick={() => setPathDialogOpen(true)}>
                                    <Save className="w-3 h-3 mr-1" /> Save Path
                                </Button>
                            )}
                            {activePathPoints.length > 0 && (
                                <button onClick={() => setActivePathPoints([])} style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <X size={12} /> Clear
                                </button>
                            )}
                        </div>
                    </div>
                )}
                {viewMode === 'missions' && isAddingStep && (
                    <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Navigation size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', color: '#fcd34d' }}>
                            <strong>Click on the map</strong> to place the next mission step.
                        </span>
                        <button onClick={() => { setIsAddingStep(false); setMissionDialogOpen(true); }}
                            style={{ marginLeft: 'auto', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <X size={14} /> Cancel
                        </button>
                    </div>
                )}
                <div className="flex-grow border border-white/10 rounded-xl overflow-hidden relative min-h-[500px]">
                    <InteractiveMap
                        adminMode={true}
                        disableUI={true}
                        onMapClick={handleMapClick}
                        onMarkerClick={handleMarkerClick}
                        markers={markers}
                        lootTags={lootTags}
                        categories={categories}
                        keys={availableKeys}
                        manualPolylines={polylines}
                        polygons={polygons}
                        paths={paths}
                        activePolygonPoints={activeZonePoints}
                        missions={missions}
                        currentMissionSteps={viewMode === 'missions' ? missionForm.steps : []}
                        onPolygonClick={viewMode === 'zones' || viewMode === 'paths' ? handleZoneDelete : undefined}
                        viewMode={viewMode}
                        onUpdateMissionStep={handleUpdateMissionStep}
                    />
                </div>
            </div>
        );
    }, [
        // ✅ Only data changes trigger re-render, NOT callbacks (they're stable)
        markers, lootTags, categories, availableKeys, manualPolylines, polygons, paths,
        activeZonePoints, activePathPoints, viewMode, missionForm.steps, isAddingStep,
        handleMapClick, handleMarkerClick, handleZoneDelete, handleUpdateMissionStep
    ]);

    // ── NPC options for mission dialog ────────────────────────────────────────
    const npcMarkers = useMemo(() => markers.filter(m => {
        const cat = categories.find(c => c.id === m.category_id);
        const name = cat?.name?.toLowerCase() || '';
        const group = cat?.group_name?.toLowerCase() || '';
        return name.includes('npc') || name.includes('vendor') || name.includes('trader') || group.includes('npc');
    }), [markers, categories]);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6 flex flex-col h-[calc(100vh-100px)]">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <h2 className="text-2xl font-bold text-white">Interactive Map Manager</h2>
                <div className="text-sm text-gray-400 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    {viewMode === 'markers' ? 'Click map to add · Click marker to edit'
                        : viewMode === 'missions' ? 'Use "New Mission" to start · Add steps via map or manually'
                            : viewMode === 'zones' ? 'Click 4 points to draw a building zone'
                                : 'Click points to draw a path'}
                </div>
                {viewMode === 'missions' && (
                    <Button onClick={handleCreateMission} className="ml-4 bg-amber-600 hover:bg-amber-700">
                        <Plus className="w-4 h-4 mr-2" /> New Mission
                    </Button>
                )}
            </div>

            {/* Tab Controls */}
            <div className="flex gap-2 border-b border-white/10 pb-4 shrink-0">
                {[
                    { mode: 'markers', label: 'Markers', count: markers.length, color: 'bg-red-600 hover:bg-red-700', Icon: MapPin },
                    { mode: 'missions', label: 'Missions', count: missions.length, color: 'bg-amber-600 hover:bg-amber-700', Icon: Compass },
                    { mode: 'zones', label: 'Zones', count: polygons.length, color: 'bg-blue-600 hover:bg-blue-700', Icon: Square },
                    { mode: 'paths', label: 'Paths', count: paths.length, color: 'bg-emerald-600 hover:bg-emerald-700', Icon: Navigation },
                ].map(({ mode, label, count, color, Icon }) => (
                    <Button
                        key={mode}
                        variant={viewMode === mode ? 'default' : 'outline'}
                        onClick={() => setViewMode(mode)}
                        className={viewMode === mode ? color : 'border-white/10 text-gray-400 hover:text-white'}
                    >
                        <Icon className="w-4 h-4 mr-2" />
                        {label} ({count})
                    </Button>
                ))}
            </div>

            {memoMap}

            {/* ── Marker Dialog ── */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent
                    className="bg-neutral-900 border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto"
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>{editingMarker ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                        <DialogDescription>
                            Location: {markerPos?.lat.toFixed(5)}, {markerPos?.lng.toFixed(5)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Name / Text</Label>
                            <Input id="title" name="title" value={formData.title} onChange={handleInputChange}
                                className="bg-neutral-800 border-neutral-700" placeholder="e.g., Hidden Cache" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category">Type / Category</Label>
                            <select id="category" name="category_id" value={formData.category_id} onChange={handleInputChange}
                                className="flex h-10 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white">
                                <option value="" disabled>Select Type</option>
                                {[...new Set(categories.map(c => c.group_name))].sort().map(group => (
                                    <optgroup key={group} label={(group === 'meta' ? 'Zones (Text Labels)' : group).charAt(0).toUpperCase() + (group === 'meta' ? 'Zones (Text Labels)' : group).slice(1)}>
                                        {categories.filter(c => c.group_name === group).map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>
                        {(!formData.category_id || !categories.find(c => c.id === formData.category_id)?.name.startsWith('Zones')) && (<>
                            <div className="grid gap-2">
                                <Label htmlFor="image_url">Featured Image</Label>
                                <Input id="image_url" name="image_url" placeholder="https://..." value={formData.image_url}
                                    onChange={handleInputChange} className="bg-neutral-800 border-neutral-700" />
                            </div>
                            <div className="flex items-center space-x-2 border border-neutral-700 bg-neutral-800 p-3 rounded-md">
                                <Checkbox id="has_water_source" checked={formData.has_water_source}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, has_water_source: checked }))} />
                                <Label htmlFor="has_water_source" className="text-sm font-medium cursor-pointer text-cyan-400">Water Source 💧</Label>
                            </div>
                            <div className="flex items-center space-x-2 border border-neutral-700 bg-neutral-800 p-3 rounded-md">
                                <Checkbox id="requires_key" checked={formData.requires_key}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requires_key: checked }))} />
                                <Label htmlFor="requires_key" className="text-sm font-medium cursor-pointer text-amber-500">Requires Key 🔐</Label>
                            </div>
                            {formData.requires_key && (
                                <div className="grid gap-2 pl-4 border-l-2 border-amber-500/30">
                                    <Label className="text-amber-500">Select Keys</Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-neutral-800 rounded-md border border-neutral-700 max-h-[200px] overflow-y-auto">
                                        {availableKeys && availableKeys.sort((a, b) => a.name.localeCompare(b.name)).map(key => (
                                            <div key={key.id} className="flex items-center space-x-2 p-1 hover:bg-white/5 rounded">
                                                <Checkbox id={`key-${key.id}`}
                                                    checked={(formData.required_key_ids || []).includes(key.id)}
                                                    onCheckedChange={() => handleKeyToggle(key.id)}
                                                    className="border-amber-500/50 data-[state=checked]:bg-amber-500 data-[state=checked]:text-black" />
                                                <label htmlFor={`key-${key.id}`} className="text-sm cursor-pointer select-none text-gray-300">{key.name}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="grid gap-2">
                                <Label>Loot Tags</Label>
                                <div className="grid grid-cols-2 gap-2 p-3 bg-neutral-800 rounded-md border border-neutral-700">
                                    {TAG_OPTIONS.map((tag) => (
                                        <div key={tag.label} className="flex items-center space-x-2">
                                            <Checkbox id={`tag-${tag.label}`} checked={formData.selectedTags.includes(tag.label)}
                                                onCheckedChange={() => handleTagToggle(tag.label)} />
                                            <label htmlFor={`tag-${tag.label}`} className="text-sm font-medium" style={{ color: tag.color }}>{tag.label}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="infected_level">Infected Level</Label>
                                <select id="infected_level" name="infected_level" value={formData.infected_level}
                                    onChange={handleInputChange} className="flex h-10 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white">
                                    {['None', 'Low', 'Medium', 'High'].map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" name="description" value={formData.description}
                                    onChange={handleInputChange} className="bg-neutral-800 border-neutral-700" rows={4} />
                            </div>
                        </>)}
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        {editingMarker && (
                            <Button variant="destructive" onClick={handleDelete} disabled={loading} className="mr-auto">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </Button>
                        )}
                        <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={loading} className="bg-red-600 hover:bg-red-700">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Path Dialog ── */}
            <Dialog open={pathDialogOpen} onOpenChange={setPathDialogOpen}>
                <DialogContent className="bg-neutral-900 border-white/10 text-white max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Save New Path</DialogTitle>
                        <DialogDescription>Name this road, railway, or river.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Path Name</Label>
                            <Input value={pathFormData.name} onChange={(e) => setPathFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="bg-neutral-800 border-neutral-700" placeholder="Main Street" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Type</Label>
                            <select value={pathFormData.type} onChange={(e) => setPathFormData(prev => ({ ...prev, type: e.target.value }))}
                                className="flex h-10 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white">
                                <option value="road">Road (Grey Solid)</option>
                                <option value="train_rail">Train Rail (Black/White Dashed)</option>
                                <option value="mountain_path">Mountain Path (Brown Dotted)</option>
                                <option value="river">River (Blue Glow)</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setPathDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handlePathSave} disabled={loading || !pathFormData.name} className="bg-emerald-600 hover:bg-emerald-700">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Path
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Mission Dialog (redesigned) ── */}
            <Dialog open={missionDialogOpen} onOpenChange={setMissionDialogOpen}>
                <DialogContent
                    className="text-white max-w-2xl max-h-[90vh] overflow-y-auto"
                    style={{
                        background: 'linear-gradient(160deg, #1a1206 0%, #111111 40%, #0d0d0d 100%)',
                        border: '1px solid rgba(251,191,36,0.2)',
                        boxShadow: '0 0 60px rgba(251,191,36,0.05), 0 25px 50px rgba(0,0,0,0.8)'
                    }}
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    {/* Mission Dialog Header */}
                    <div style={{ borderBottom: '1px solid rgba(251,191,36,0.15)', paddingBottom: '16px', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.1))',
                                border: '1px solid rgba(251,191,36,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Compass size={16} style={{ color: '#f59e0b' }} />
                            </div>
                            <div>
                                <DialogHeader className="p-0 border-none">
                                    <DialogTitle style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: 0 }}>New Mission</DialogTitle>
                                    <DialogDescription style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Define objectives, steps, and NPC assignments</DialogDescription>
                                </DialogHeader>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '16px', padding: '8px 0' }}>

                        {/* Mission Info */}
                        <div style={{
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '10px', padding: '14px', display: 'grid', gap: '12px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                <div style={{ width: '3px', height: '14px', background: '#f59e0b', borderRadius: '2px' }} />
                                <span style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Mission Info</span>
                            </div>
                            <input
                                value={missionForm.title}
                                onChange={e => setMissionForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Mission Title"
                                style={{
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px', padding: '9px 12px', fontSize: '14px', fontWeight: '600',
                                    color: '#f9fafb', outline: 'none', width: '100%', boxSizing: 'border-box'
                                }}
                                onFocus={e => e.target.style.borderColor = 'rgba(251,191,36,0.4)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                            <textarea
                                value={missionForm.description}
                                onChange={e => setMissionForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Brief mission overview and context..."
                                rows={2}
                                style={{
                                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                                    borderRadius: '8px', padding: '8px 12px', fontSize: '13px',
                                    color: '#9ca3af', outline: 'none', width: '100%', resize: 'vertical',
                                    boxSizing: 'border-box', fontFamily: 'inherit'
                                }}
                                onFocus={e => e.target.style.borderColor = 'rgba(251,191,36,0.3)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
                            />
                        </div>

                        {/* NPC Assignment */}
                        <div style={{
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '10px', padding: '14px', display: 'grid', gap: '10px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                <div style={{ width: '3px', height: '14px', background: '#818cf8', borderRadius: '2px' }} />
                                <span style={{ fontSize: '11px', fontWeight: '700', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>NPC Assignment</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {[
                                    { field: 'start_npc_id', label: '🚀 Start NPC', sublabel: 'Who gives the mission' },
                                    { field: 'npc_id', label: '🎯 End NPC', sublabel: 'Who receives completion' }
                                ].map(({ field, label, sublabel }) => (
                                    <div key={field} style={{ display: 'grid', gap: '5px' }}>
                                        <div>
                                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#d1d5db' }}>{label}</div>
                                            <div style={{ fontSize: '10px', color: '#6b7280' }}>{sublabel}</div>
                                        </div>
                                        <select
                                            value={missionForm[field]}
                                            onChange={e => setMissionForm(prev => ({ ...prev, [field]: e.target.value }))}
                                            style={{
                                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '6px', padding: '7px 10px', fontSize: '12px', color: '#e5e7eb',
                                                outline: 'none', width: '100%', cursor: 'pointer'
                                            }}
                                        >
                                            <option value="">— None —</option>
                                            {npcMarkers.map(m => (
                                                <option key={m.id} value={m.id}>{m.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Mission Steps */}
                        <div style={{
                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(251,191,36,0.12)',
                            borderRadius: '10px', padding: '14px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '3px', height: '14px', background: '#f59e0b', borderRadius: '2px' }} />
                                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                        Steps
                                    </span>
                                    <span style={{ background: 'rgba(251,191,36,0.15)', color: '#fcd34d', fontSize: '10px', fontWeight: '700', padding: '1px 7px', borderRadius: '999px', border: '1px solid rgba(251,191,36,0.25)' }}>
                                        {missionForm.steps.length}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button
                                        onClick={() => setMissionForm(prev => ({
                                            ...prev,
                                            steps: [...prev.steps, {
                                                title: `Step ${prev.steps.length + 1}`,
                                                description: '', lat: 0.01221, lng: 0.01914, image_url: ''
                                            }]
                                        }))}
                                        style={{
                                            background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)',
                                            borderRadius: '6px', padding: '5px 10px', fontSize: '11px', color: '#fbbf24',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(251,191,36,0.2)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(251,191,36,0.1)'}
                                    >
                                        <Plus size={11} /> Manual
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsAddingStep(true);
                                            isAddingStepRef.current = true;
                                            setMissionDialogOpen(false);
                                        }}
                                        style={{
                                            background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.35)',
                                            borderRadius: '6px', padding: '5px 10px', fontSize: '11px', color: '#fcd34d',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(251,191,36,0.25)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(251,191,36,0.15)'}
                                    >
                                        <MapPin size={11} /> Map Click
                                    </button>
                                </div>
                            </div>

                            {missionForm.steps.length === 0 ? (
                                <div style={{
                                    textAlign: 'center', padding: '24px 16px',
                                    border: '1px dashed rgba(251,191,36,0.15)', borderRadius: '8px'
                                }}>
                                    <Navigation size={20} style={{ color: 'rgba(251,191,36,0.3)', margin: '0 auto 8px' }} />
                                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                                        No steps yet. Add steps manually or click on the map.
                                    </p>
                                </div>
                            ) : (
                                <div style={{ maxHeight: '260px', overflowY: 'auto', paddingRight: '4px' }}>
                                    {missionForm.steps.map((step, idx) => (
                                        <MissionStepCard
                                            key={idx}
                                            step={step}
                                            idx={idx}
                                            total={missionForm.steps.length}
                                            onChange={handleUpdateMissionStep}
                                            onDelete={handleDeleteMissionStep}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mission Dialog Footer */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '14px', marginTop: '4px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                            onClick={() => setMissionDialogOpen(false)}
                            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '7px', padding: '8px 16px', fontSize: '13px', color: '#9ca3af', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleMissionSave}
                            disabled={loading || !missionForm.title}
                            style={{
                                background: loading || !missionForm.title ? 'rgba(245,158,11,0.3)' : 'linear-gradient(135deg, #d97706, #b45309)',
                                border: '1px solid rgba(251,191,36,0.3)',
                                borderRadius: '7px', padding: '8px 20px', fontSize: '13px', fontWeight: '700',
                                color: loading || !missionForm.title ? '#9ca3af' : '#fff',
                                cursor: loading || !missionForm.title ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                        >
                            {loading && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />}
                            <Compass size={13} /> Create Mission
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MapManager;