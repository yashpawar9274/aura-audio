import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function useOrderAnnouncements() {
  useEffect(() => {
    const channel = supabase
      .channel("orders-listener")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          try {
            const audio = new Audio("/announce.mp3");
            audio.play();
          } catch (err) {
            console.warn("Audio play blocked");
          }

          toast.success("New order received!");
          console.log("New order:", payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
