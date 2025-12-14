import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function AdminStaffEarnings() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      // Get list of staff (profiles with roles)
      const { data: roles } = await supabase.from("user_roles").select("user_id, role").eq("role", "admin");
      const staffIds = roles?.map((r: any) => r.user_id) || [];

      const results: any[] = [];
      for (const id of staffIds) {
        const { data: profile } = await supabase.from("profiles").select("id, full_name, email").eq("id", id).maybeSingle();
        const { data: countData } = await supabase.from("warranty_cards").select("id", { count: "exact" }).eq("created_by", id);
        const count = countData?.length || 0;

        // Sum order totals for warranty cards linked to orders created by this staff
        const { data: cards } = await supabase.from("warranty_cards").select("order_id").eq("created_by", id);
        let sum = 0;
        if (cards && cards.length) {
          for (const c of cards) {
            if (c.order_id) {
              const { data: ord } = await supabase.from("orders").select("total").eq("id", c.order_id).maybeSingle();
              if (ord?.total) sum += ord.total;
            }
          }
        }

        results.push({ profile, warrantyCount: count, earningsTotal: sum });
      }

      setRows(results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Staff Earnings</h1>
        <p className="text-muted-foreground mt-1">Earnings and warranty activity for staff-generated sales</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => (
          <Card key={r.profile?.id} className="p-4">
            <h3 className="font-semibold">{r.profile?.full_name || r.profile?.email}</h3>
            <p className="text-sm text-muted-foreground">Warranty Cards: {r.warrantyCount}</p>
            <p className="text-sm text-muted-foreground">Earnings (orders): ₹{(r.earningsTotal).toLocaleString()}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
