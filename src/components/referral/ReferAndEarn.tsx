import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Copy, Check, Loader2, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function ReferAndEarn() {
  const [step, setStep] = useState<"form" | "code">("form");
  const [referrerName, setReferrerName] = useState("");
  const [referrerEmail, setReferrerEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "REF-";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referrerEmail) return;

    setIsLoading(true);
    try {
      // Check for existing referral for this email
      const { data: existing } = await supabase.from("referrals").select("*").eq("referrer_email", referrerEmail).maybeSingle();
      if (existing && existing.referral_code) {
        setReferralCode(existing.referral_code);
        try { localStorage.setItem('referral_code', existing.referral_code); } catch (e) {}
        setStep("code");
        toast({ title: "Found", description: "Existing referral code loaded." });
      } else {
        const code = generateCode();
        const payload = {
          referrer_email: referrerEmail,
          referrer_name: referrerName || null,
          referred_email: "",
          referred_name: "",
          referral_code: code,
          status: "active",
          reward_amount: 49,
        };

        const { error } = await supabase.from("referrals").insert(payload);
        if (error) throw error;

        setReferralCode(code);
        try { localStorage.setItem('referral_code', code); } catch (e) {}
        setStep("code");
        toast({ title: "Success!", description: "Your referral code has been generated." });
      }
    } catch (error: any) {
      console.error("Error creating referral:", error);
      toast({ title: "Error", description: "Could not generate code. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = () => {
    const url = `${window.location.origin}/?ref=${referralCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast({ title: "Copied!", description: "Referral code copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Gift className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Refer & Earn</h3>
            <p className="text-muted-foreground">Share with friends and earn rewards!</p>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        {step === "form" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Users className="h-4 w-4" />
              <span>Get ₹500 credit when your friend makes a purchase!</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Your Name</label>
              <Input
                value={referrerName}
                onChange={(e) => setReferrerName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Your Email *</label>
              <Input
                type="email"
                value={referrerEmail}
                onChange={(e) => setReferrerEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Gift className="h-4 w-4 mr-2" />
                  Get My Referral Code
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">Share this code with your friends:</p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-2xl font-mono font-bold bg-secondary px-4 py-2 rounded-lg">
                {referralCode}
              </code>
              <Button variant="outline" size="icon" onClick={copyCode}>
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              When your friend uses this code at checkout, you'll both earn rewards!
            </p>
            <Button variant="outline" onClick={() => setStep("form")} className="mt-4">
              Generate New Code
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}