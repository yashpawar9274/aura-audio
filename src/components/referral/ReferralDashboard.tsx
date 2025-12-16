import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Copy, Check, CreditCard, TrendingUp, Wallet, ArrowUpRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ReferralData {
  code: string;
  balance: number;
  earned: number;
  referrals: number;
}

export function ReferralDashboard() {
  const { user } = useAuth();
  const [referral, setReferral] = useState<ReferralData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    account_name: "",
    account_number: "",
    ifsc: "",
    bank_name: "",
  });
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  useEffect(() => {
    if (user?.email) {
      fetchReferralData();
    }
  }, [user]);

  const fetchReferralData = async () => {
    if (!user?.id) return;
    
    try {
      // Get referral code
      const { data: refData } = await supabase
        .from("referrals")
        .select("referral_code")
        .eq("user_id", user.id)
        .maybeSingle() as Promise<{ data: { referral_code: string } | null; error: any }>;

      // Get account details from profiles table
      const { data: accData } = await supabase
        .from("profiles")
        .select("account_name, account_number, ifsc, bank_name")
        .eq("id", user.id)
        .maybeSingle();

      // Get referral balance
      const { data: balanceData } = await supabase
        .from("referral_balance")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle() as Promise<{ data: { balance: number } | null; error: any }>;

      // Get referral count
      const { count } = await supabase
        .from("referrals")
        .select("*", { count: "exact" })
        .eq("referrer_email", user.email)
        .eq("status", "completed");

      const balance = balanceData?.balance || 0;

      setReferral({
        code: refData?.referral_code || "N/A",
        balance: balance,
        earned: balance * 20, // Assuming 1 balance unit = ₹20
        referrals: count || 0,
      });

      if (accData) {
        setBankDetails({
          account_name: accData.account_name || "",
          account_number: accData.account_number || "",
          ifsc: accData.ifsc || "",
          bank_name: accData.bank_name || "",
        });
      }
    } catch (error) {
      console.error("Error fetching referral data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (!referral?.code) return;
    const url = `${window.location.origin}/?ref=${referral.code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast({ title: "Copied!", description: "Referral link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const saveBankDetails = async () => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          account_name: bankDetails.account_name,
          account_number: bankDetails.account_number,
          ifsc: bankDetails.ifsc,
          bank_name: bankDetails.bank_name,
        } as any)
        .eq("id", user.id);

      if (error) throw error;
      toast({ title: "Success", description: "Bank details saved" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save bank details", variant: "destructive" });
    }
  };

  const requestWithdrawal = async () => {
    if (!user?.id || !withdrawAmount) return;

    setIsSubmittingWithdraw(true);
    try {
      const amount = parseInt(withdrawAmount) * 20; // Convert to paise (₹20 per balance unit)
      
      const { error } = await supabase
        .from("referral_withdrawals")
        .insert({
          user_id: user.id,
          amount: amount,
          status: "pending",
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      toast({ title: "Success", description: "Withdrawal request submitted" });
      setWithdrawAmount("");
      fetchReferralData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit withdrawal", variant: "destructive" });
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  if (!referral) {
    return <div className="text-center p-8">No referral data found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Referral Code Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Your Referral Code
          </CardTitle>
          <CardDescription>Share this code with friends to earn rewards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-4 bg-secondary rounded-lg">
            <code className="text-xl font-mono font-bold flex-1">{referral.code}</code>
            <Button
              variant="outline"
              size="icon"
              onClick={copyReferralLink}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Share your code when products are purchased. You'll earn ₹49 per successful referral!
          </p>
        </CardContent>
      </Card>

      {/* Balance and Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{referral.balance}</div>
            <p className="text-xs text-muted-foreground">Available for withdrawal</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{referral.earned}</div>
            <p className="text-xs text-muted-foreground">All time earnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Successful Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referral.referrals}</div>
            <p className="text-xs text-muted-foreground">Friends who purchased</p>
          </CardContent>
        </Card>
      </div>

      {/* Bank Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Bank Details
          </CardTitle>
          <CardDescription>Add your bank details to withdraw earnings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Account Holder Name</label>
            <Input
              value={bankDetails.account_name}
              onChange={(e) => setBankDetails({ ...bankDetails, account_name: e.target.value })}
              placeholder="Your full name"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Account Number</label>
            <Input
              value={bankDetails.account_number}
              onChange={(e) => setBankDetails({ ...bankDetails, account_number: e.target.value })}
              placeholder="1234567890"
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Bank Name</label>
              <Input
                value={bankDetails.bank_name}
                onChange={(e) => setBankDetails({ ...bankDetails, bank_name: e.target.value })}
                placeholder="HDFC Bank"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">IFSC Code</label>
              <Input
                value={bankDetails.ifsc}
                onChange={(e) => setBankDetails({ ...bankDetails, ifsc: e.target.value })}
                placeholder="HDFC0001234"
                className="mt-1"
              />
            </div>
          </div>
          <Button onClick={saveBankDetails} className="w-full">Save Bank Details</Button>
        </CardContent>
      </Card>

      {/* Withdrawal Request */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Request Withdrawal
          </CardTitle>
          <CardDescription>Minimum withdrawal: ₹500 (25 balance units)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Amount (in ₹)</label>
            <Input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="500"
              min="500"
              step="100"
              className="mt-1"
            />
          </div>
          <Button 
            onClick={requestWithdrawal}
            disabled={!withdrawAmount || isSubmittingWithdraw || referral.balance < 25}
            className="w-full"
          >
            {isSubmittingWithdraw ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Request Withdrawal
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
