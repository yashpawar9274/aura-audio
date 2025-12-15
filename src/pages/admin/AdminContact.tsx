import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminContact() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    fetchTickets();

    const channel = supabase
      .channel("support_tickets")
      .on("postgres_changes", { event: "*", schema: "public", table: "support_tickets" }, (payload) => {
        // refetch on any change for simplicity
        fetchTickets();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setTickets(data || []);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Could not load tickets", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const startReply = (id: string, existing = "") => {
    setReplyingTo(id);
    setReplyText(existing || "");
  };

  const sendReply = async () => {
    if (!replyingTo) return;
    try {
      const payload: any = { response: replyText, status: "responded", responded_at: new Date().toISOString() };
      if (user?.id) payload.responded_by = user.id;
      const { error } = await supabase.from("support_tickets").update(payload).eq("id", replyingTo);
      if (error) throw error;
      toast({ title: "Sent", description: "Response saved and user will be notified." });
      setReplyingTo(null);
      setReplyText("");
      fetchTickets();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Could not send response.", variant: "destructive" });
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Mail className="h-5 w-5" /> Support Tickets</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          {tickets.map((t) => (
            <Card key={t.id} className="p-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t.subject || "No subject"}</div>
                    <div className="text-sm text-muted-foreground">From: {t.name} • {t.email} • {new Date(t.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{t.status || "new"}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">{t.message}</p>

                {replyingTo === t.id ? (
                  <div className="space-y-2">
                    <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" onClick={() => { setReplyingTo(null); setReplyText(""); }}>Cancel</Button>
                      <Button onClick={sendReply}>Send Reply</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => startReply(t.id, t.response || "")}>Reply</Button>
                    <Button variant="outline" onClick={() => supabase.from('support_tickets').update({ status: 'closed' }).eq('id', t.id).then(() => fetchTickets())}>Close</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
