import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, Gift, Trash2, Search, Edit2, Check, X } from "lucide-react";
import { format } from "date-fns";

interface Referral {
  id: string;
  referrer_email: string;
  referrer_name: string | null;
  referred_email: string;
  referred_name: string | null;
  referral_code: string;
  status: string;
  reward_amount: number;
  created_at: string;
  completed_at: string | null;
}

export function AdminReferrals() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editReward, setEditReward] = useState(0);

  useEffect(() => {
    fetchReferrals();

    const channel = supabase
      .channel('admin_referrals_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'referrals' }, () => {
        fetchReferrals();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReferrals = async () => {
    try {
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReferrals(data || []);
    } catch (error) {
      console.error("Error fetching referrals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("referrals").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Deleted", description: "Referral removed" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const startEdit = (ref: Referral) => {
    setEditingId(ref.id);
    setEditStatus(ref.status);
    setEditReward(ref.reward_amount);
  };

  const handleSave = async (id: string) => {
    try {
      const { error } = await supabase
        .from("referrals")
        .update({
          status: editStatus,
          reward_amount: editReward,
          completed_at: editStatus === "completed" ? new Date().toISOString() : null,
        })
        .eq("id", id);

      if (error) throw error;
      setEditingId(null);
      toast({ title: "Updated", description: "Referral updated successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-blue-100 text-blue-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "completed": return "bg-green-100 text-green-700";
      case "expired": return "bg-gray-100 text-gray-700";
      default: return "bg-secondary text-foreground";
    }
  };

  const filtered = referrals.filter(
    (r) =>
      r.referrer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.referral_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.referred_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Referrals</h1>
        <p className="text-muted-foreground mt-1">Manage refer and earn program (Real-time)</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by email or code..."
          className="pl-10"
        />
      </div>

      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No referrals yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Code</th>
                  <th className="text-left p-4 font-medium">Referrer</th>
                  <th className="text-left p-4 font-medium">Referred</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Reward</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((ref) => (
                  <tr key={ref.id} className="hover:bg-muted/30">
                    <td className="p-4 font-mono font-medium">{ref.referral_code}</td>
                    <td className="p-4">
                      <p className="font-medium">{ref.referrer_email}</p>
                      {ref.referrer_name && <p className="text-sm text-muted-foreground">{ref.referrer_name}</p>}
                    </td>
                    <td className="p-4">
                      {ref.referred_email || <span className="text-muted-foreground">Not used yet</span>}
                    </td>
                    <td className="p-4">
                      {editingId === ref.id ? (
                        <Select value={editStatus} onValueChange={setEditStatus}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(ref.status)}`}>
                          {ref.status}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {editingId === ref.id ? (
                        <Input
                          type="number"
                          value={editReward}
                          onChange={(e) => setEditReward(parseInt(e.target.value) || 0)}
                          className="w-24"
                        />
                      ) : (
                        <span>₹{ref.reward_amount}</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {format(new Date(ref.created_at), "MMM dd, yyyy")}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {editingId === ref.id ? (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleSave(ref.id)}>
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setEditingId(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => startEdit(ref)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(ref.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}