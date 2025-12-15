import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, X, Check, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CouponCodeProps {
  onApply: (discount: number, code: string) => void;
  onRemove: () => void;
  appliedCode: string | null;
}

export function CouponCode({ onApply, onRemove, appliedCode }: CouponCodeProps) {
  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [discount, setDiscount] = useState(0);

  const handleApply = async () => {
    if (!code.trim()) {
      toast({ title: "Error", description: "Please enter a coupon code", variant: "destructive" });
      return;
    }

    setIsValidating(true);
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("coupon_code, coupon_discount, coupon_active")
        .eq("id", "main")
        .maybeSingle();

      if (error) throw error;

      if (data?.coupon_active && data?.coupon_code?.toUpperCase() === code.toUpperCase()) {
        setDiscount(data.coupon_discount || 0);
        onApply(data.coupon_discount || 0, code.toUpperCase());
        toast({ title: "Success!", description: `Coupon applied: ${data.coupon_discount}% off` });
      } else {
        toast({ title: "Invalid Code", description: "This coupon code is not valid", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error validating coupon:", error);
      toast({ title: "Error", description: "Could not validate coupon", variant: "destructive" });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemove = () => {
    setCode("");
    setDiscount(0);
    onRemove();
    toast({ title: "Removed", description: "Coupon code removed" });
  };

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">
            <span className="font-mono">{appliedCode}</span> applied - {discount}% off
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleRemove} className="h-6 px-2">
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            className="pl-10 font-mono uppercase"
          />
        </div>
        <Button onClick={handleApply} disabled={isValidating} variant="outline">
          {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
        </Button>
      </div>
    </div>
  );
}