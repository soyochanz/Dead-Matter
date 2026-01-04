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
    const [newChange, setNewChange] = useState({ author: '', message: '' });
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
            setNewChange({ author: '', message: '' });
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
            
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 space-y-4">
                <h3 className="text-lg font-semibold">Add New Change</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <Input
                        placeholder="Author Name"
                        value={newChange.author}
                        onChange={(e) => setNewChange({ ...newChange, author: e.target.value })}
                        className="bg-gray-800 border-gray-600 text-white"
                    />
                    <Textarea
                        placeholder="Message / Commit Description"
                        value={newChange.message}
                        onChange={(e) => setNewChange({ ...newChange, message: e.target.value })}
                        className="bg-gray-800 border-gray-600 text-white md:col-span-2"
                    />
                </div>
                <Button onClick={handleAddChange} className="w-full md:w-auto">
                    <Plus className="w-4 h-4 mr-2" /> Add Change
                </Button>
            </div>

            <div className="space-y-4">
                {changes.length === 0 ? (
                    <p className="text-gray-400 text-center">No micro changes recorded yet.</p>
                ) : (
                    changes.map((change) => (
                        <div key={change.id} className="bg-gray-800/40 p-4 rounded-md border border-gray-700 flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-red-400">{change.author}</span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(change.created_at).toLocaleDateString()} {new Date(change.created_at).toLocaleTimeString()}
                                    </span>
                                </div>
                                <p className="text-gray-300 whitespace-pre-wrap">{change.message}</p>
                            </div>
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => handleDeleteChange(change.id)}
                                className="shrink-0"
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
