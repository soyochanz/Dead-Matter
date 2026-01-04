import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/mySupabaseClient';
import { Loader2, Check, X, Trash2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const GuidesManager = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchGuides = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('guides')
      .select(`
        *,
        author:profiles(username),
        reports:guide_reports(count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching guides:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch guides.' });
    } else {
      setGuides(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchGuides();
  }, [fetchGuides]);

  const handleUpdateStatus = async (guideId, status) => {
    const { error } = await supabase.from('guides').update({ status }).eq('id', guideId);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: `Failed to ${status} guide.` });
    } else {
      toast({ title: 'Success', description: `Guide has been ${status}.` });
      fetchGuides();
    }
  };

  const handleDelete = async () => {
    if (!selectedGuide) return;
    const { error } = await supabase.from('guides').delete().eq('id', selectedGuide.id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete guide.' });
    } else {
      toast({ title: 'Success', description: 'Guide has been deleted.' });
      fetchGuides();
      setIsDeleteDialogOpen(false);
      setSelectedGuide(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div>;
  }

  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold mb-6">Manage Guides</h2>
      <div className="bg-gray-800/50 border border-white/10 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/5">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Author</th>
              <th className="p-4">Status</th>
              <th className="p-4">Reports</th>
              <th className="p-4">Created At</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {guides.map((guide) => (
              <tr key={guide.id} className="border-b border-white/10 hover:bg-white/5">
                <td className="p-4">{guide.title}</td>
                <td className="p-4">{guide.author?.username || 'Unknown'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    guide.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    guide.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {guide.status}
                  </span>
                </td>
                <td className="p-4 flex items-center">
                    {guide.reports[0]?.count > 0 ? (
                        <ShieldAlert className="text-yellow-400 mr-2 h-5 w-5"/>
                    ) : null}
                    {guide.reports[0]?.count || 0}
                </td>
                <td className="p-4">{new Date(guide.created_at).toLocaleDateString()}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {guide.status === 'pending' && (
                      <>
                        <Button size="sm" variant="outline" className="border-green-500 text-green-500 hover:bg-green-500/10" onClick={() => handleUpdateStatus(guide.id, 'approved')}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10" onClick={() => handleUpdateStatus(guide.id, 'rejected')}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => { setSelectedGuide(guide); setIsDeleteDialogOpen(true); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the guide "{selectedGuide?.title}".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GuidesManager;
