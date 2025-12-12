import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, Loader2, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface NotifyMeButtonProps {
  productId?: string;
  productName?: string;
}

export function NotifyMeButton({ productId, productName }: NotifyMeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from("notify_me").insert({
        email,
        name: name || null,
        product_id: productId || null,
        product_name: productName || "General Updates",
      });

      if (error) throw error;

      setIsSubscribed(true);
      toast({ title: "Success!", description: "We'll notify you when this launches!" });
      setTimeout(() => {
        setIsOpen(false);
        setIsSubscribed(false);
        setEmail("");
        setName("");
      }, 2000);
    } catch (error: any) {
      console.error("Error subscribing:", error);
      toast({ title: "Error", description: "Could not subscribe. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Bell className="h-4 w-4" />
          Notify Me
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Get Notified</DialogTitle>
          <DialogDescription>
            {productName 
              ? `Be the first to know when ${productName} launches!`
              : "Subscribe to get notified about new products and launches."
            }
          </DialogDescription>
        </DialogHeader>

        {isSubscribed ? (
          <div className="flex flex-col items-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-lg font-medium">You're all set!</p>
            <p className="text-muted-foreground">We'll email you when it's available.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name (Optional)</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Subscribing...
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Notify Me
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}