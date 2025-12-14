import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft } from "lucide-react";
import { format } from "date-fns";

export default function AdminWarrantyCardView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [card, setCard] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [creator, setCreator] = useState<any | null>(null);
  const [order, setOrder] = useState<any | null>(null);

  useEffect(() => {
    if (id) fetchCard(id);
  }, [id]);

  const fetchCard = async (cardId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("warranty_cards").select("*").eq("id", cardId).maybeSingle();
      if (error) throw error;
      setCard(data || null);
      if (data?.created_by) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.created_by).maybeSingle();
        setCreator(profile || null);
      }
      if (data?.order_id) {
        const { data: ord } = await supabase.from("orders").select("*").eq("id", data.order_id).maybeSingle();
        setOrder(ord || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!card) return;
    // Open a print-only page in a new tab so only the warranty card is printed
    window.open(`/admin/warranty/print/${card.id}`, "_blank", "noopener,noreferrer");
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!card) return <div className="p-12 text-center">Warranty card not found. <br /><Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">Go Back</Button></div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-background rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Warranty Card</h2>
          <p className="text-sm text-muted-foreground">Customer warranty details and proof of purchase</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/warranty">
            <Button variant="ghost">
              <ChevronLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </Link>
          <Button onClick={handlePrint}>Download / Print</Button>
        </div>
      </div>

      <div id="warranty-card" className="p-6 border border-border rounded-lg bg-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold">AIRPODS Warranty</h3>
            <p className="text-xs text-muted-foreground">Warranty Card / Proof of Warranty</p>
          </div>
          <div className="text-right">
              <div className="text-sm">Issued: {format(new Date(card.created_at), "MMM dd, yyyy")}</div>
              <div className="text-sm">Valid Until: {card.warranty_end_date ? format(new Date(card.warranty_end_date), "MMM dd, yyyy") : "-"}</div>
            </div>
        </div>
        {creator ? (
          <div className="mb-4 p-3 border border-border rounded">
            <h4 className="font-semibold">Sold By (Staff)</h4>
            <p className="text-sm">{creator.full_name || creator.email}</p>
            <p className="text-xs text-muted-foreground">{creator.email}</p>
          </div>
        ) : (
          <div className="mb-4 p-3 border border-border rounded">
            <h4 className="font-semibold">Store</h4>
            <p className="text-sm">AIRPODS Store</p>
            <p className="text-xs text-muted-foreground">support@airpods.example</p>
          </div>
        )}

        {order && (
          <div className="mb-4 p-3 border border-border rounded">
            <h4 className="font-semibold">Order Summary</h4>
            <p className="text-sm">Order #: {order.order_number}</p>
            <p className="text-sm">Total: ₹{order.total?.toLocaleString?.() || order.total}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-muted-foreground text-xs">Customer</p>
            <p className="font-medium">{card.customer_name}</p>
            <p className="text-sm text-muted-foreground">{card.customer_email}</p>
            {card.customer_phone && <p className="text-sm text-muted-foreground">{card.customer_phone}</p>}
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Product</p>
            <p className="font-medium">{card.product_name}</p>
            {card.product_serial && <p className="text-sm text-muted-foreground">S/N: {card.product_serial}</p>}
            <p className="text-sm text-muted-foreground">Purchased: {format(new Date(card.purchase_date), "MMM dd, yyyy")}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-muted-foreground text-xs">Notes</p>
          <p className="text-sm">{card.notes || "-"}</p>
        </div>

        <div className="text-sm text-muted-foreground mt-6">This warranty is subject to terms and conditions. Retain this card for claiming warranty service.</div>
      </div>
    </div>
  );
}
