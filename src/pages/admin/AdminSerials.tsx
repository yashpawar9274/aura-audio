import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Loader2, Plus, Trash2, Edit2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function AdminSerials() {
  const { user } = useAuth();
  const [serials, setSerials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSerial, setNewSerial] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSerials();

    const channel = supabase
      .channel('admin_serials_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'serial_numbers' }, () => fetchSerials())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchSerials = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('serial_numbers').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error(error);
    } else {
      setSerials(data || []);
    }
    setIsLoading(false);
  };

  const handleAdd = async (e?: Event) => {
    e?.preventDefault?.();
    if (!newSerial.trim()) return toast({ title: 'Invalid', description: 'Serial cannot be empty', variant: 'destructive' });
    setIsSaving(true);
    const payload = {
      serial: newSerial.trim(),
      created_by: user?.id || null,
    };
    const { error } = await supabase.from('serial_numbers').insert(payload);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Added', description: 'Serial added' });
      setNewSerial("");
      setIsDialogOpen(false);
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this serial?')) return;
    const { error } = await supabase.from('serial_numbers').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else toast({ title: 'Deleted' });
  };

  if (isLoading) return <div className="py-12 text-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Serial Numbers</h1>
          <p className="text-muted-foreground mt-1">Manage product serials and warranty assignments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Serial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Serial Number</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleAdd(e as unknown as Event); }} className="space-y-4">
              <Input value={newSerial} onChange={(e) => setNewSerial((e.target as HTMLInputElement).value)} placeholder="Serial number" />
              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Add'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Serial</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Sold</TableHead>
              <TableHead>Warranty Until</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {serials.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono text-sm">{s.serial}</TableCell>
                <TableCell>{s.product_name || '-'}</TableCell>
                <TableCell>{s.is_sold ? `Yes (${s.sold_at || '-'})` : 'No'}</TableCell>
                <TableCell>{s.warranty_end_date || '-'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" onClick={() => navigator.clipboard.writeText(s.serial)} title="Copy"><Edit2 className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(s.id)} title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
