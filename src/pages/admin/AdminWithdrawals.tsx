import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminWithdrawals() {
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchWithdrawals();
    const channel = supabase
      .channel('admin:withdrawals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'referral_withdrawals' }, () => fetchWithdrawals())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [isAdmin]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('referral_withdrawals')
        .select('id,user_id,amount,status,created_at,processed_at,reason')
        .order('created_at', { ascending: false })
        .limit(100);
      setWithdrawals(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const payload: any = { status, processed_at: new Date().toISOString(), processed_by: user?.email || user?.id };
      if (status === 'rejected') payload.reason = 'Rejected by admin';
      const { error } = await supabase.from('referral_withdrawals').update(payload).eq('id', id);
      if (error) throw error;
      toast({ title: 'Updated', description: `Withdrawal ${status}` });
      fetchWithdrawals();
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Could not update status', variant: 'destructive' });
    }
  };

  if (!isAdmin) return null;

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3"><DollarSign className="h-6 w-6"/> Withdrawals</h1>
        <p className="text-muted-foreground">Approve or reject referral withdrawal requests.</p>
      </div>

      <div className="bg-card rounded-2xl border border-border/50">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">Pending Requests</h2>
        </div>
        <div className="p-4">
          {withdrawals.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">No withdrawals</p>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((w) => (
                <div key={w.id} className="p-3 rounded-lg bg-secondary/30 flex items-center justify-between">
                  <div>
                    <p className="font-medium">User: {w.user_id}</p>
                    <p className="text-sm text-muted-foreground">Requested: ₹{w.amount}</p>
                    <p className="text-xs text-muted-foreground">{new Date(w.created_at).toLocaleString()}</p>
                    {w.reason && <p className="text-xs text-rose-500">{w.reason}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {w.status === 'pending' && (
                      <>
                        <Button variant="ghost" onClick={() => updateStatus(w.id, 'rejected')}>Reject</Button>
                        <Button onClick={() => updateStatus(w.id, 'approved')}>Approve</Button>
                      </>
                    )}
                    {w.status !== 'pending' && <div className="text-sm text-muted-foreground capitalize">{w.status}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
