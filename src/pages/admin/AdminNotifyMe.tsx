import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Loader2, Bell, Trash2, Mail, Search } from "lucide-react";
import { format } from "date-fns";

interface NotifySubscription {
  id: string;
  email: string;
  name: string | null;
  product_name: string | null;
  created_at: string;
  notified: boolean;
  notified_at: string | null;
}

export function AdminNotifyMe() {
  const [subscriptions, setSubscriptions] = useState<NotifySubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSubscriptions();

    const channel = supabase
      .channel('admin_notify_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notify_me' }, () => {
        fetchSubscriptions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from("notify_me")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("notify_me").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Deleted", description: "Subscription removed" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleMarkNotified = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notify_me")
        .update({ notified: true, notified_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Updated", description: "Marked as notified" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const filtered = subscriptions.filter(
    (s) =>
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-3xl font-bold">Notify Me Subscribers</h1>
        <p className="text-muted-foreground mt-1">Manage product launch notification subscribers (Real-time)</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by email, name, or product..."
          className="pl-10"
        />
      </div>

      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No subscribers yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((sub) => (
              <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-muted/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{sub.email}</p>
                    {sub.notified && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        Notified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {sub.name || "Anonymous"} • {sub.product_name || "General"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Subscribed: {format(new Date(sub.created_at), "MMM dd, yyyy HH:mm")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!sub.notified && (
                    <Button variant="outline" size="sm" onClick={() => handleMarkNotified(sub.id)}>
                      <Mail className="h-4 w-4 mr-1" />
                      Mark Notified
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(sub.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}