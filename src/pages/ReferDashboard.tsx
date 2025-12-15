import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { products as seedProducts } from "@/data/products";

export default function ReferDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [referral, setReferral] = useState<any | null>(null);
  const [refs, setRefs] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [bank, setBank] = useState({ account_name: "", account_number: "", ifsc: "", bank_name: "" });
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [isRequestingWithdraw, setIsRequestingWithdraw] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchProducts();
    fetchReferralData();

    const channel = supabase
      .channel(`referrals:user=${user.email}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'referrals', filter: `referrer_email=eq.${user.email}` }, () => {
        fetchReferralData();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
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
      if (first?.referral_code) {
        try { localStorage.setItem('referral_code', first.referral_code); } catch (e) {}
      }

      const { data: account } = await supabase.from('referral_accounts').select('*').eq('user_id', user?.id).maybeSingle();
      if (account) setBank({ account_name: account.account_name || '', account_number: account.account_number || '', ifsc: account.ifsc || '', bank_name: account.bank_name || '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveBankDetails = async () => {
    if (!user) return;
    setIsSavingBank(true);
    try {
      const payload = { user_id: user.id, ...bank };
      const { error } = await supabase.from('referral_accounts').upsert(payload, { onConflict: 'user_id' });
      if (error) throw error;
      toast({ title: 'Saved', description: 'Bank details saved.' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Could not save bank details.', variant: 'destructive' });
    } finally {
      setIsSavingBank(false);
    }
  };

  const requestWithdraw = async (amount: number) => {
    if (!user) return;
    if (amount <= 0) return toast({ title: 'Invalid', description: 'Invalid amount' });
    setIsRequestingWithdraw(true);
    try {
      const { error } = await supabase.from('referral_withdrawals').insert({ user_id: user.id, amount, status: 'pending', created_at: new Date().toISOString() });
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
    if (['delivered','out_for_delivery'].includes(r.status)) return s + (r.reward_amount || 0);
    if (r.status === 'completed' && r.completed_at) {
      const completed = new Date(r.completed_at);
      const matured = new Date(completed.getTime() + 30 * 24 * 60 * 60 * 1000);
      if (matured <= new Date()) return s + (r.reward_amount || 0);
    }
    return s;
  }, 0);

  const pending = totalEarned - available;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Refer & Earn</h1>
        <p className="text-muted-foreground">Invite friends, earn ₹99 when they complete delivery. Permanent code is created for your account.</p>
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
          <div className="text-2xl font-bold mt-2">₹{available.toLocaleString()}</div>
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
              <Button onClick={() => requestWithdraw(available)} disabled={isRequestingWithdraw || available <= 0}>{isRequestingWithdraw ? 'Requesting...' : 'Request Withdrawal'}</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Withdrawals mature 30 days after referral completion. Admin approval required.</p>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mt-6 mb-4">Rules & Regulations</h2>
        <ul className="list-disc pl-6 text-sm space-y-2">
          <li>Reward per successful referral: ₹99 after delivery confirmation.</li>
          <li>Referral codes are permanent and tied to your account.</li>
          <li>Referral earnings mature 30 days after order delivery, or immediately when status is 'out_for_delivery'/'delivered'.</li>
          <li>Withdrawals require admin approval and may take 3-7 business days.</li>
          <li>Minimum withdrawal amount: ₹500.</li>
          <li>Abuse or self-referrals are prohibited and may result in forfeiture.</li>
        </ul>
      </div>
    </div>
  );
}
