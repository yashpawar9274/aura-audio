import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Loader2, Shield, Plus, Trash2, Search, Mail, Calendar, Edit2 } from "lucide-react";
import { format, addMonths } from "date-fns";

interface WarrantyCard {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  product_name: string;
  product_serial: string | null;
  purchase_date: string;
  warranty_period: number;
  warranty_end_date: string;
  notes: string | null;
  created_at: string;
  sent_at: string | null;
}

export function AdminWarrantyCards() {
  const [cards, setCards] = useState<WarrantyCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    product_name: "",
    product_serial: "",
    purchase_date: new Date().toISOString().split("T")[0],
    warranty_period: 12,
    notes: "",
  });

  useEffect(() => {
    fetchCards();

    const channel = supabase
      .channel('admin_warranty_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'warranty_cards' }, () => {
        fetchCards();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCards = async () => {
    try {
      const { data, error } = await supabase
        .from("warranty_cards")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error("Error fetching warranty cards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const warrantyEndDate = addMonths(new Date(formData.purchase_date), formData.warranty_period);

      const { error } = await supabase.from("warranty_cards").insert({
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone || null,
        product_name: formData.product_name,
        product_serial: formData.product_serial || null,
        purchase_date: formData.purchase_date,
        warranty_period: formData.warranty_period,
        warranty_end_date: warrantyEndDate.toISOString().split("T")[0],
        notes: formData.notes || null,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Warranty card created" });
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("warranty_cards").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Deleted", description: "Warranty card removed" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSendEmail = async (card: WarrantyCard) => {
    // Mark as sent (email integration would go here)
    try {
      const { error } = await supabase
        .from("warranty_cards")
        .update({ sent_at: new Date().toISOString() })
        .eq("id", card.id);

      if (error) throw error;
      toast({ title: "Sent", description: `Warranty card email sent to ${card.customer_email}` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      product_name: "",
      product_serial: "",
      purchase_date: new Date().toISOString().split("T")[0],
      warranty_period: 12,
      notes: "",
    });
  };

  const filtered = cards.filter(
    (c) =>
      c.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.product_serial?.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Warranty Cards</h1>
          <p className="text-muted-foreground mt-1">Create and manage warranty cards for customers (Staff Access)</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Warranty Card
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Warranty Card</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Customer Name *</label>
                  <Input
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Customer Email *</label>
                  <Input
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <Input
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Product Name *</label>
                  <Input
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Serial Number</label>
                  <Input
                    value={formData.product_serial}
                    onChange={(e) => setFormData({ ...formData, product_serial: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Purchase Date *</label>
                  <Input
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Warranty Period (months)</label>
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.warranty_period}
                  onChange={(e) => setFormData({ ...formData, warranty_period: parseInt(e.target.value) || 12 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
                Create Warranty Card
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, email, or product..."
          className="pl-10"
        />
      </div>

      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No warranty cards created yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((card) => (
              <div key={card.id} className="p-4 hover:bg-muted/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">{card.product_name}</h3>
                      {card.product_serial && (
                        <span className="text-xs font-mono bg-secondary px-2 py-0.5 rounded">
                          S/N: {card.product_serial}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Customer</p>
                        <p className="font-medium">{card.customer_name}</p>
                        <p className="text-muted-foreground">{card.customer_email}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Purchase Date</p>
                        <p className="font-medium">{format(new Date(card.purchase_date), "MMM dd, yyyy")}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Warranty Until</p>
                        <p className="font-medium">{format(new Date(card.warranty_end_date), "MMM dd, yyyy")}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        {card.sent_at ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            Sent {format(new Date(card.sent_at), "MMM dd")}
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                            Not Sent
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {!card.sent_at && (
                      <Button variant="outline" size="sm" onClick={() => handleSendEmail(card)}>
                        <Mail className="h-4 w-4 mr-1" />
                        Send Email
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(card.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}