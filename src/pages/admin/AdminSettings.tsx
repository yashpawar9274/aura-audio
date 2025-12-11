import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save, Tag, Megaphone, Layout } from "lucide-react";

interface SiteSettings {
  id: string;
  hero_title: string;
  hero_subtitle: string;
  show_upcoming_banner: boolean;
  announcement_text: string;
  announcement_active: boolean;
  coupon_code: string;
  coupon_discount: number;
  coupon_active: boolean;
}

export function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
    
    // Real-time subscription
    const channel = supabase
      .channel('admin_settings_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings' },
        () => fetchSettings()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", "main")
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({
          id: "main",
          hero_title: settings.hero_title,
          hero_subtitle: settings.hero_subtitle,
          show_upcoming_banner: settings.show_upcoming_banner,
          announcement_text: settings.announcement_text,
          announcement_active: settings.announcement_active,
          coupon_code: settings.coupon_code,
          coupon_discount: settings.coupon_discount,
          coupon_active: settings.coupon_active,
        });

      if (error) throw error;
      toast({ title: "Success", description: "Settings saved successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

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
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage site content and configuration (Real-time updates)</p>
      </div>

      <div className="max-w-2xl space-y-8">
        {/* Hero Section Settings */}
        <div className="bg-card rounded-2xl border border-border/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Layout className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Hero Section</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Hero Title</label>
              <Input
                value={settings?.hero_title || ""}
                onChange={(e) => setSettings({ ...settings!, hero_title: e.target.value })}
                placeholder="Pure Sound. Zero Noise."
              />
              <p className="text-xs text-muted-foreground mt-1">Use a period (.) to split into two lines</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hero Subtitle</label>
              <Textarea
                value={settings?.hero_subtitle || ""}
                onChange={(e) => setSettings({ ...settings!, hero_subtitle: e.target.value })}
                placeholder="Experience audio perfection..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
              <div>
                <p className="font-medium">Show Upcoming Product Banner</p>
                <p className="text-sm text-muted-foreground">
                  Display the "Coming Soon" badge in the hero section
                </p>
              </div>
              <Switch
                checked={settings?.show_upcoming_banner || false}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings!, show_upcoming_banner: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="bg-card rounded-2xl border border-border/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Megaphone className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Announcement Bar</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
              <div>
                <p className="font-medium">Enable Announcement</p>
                <p className="text-sm text-muted-foreground">
                  Show announcement bar at the top of the site
                </p>
              </div>
              <Switch
                checked={settings?.announcement_active || false}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings!, announcement_active: checked })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Announcement Text</label>
              <Input
                value={settings?.announcement_text || ""}
                onChange={(e) => setSettings({ ...settings!, announcement_text: e.target.value })}
                placeholder="Free shipping on orders above ₹5,000!"
              />
            </div>
          </div>
        </div>

        {/* Coupon Code Section */}
        <div className="bg-card rounded-2xl border border-border/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Tag className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Coupon Code Offer</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
              <div>
                <p className="font-medium">Enable Coupon Banner</p>
                <p className="text-sm text-muted-foreground">
                  Show coupon code offer in the hero section
                </p>
              </div>
              <Switch
                checked={settings?.coupon_active || false}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings!, coupon_active: checked })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Coupon Code</label>
                <Input
                  value={settings?.coupon_code || ""}
                  onChange={(e) => setSettings({ ...settings!, coupon_code: e.target.value.toUpperCase() })}
                  placeholder="SAVE20"
                  className="font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Discount (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={settings?.coupon_discount || 0}
                  onChange={(e) => setSettings({ ...settings!, coupon_discount: parseInt(e.target.value) || 0 })}
                  placeholder="20"
                />
              </div>
            </div>

            {settings?.coupon_active && settings?.coupon_code && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm font-medium text-primary">Preview:</p>
                <p className="text-sm mt-1">
                  Use code <strong className="font-mono">{settings.coupon_code}</strong> for {settings.coupon_discount}% off!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <Button onClick={handleSave} disabled={isSaving} className="w-full h-12">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}