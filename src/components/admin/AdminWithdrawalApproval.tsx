import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
  processed_at?: string;
  user_email?: string;
}

export function AdminWithdrawalApproval() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchWithdrawals();
    const subscription = supabase
      .channel("withdrawals")
      .on("postgres_changes", { event: "*", schema: "public", table: "referral_withdrawals" }, () => {
        fetchWithdrawals();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const { data, error } = await supabase
        .from("referral_withdrawals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user emails
      const enrichedData = await Promise.all(
        (data || []).map(async (w) => {
          const { data: user } = await supabase.auth.admin.getUserById(w.user_id);
          return {
            ...w,
            user_email: user?.user?.email || "Unknown",
          };
        })
      );

      setWithdrawals(enrichedData);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      toast({ title: "Error", description: "Failed to load withdrawals", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const approveWithdrawal = async (id: string, userId: string, amount: number) => {
    setProcessingId(id);
    try {
      // Update withdrawal status
      const { error: updateErr } = await supabase
        .from("referral_withdrawals")
        .update({
          status: "completed",
          processed_at: new Date().toISOString(),
          processed_by: "admin",
        })
        .eq("id", id);

      if (updateErr) throw updateErr;

      // Deduct from user's balance
      const { data: account } = await supabase
        .from("referral_accounts")
        .select("balance")
        .eq("user_id", userId)
        .maybeSingle();

      if (account) {
        await supabase
          .from("referral_accounts")
          .update({ balance: Math.max(0, (account.balance || 0) - (amount / 20)) })
          .eq("user_id", userId);
      }

      toast({ title: "Success", description: "Withdrawal approved" });
      fetchWithdrawals();
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve withdrawal", variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  const rejectWithdrawal = async (id: string) => {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from("referral_withdrawals")
        .update({
          status: "rejected",
          processed_at: new Date().toISOString(),
          processed_by: "admin",
        })
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Success", description: "Withdrawal rejected" });
      fetchWithdrawals();
    } catch (error) {
      toast({ title: "Error", description: "Failed to reject withdrawal", variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-bold">Withdrawal Requests</h2>
            <p className="text-muted-foreground">Manage user withdrawal requests</p>
          </div>
          {withdrawals.filter(w => w.status === "pending").length > 0 && (
            <Badge variant="destructive" className="h-fit text-base px-3 py-1">
              {withdrawals.filter(w => w.status === "pending").length} Pending
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {withdrawals.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No withdrawal requests
            </CardContent>
          </Card>
        ) : (
          <>
            {withdrawals.filter(w => w.status === "pending").length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-yellow-700 bg-yellow-50 p-3 rounded-lg flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pending Requests
                </h3>
                {withdrawals.filter(w => w.status === "pending").map((w) => (
                  <Card key={w.id} className="border-yellow-200 bg-yellow-50/30">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">₹{(w.amount / 100).toLocaleString()}</CardTitle>
                          <CardDescription>{w.user_email}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(w.status)}
                          <span className="text-sm font-medium capitalize">{w.status}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Requested: {new Date(w.created_at).toLocaleDateString()}
                        </span>
                        {w.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectWithdrawal(w.id)}
                              disabled={processingId === w.id}
                            >
                              {processingId === w.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reject"}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => approveWithdrawal(w.id, w.user_id, w.amount)}
                              disabled={processingId === w.id}
                            >
                              {processingId === w.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {withdrawals.filter(w => w.status !== "pending").length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-600 bg-gray-50 p-3 rounded-lg">
                  Processed Requests
                </h3>
                {withdrawals.filter(w => w.status !== "pending").map((w) => (
                  <Card key={w.id} className="opacity-75">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">₹{(w.amount / 100).toLocaleString()}</CardTitle>
                          <CardDescription>{w.user_email}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(w.status)}
                          <span className="text-sm font-medium capitalize">{w.status}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <span className="text-sm text-muted-foreground">
                        Processed: {w.processed_at ? new Date(w.processed_at).toLocaleDateString() : "N/A"}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
