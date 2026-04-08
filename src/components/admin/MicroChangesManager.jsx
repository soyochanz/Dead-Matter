import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/mySupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Trash2, Plus, Save } from 'lucide-react';

const MicroChangesManager = () => {
    const [changes, setChanges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newChange, setNewChange] = useState({ author: '', message: '', category: '', commit_hash: '' });
    const { toast } = useToast();

    useEffect(() => {
        fetchChanges();
    }, []);

    const fetchChanges = async () => {
        try {
            const { data, error } = await supabase
                .from('micro_changes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setChanges(data || []);
        } catch (error) {
            console.error('Error fetching micro changes:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load micro changes.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddChange = async () => {
        if (!newChange.author || !newChange.message) {
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Please fill in both Author and Message fields.',
            });
            return;
        }

        try {
            const { data, error } = await supabase
                .from('micro_changes')
                .insert([newChange])
                .select();

            if (error) throw error;

            setChanges([data[0], ...changes]);
            setNewChange({ author: '', message: '', category: '', commit_hash: '' });
            toast({
                title: 'Success',
                description: 'Micro change added successfully.',
            });
        } catch (error) {
            console.error('Error adding micro change:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to add micro change.',
            });
        }
    };

    const handleDeleteChange = async (id) => {
        try {
            const { error } = await supabase
                .from('micro_changes')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setChanges(changes.filter(change => change.id !== id));
            toast({
                title: 'Success',
                description: 'Micro change deleted successfully.',
            });
        } catch (error) {
            console.error('Error deleting micro change:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete micro change.',
            });
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-white" /></div>;
    }

    return (
        <div className="space-y-6 text-white">
            <h2 className="text-2xl font-bold mb-4">Micro Changes (Commits)</h2>
            
            <div className="bg-gray-900/50 p-6 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-lg font-semibold">Add New Change</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <Input
                        placeholder="Author Name"
                        value={newChange.author}
                        onChange={(e) => setNewChange({ ...newChange, author: e.target.value })}
                        className="bg-gray-800 border-gray-600 text-white"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            placeholder="Category (optional)"
                            value={newChange.category}
                            onChange={(e) => setNewChange({ ...newChange, category: e.target.value })}
                            className="bg-gray-800 border-gray-600 text-white"
                        />
                        <Input
                            placeholder="Commit Hash (optional)"
                            value={newChange.commit_hash}
                            onChange={(e) => setNewChange({ ...newChange, commit_hash: e.target.value })}
                            className="bg-gray-800 border-gray-600 text-white"
                        />
                    </div>
                    <Textarea
                        placeholder="Message / Commit Description"
                        value={newChange.message}
                        onChange={(e) => setNewChange({ ...newChange, message: e.target.value })}
                        className="bg-gray-800 border-gray-600 text-white md:col-span-2"
                    />
                </div>
                <Button onClick={handleAddChange} className="w-full md:w-auto bg-red-600 hover:bg-red-500">
                    <Plus className="w-4 h-4 mr-2" /> Add Change
                </Button>
            </div>

            <div className="space-y-4">
                {changes.length === 0 ? (
                    <p className="text-gray-400 text-center">No micro changes recorded yet.</p>
                ) : (
                    changes.map((change) => (
                        <div key={change.id} className="bg-gray-800/40 p-4 rounded-xl border border-white/5 flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <span className="font-bold text-red-500">{change.author}</span>
                                    {change.category && (
                                        <span className="px-1.5 py-0.5 bg-red-600/10 text-red-400 text-[10px] font-black uppercase rounded border border-red-500/10">
                                            {change.category}
                                        </span>
                                    )}
                                    {change.commit_hash && (
                                        <span className="text-[10px] font-mono text-blue-400">
                                            #{change.commit_hash}
                                        </span>
                                    )}
                                    <span className="text-[10px] text-gray-500 font-medium">
                                        {new Date(change.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-gray-300 whitespace-pre-wrap text-sm">{change.message}</p>
                            </div>
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => handleDeleteChange(change.id)}
                                className="shrink-0 rounded-lg hover:bg-red-600/20 hover:text-red-500 bg-transparent border border-white/5"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MicroChangesManager;
