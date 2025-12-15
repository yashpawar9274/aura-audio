import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReferDashboard from "./ReferDashboard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User, Package, LogOut, Settings, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  items: unknown;
}

export default function Profile() {
  const { user, isLoading: authLoading, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [warrantyOpen, setWarrantyOpen] = useState(false);
  const [warrantySerial, setWarrantySerial] = useState("");
  const [isCheckingWarranty, setIsCheckingWarranty] = useState(false);
  const [warrantyResult, setWarrantyResult] = useState<any | null>(null);
  const [warrantyCard, setWarrantyCard] = useState<any | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchOrders();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile(data);
      setFullName(data.full_name || "");
    }
    setIsLoading(false);
    // ensure referral code exists for this user
    try {
      if (user?.email) {
        const { data: existing } = await supabase.from("referrals").select("*").eq("referrer_email", user.email).maybeSingle();
        if (existing && existing.referral_code) {
          localStorage.setItem('referral_code', existing.referral_code);
        } else if (!existing) {
          const code = ("REF-" + Math.random().toString(36).slice(2, 8).toUpperCase());
          const { error } = await supabase.from("referrals").insert({ referrer_email: user.email, referrer_name: user.email.split("@")[0] || null, referral_code: code, status: "active", reward_amount: 99 });
          if (!error) localStorage.setItem('referral_code', code);
        }
      }
    } catch (err) {
      console.error("Could not ensure referral code:", err);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setOrders(data);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      fetchProfile();
    }
    setIsSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <>
      <Helmet>
        <title>My Profile - AirPods Store</title>
        <meta name="description" content="Manage your AirPods Store account, view orders, and update your profile settings." />
      </Helmet>

      <Layout>
        <div className="container mx-auto px-6 py-12 pt-28">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
              <div className="flex items-center gap-6 mb-8">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-2xl bg-foreground text-background">
                  {(profile?.full_name?.[0] || user.email?.[0] || "U").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{profile?.full_name || "Welcome"}</h1>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setWarrantyOpen(true)}>
                    Check Warranty
                  </Button>
                </div>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => navigate("/admin")}
                  >
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Admin Dashboard
                  </Button>
                )}
              </div>
            </div>

            <Tabs defaultValue="orders" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
                <TabsTrigger value="orders" className="gap-2">
                  <Package className="h-4 w-4" />
                  My Orders
                </TabsTrigger>
                <TabsTrigger value="referrals" className="gap-2">
                  <User className="h-4 w-4" />
                  Referrals
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="space-y-4">
                {orders.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start shopping to see your orders here.
                      </p>
                      <Button onClick={() => navigate("/products")}>
                        Browse Products
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  orders.map((order) => (
                    <Card key={order.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">
                              Order #{order.order_number}
                            </CardTitle>
                            <CardDescription>
                              {format(new Date(order.created_at), "PPP")}
                            </CardDescription>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            {Array.isArray(order.items) ? (order.items as unknown[]).length : 0} item(s)
                          </p>
                          <div className="flex items-center gap-4">
                            <p className="font-semibold">
                              ₹{(order.total).toLocaleString()}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/track-order?order=${order.order_number}`)}
                            >
                              Track Order
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="referrals" className="space-y-4">
                <ReferDashboard />
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your profile details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user.email || ""}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <Button onClick={handleUpdateProfile} disabled={isSaving}>
                      {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-destructive/50">
                  <CardHeader>
                    <CardTitle className="text-destructive">Sign Out</CardTitle>
                    <CardDescription>
                      Sign out from your account on this device
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="destructive" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Warranty Checker</CardTitle>
                    <CardDescription>Enter a product serial number to check warranty status.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                      <Input id="warrantySerial" placeholder="Enter serial number" />
                      <Button onClick={async () => {
                        const input = (document.getElementById('warrantySerial') as HTMLInputElement).value.trim();
                        if (!input) return toast({ title: 'Error', description: 'Enter serial number', variant: 'destructive' });
                        // fetch serial
                        const { data: s, error } = await supabase.from('serial_numbers').select('*').eq('serial', input).maybeSingle();
                        if (error) {
                          toast({ title: 'Error', description: error.message, variant: 'destructive' });
                          return;
                        }
                        let result = 'not_found';
                        let details: any = {};
                        if (!s) {
                          result = 'not_found';
                          details = { message: 'Serial not found' };
                          toast({ title: 'Not found', description: 'Serial number not found' });
                        } else {
                          const now = new Date();
                          const end = s.warranty_end_date ? new Date(s.warranty_end_date) : null;
                          if (end && now <= end) {
                            result = 'valid';
                            details = { warranty_end_date: s.warranty_end_date };
                            toast({ title: 'Under Warranty', description: `Valid until ${s.warranty_end_date}` });
                          } else {
                            result = 'expired';
                            details = { warranty_end_date: s.warranty_end_date };
                            toast({ title: 'Expired', description: `Warranty expired ${s.warranty_end_date || ''}` });
                          }
                        }
                        // log check
                        await supabase.from('warranty_checks').insert({ serial: input, user_id: (user && user.id) || null, result, details });
                      }}>Check</Button>
                      <div />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Layout>
      <Dialog open={warrantyOpen} onOpenChange={setWarrantyOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Warranty Checker</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Input id="warrantySerialModal" value={warrantySerial} onChange={(e) => setWarrantySerial(e.target.value)} placeholder="Enter serial number" />
              <Button onClick={async () => {
                const input = warrantySerial.trim();
                if (!input) return toast({ title: 'Error', description: 'Enter serial number', variant: 'destructive' });
                setIsCheckingWarranty(true);
                try {
                  const { data: s, error } = await supabase.from('serial_numbers').select('*').eq('serial', input).maybeSingle();
                  if (error) throw error;
                  setWarrantyResult(s || null);
                  if (s) {
                    // try to fetch warranty_card if exists
                    const { data: card } = await supabase.from('warranty_cards').select('*').eq('product_serial', input).maybeSingle();
                    setWarrantyCard(card || null);
                    if (s.warranty_end_date && new Date(s.warranty_end_date) >= new Date()) {
                      toast({ title: 'Under Warranty', description: `Valid until ${s.warranty_end_date}` });
                    } else {
                      toast({ title: 'Expired', description: `Warranty expired ${s.warranty_end_date || ''}` });
                    }
                  } else {
                    toast({ title: 'Not found', description: 'Serial number not found' });
                  }
                  // log check
                  await supabase.from('warranty_checks').insert({ serial: input, user_id: user?.id || null, result: s ? (s.warranty_end_date && new Date(s.warranty_end_date) >= new Date() ? 'valid' : 'expired') : 'not_found', details: s || null });
                } catch (err: any) {
                  console.error(err);
                  toast({ title: 'Error', description: err.message || String(err), variant: 'destructive' });
                } finally {
                  setIsCheckingWarranty(false);
                }
              }}>{isCheckingWarranty ? 'Checking...' : 'Check'}</Button>
            </div>

            {warrantyResult && (
              <div className="p-4 border rounded space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Product</div>
                    <div className="font-medium">{warrantyResult.product_name || '-'}</div>
                    <div className="text-xs font-mono">S/N: {warrantyResult.serial}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Warranty Until</div>
                    <div className="font-medium">{warrantyResult.warranty_end_date || '-'}</div>
                  </div>
                </div>
                {warrantyCard && (
                  <div className="pt-2">
                    <div className="text-sm text-muted-foreground">Warranty Card</div>
                    <div className="p-3 bg-muted/10 rounded">
                      <div className="font-semibold">{warrantyCard.product_name}</div>
                      <div className="text-xs">Issued: {warrantyCard.created_at ? format(new Date(warrantyCard.created_at), 'MMM dd, yyyy') : '-'}</div>
                      <div className="text-xs">Valid Until: {warrantyCard.warranty_end_date || '-'}</div>
                      <div className="mt-2 flex gap-2">
                        <Button onClick={() => {
                          // open printable window
                          const win = window.open('', '_blank', 'noopener,noreferrer');
                          if (!win) return;
                          const html = `
                            <html>
                              <head>
                                <title>Warranty Card</title>
                                <style>body{font-family:Arial,Helvetica,sans-serif;padding:20px} .card{border:1px solid #ddd;padding:20px;border-radius:8px}</style>
                              </head>
                              <body>
                                <div class="card">
                                  <h2>Warranty Card</h2>
                                  <p><strong>Product:</strong> ${warrantyCard.product_name}</p>
                                  <p><strong>Serial:</strong> ${warrantyCard.product_serial || ''}</p>
                                  <p><strong>Customer:</strong> ${warrantyCard.customer_name}</p>
                                  <p><strong>Valid Until:</strong> ${warrantyCard.warranty_end_date || ''}</p>
                                  <p><small>Issued: ${warrantyCard.created_at || ''}</small></p>
                                </div>
                                <script>window.print()</script>
                              </body>
                            </html>`;
                          win.document.write(html);
                          win.document.close();
                        }}>Download / Print</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
