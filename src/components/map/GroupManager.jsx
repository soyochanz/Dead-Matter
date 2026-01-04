import React, { useState } from 'react';
import { supabase } from '@/lib/mySupabaseClient';
import { Loader2, Plus, Users, Copy, LogOut, Check } from 'lucide-react';

const GroupManager = ({ currentUser, groups, onGroupUpdate }) => {
    const [view, setView] = useState('list'); // 'list', 'create', 'join'
    const [formData, setFormData] = useState({ name: '', code: '' });
    const [loading, setLoading] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    const handleCopy = (code, id) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleCreateGroup = async () => {
        if (!formData.name.trim()) return;
        setLoading(true);
        // 1. Create Group
        const inviteCode = Math.random().toString(36).substring(2, 9).toUpperCase();
        const { data: group, error: createError } = await supabase
            .from('marker_groups')
            .insert({
                name: formData.name,
                owner_id: currentUser.id,
                invite_code: inviteCode
            })
            .select()
            .single();

        if (createError) {
            console.error(createError);
            alert("Error creating group");
            setLoading(false);
            return;
        }

        // 2. Add self as owner member
        const { error: memberError } = await supabase
            .from('marker_group_members')
            .insert({ group_id: group.id, user_id: currentUser.id, role: 'owner' });

        if (memberError) {
            console.error(memberError);
            alert("Error adding member");
        } else {
            setFormData({ name: '', code: '' });
            setView('list');
            onGroupUpdate();
        }
        setLoading(false);
    };

    const handleJoinGroup = async () => {
        if (!formData.code.trim()) return;
        setLoading(true);

        // Find group by code
        // Find group by code using secure RPC
        const { data: groupsFound, error: findError } = await supabase
            .rpc('lookup_group_by_invite', { code_text: formData.code });

        if (findError || !groupsFound || groupsFound.length === 0) {
            console.error(findError);
            alert("Group not found or invalid code");
            setLoading(false);
            return;
        }

        const group = groupsFound[0];

        // Join
        const { error: joinError } = await supabase
            .from('marker_group_members')
            .insert({ group_id: group.id, user_id: currentUser.id, role: 'member' });

        if (joinError) {
            console.error(joinError);
            if (joinError.code === '23505') alert("You are already in this group");
            else alert("Error joining group");
        } else {
            setFormData({ name: '', code: '' });
            setView('list');
            onGroupUpdate();
        }
        setLoading(false);
    };

    const handleLeaveGroup = async (groupId) => {
        if (!confirm("Leave this group?")) return;
        const { error } = await supabase
            .from('marker_group_members')
            .delete()
            .match({ group_id: groupId, user_id: currentUser.id });

        if (!error) {
            onGroupUpdate();
        } else {
            console.error(error);
            alert("Failed to leave group: " + error.message);
        }
    };

    if (view === 'create') {
        return (
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                <h3 className="font-bold text-sm">Create Group</h3>
                <input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Group Name"
                    className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                />
                <div className="flex gap-2">
                    <button onClick={() => setView('list')} className="flex-1 py-1.5 text-xs text-neutral-400 hover:text-white">Cancel</button>
                    <button onClick={handleCreateGroup} disabled={loading || !formData.name} className="flex-1 py-1.5 bg-blue-600 rounded text-xs font-bold disabled:opacity-50">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Create'}
                    </button>
                </div>
            </div>
        );
    }

    if (view === 'join') {
        return (
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                <h3 className="font-bold text-sm">Join Group</h3>
                <input
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Enter Invite Code"
                    className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                />
                <div className="flex gap-2">
                    <button onClick={() => setView('list')} className="flex-1 py-1.5 text-xs text-neutral-400 hover:text-white">Cancel</button>
                    <button onClick={handleJoinGroup} disabled={loading || !formData.code} className="flex-1 py-1.5 bg-green-600 rounded text-xs font-bold disabled:opacity-50">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Join'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <button onClick={() => setView('create')} className="flex-1 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2">
                    <Plus className="w-3 h-3" /> Create
                </button>
                <button onClick={() => setView('join')} className="flex-1 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-500/20 transition-colors flex items-center justify-center gap-2">
                    <Users className="w-3 h-3" /> Join
                </button>
            </div>

            <div className="space-y-2">
                {groups.map(g => (
                    <div key={g.id} className="p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-sm text-white">{g.name}</span>
                            <button onClick={() => handleLeaveGroup(g.id)} className="text-red-500/50 hover:text-red-500 p-1"><LogOut className="w-3 h-3" /></button>
                        </div>
                        <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded text-xs text-neutral-400">
                            <span className="font-mono select-all">{g.invite_code}</span>
                            <button onClick={() => handleCopy(g.invite_code, g.id)} className="ml-auto hover:text-white">
                                {copiedId === g.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GroupManager;
