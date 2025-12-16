import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { products as seedProducts } from "@/data/products";

const untypedSupabase = supabase as any;

export default function ReferDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [referral, setReferral] = useState<any | null>(null);
  const [refs, setRefs] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [bank, setBank] = useState({ account_name: "", account_number: "", ifsc: "", bank_name: "" });
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [isRequestingWithdraw, setIsRequestingWithdraw] = useState(false);
  const [withdrawalsHistory, setWithdrawalsHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchProducts();
    fetchReferralData();

    // subscribe to referral_withdrawals for this user to get realtime updates
    const wChannel = supabase
      .channel(`withdrawals:user=${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'referral_withdrawals', filter: `user_id=eq.${user.id}` }, () => {
        fetchWithdrawalsHistory();
      })
      .subscribe();

    const channel = supabase
      .channel(`referrals:user=${user.email}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'referrals', filter: `referrer_email=eq.${user.email}` }, () => {
        fetchReferralData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      try { supabase.removeChannel(wChannel); } catch (e) {}
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchWithdrawalsHistory();
  }, [user]);

  const fetchProducts = async () => {
    try {
      const { data } = await supabase.from('products').select('id,name,slug,price,images').order('created_at', { ascending: false }).limit(12);
      if (data && data.length) setProducts(data);
      else setProducts(seedProducts.slice(0, 12));
    } catch (err) {
      setProducts(seedProducts.slice(0, 12));
    }
  };

  const fetchReferralData = async () => {
    setLoading(true);
    try {
      const { data: codes } = await supabase.from('referrals').select('*').eq('referrer_email', user?.email).order('created_at', { ascending: false });
      setRefs(codes || []);
      const first = (codes && codes[0]) || null;
      setReferral(first);
      // Don't auto-store user's own referral code to prevent self-referral issues

      const { data: account } = await untypedSupabase.from('referral_accounts').select('*').eq('user_id', user?.id).maybeSingle();
      if (account) setBank({ account_name: account.account_name || '', account_number: account.account_number || '', ifsc: account.ifsc || '', bank_name: account.bank_name || '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawalsHistory = async () => {
    if (!user) return;
    try {
      const { data } = await untypedSupabase.from('referral_withdrawals').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setWithdrawalsHistory(data || []);
    } catch (err) {
      console.error('Could not fetch withdrawals history', err);
    }
  };

  const saveBankDetails = async () => {
    if (!user) return;
    setIsSavingBank(true);
    try {
      // quick check to provide clearer error if table/migration isn't applied
      try {
        const { error: testError } = await untypedSupabase.from('referral_accounts').select('id').limit(1);
        if (testError) {
          console.error('referral_accounts check error', testError);
          throw testError;
        }
      } catch (tblErr: any) {
        // Table likely doesn't exist or permission issue
        toast({ title: 'Database Error', description: 'Referral accounts table missing or inaccessible. Apply migrations.', variant: 'destructive' });
        console.error('Referral accounts table check failed:', tblErr);
        setIsSavingBank(false);
        return;
      }
      const payload = { user_id: user.id, ...bank };
      const { error } = await untypedSupabase.from('referral_accounts').upsert(payload, { onConflict: 'user_id' });
      if (error) {
        console.error('Upsert error', error);
        toast({ title: 'Error', description: error.message || 'Could not save bank details.', variant: 'destructive' });
      } else {
        toast({ title: 'Saved', description: 'Bank details saved.' });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: (err as any)?.message || 'Could not save bank details.', variant: 'destructive' });
    } finally {
      setIsSavingBank(false);
    }
  };

  const requestWithdraw = async (amount: number) => {
    if (!user) return;
    if (amount <= 0) return toast({ title: 'Invalid', description: 'Invalid amount' });
    setIsRequestingWithdraw(true);
    try {
      if (amount < 999) return toast({ title: 'Minimum', description: 'Minimum withdrawal is ₹999', variant: 'destructive' });
      const { error } = await untypedSupabase.from('referral_withdrawals').insert({ user_id: user.id, amount, status: 'pending', created_at: new Date().toISOString() });
      if (error) throw error;
      toast({ title: 'Requested', description: 'Withdrawal requested.' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Could not request withdrawal.', variant: 'destructive' });
    } finally {
      setIsRequestingWithdraw(false);
    }
  };

  if (!user) return <div className="p-12">Please sign in to view your referrals.</div>;

  const totalEarned = refs.reduce((s, r) => s + (r.reward_amount || 0), 0);
  const available = refs.reduce((s, r) => {
    // Consider referrals with delivered/out_for_delivery/completed as available
    if (['delivered','out_for_delivery','completed'].includes(r.status)) return s + (r.reward_amount || 0);
    return s;
  }, 0);
  const sumApprovedWithdrawals = withdrawalsHistory.reduce((s, w) => s + ((w.status === 'approved' && w.amount) ? w.amount : 0), 0);
  const availableAfterWithdrawals = Math.max(0, available - sumApprovedWithdrawals);

  const pending = totalEarned - available;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Refer & Earn</h1>
        <p className="text-muted-foreground">Invite friends, earn ₹49 when they complete delivery (₹111 for combo products). Permanent code is created for your account.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <h3 className="font-semibold">Your Referral Code</h3>
          <div className="mt-2">
            <div className="font-mono text-lg">{referral?.referral_code || '—'}</div>
            <div className="text-sm text-muted-foreground mt-1">Share this code or use the share buttons below. It is permanent.</div>
          </div>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold">Available Balance</h3>
          <div className="text-2xl font-bold mt-2">₹{availableAfterWithdrawals.toLocaleString()}</div>
          {sumApprovedWithdrawals > 0 && <div className="text-xs text-muted-foreground mt-1">(₹{sumApprovedWithdrawals} withdrawn)</div>}
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold">Pending</h3>
          <div className="text-2xl font-bold mt-2">₹{pending.toLocaleString()}</div>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mt-6 mb-4">Share Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <Card key={p.id} className="p-4 flex flex-col">
              <div className="flex-1">
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-muted-foreground">₹{p.price?.toLocaleString?.() || p.price}</div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" onClick={() => {
                  if (!referral?.referral_code) return toast({ title: 'No code', description: 'Generate a referral code first.' });
                  const url = `${window.location.origin}/product/${p.slug}?ref=${referral.referral_code}`;
                  navigator.clipboard.writeText(url);
                  toast({ title: 'Copied', description: 'Share URL copied to clipboard' });
                }}>Share</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mt-6 mb-4">Bank Details & Withdrawals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Account Name</label>
                <Input value={bank.account_name} onChange={(e) => setBank({ ...bank, account_name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium">Account Number</label>
                <Input value={bank.account_number} onChange={(e) => setBank({ ...bank, account_number: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium">IFSC</label>
                <Input value={bank.ifsc} onChange={(e) => setBank({ ...bank, ifsc: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium">Bank Name</label>
                <Input value={bank.bank_name} onChange={(e) => setBank({ ...bank, bank_name: e.target.value })} />
              </div>
              <div className="flex justify-end">
                <Button onClick={saveBankDetails} disabled={isSavingBank}>{isSavingBank ? 'Saving...' : 'Save Bank Details'}</Button>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold">Available to Withdraw</h3>
            <div className="text-2xl font-bold">₹{available.toLocaleString()}</div>
            <div className="mt-4">
              <Button onClick={() => requestWithdraw(availableAfterWithdrawals)} disabled={isRequestingWithdraw || availableAfterWithdrawals <= 0}>{isRequestingWithdraw ? 'Requesting...' : 'Request Withdrawal'}</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Withdrawals mature 30 days after referral completion. Admin approval required.</p>
            {withdrawalsHistory.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Withdrawals History</h4>
                <div className="space-y-2 text-sm">
                  {withdrawalsHistory.map((w) => (
                    <div key={w.id} className="p-2 rounded-md bg-secondary/10">
                      <div className="flex justify-between">
                        <div>₹{w.amount} • <span className="capitalize">{w.status}</span></div>
                        <div className="text-muted-foreground text-xs">{new Date(w.created_at).toLocaleDateString()}</div>
                      </div>
                      {w.processed_at && <div className="text-xs text-muted-foreground">Processed: {new Date(w.processed_at).toLocaleString()} by {w.processed_by || 'admin'}</div>}
                      {w.reason && <div className="text-xs text-rose-500">Reason: {w.reason}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mt-6 mb-4">Rules & Regulations</h2>
        <ul className="list-disc pl-6 text-sm space-y-2">
          <li>Reward per successful referral: ₹49 after delivery confirmation (₹111 for combo product referrals).</li>
          <li>Referral codes are permanent and tied to your account.</li>
          <li>Referral earnings mature 30 days after order delivery, or immediately when status is 'out_for_delivery'/'delivered'.</li>
                      <li>Referral earnings become available once an admin marks the referral as completed or when order status shows 'out_for_delivery'/'delivered'.</li>
          <li>Withdrawals require admin approval and may take 3-7 business days.</li>
          <li>Minimum withdrawal amount: ₹999.</li>
          <li>Abuse or self-referrals are prohibited and may result in forfeiture.</li>
        </ul>
      </div>
    </div>
  );
}
