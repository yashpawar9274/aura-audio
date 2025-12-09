import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Package, Truck, CheckCircle, Clock, MapPin, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  order_number: string;
  email: string;
  status: string;
  total: number;
  subtotal: number;
  shipping: number;
  items: unknown;
  shipping_address: unknown;
  tracking_number: string | null;
  status_history: unknown;
  created_at: string;
  updated_at: string;
}

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: MapPin },
];

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get("order") || "");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSearched(true);

    const { data, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", orderNumber.toUpperCase())
      .eq("email", email.toLowerCase())
      .single();

    if (fetchError || !data) {
      setError("Order not found. Please check your order number and email.");
      setOrder(null);
    } else {
      setOrder(data);
    }
    setIsLoading(false);
  };

  const getCurrentStepIndex = (status: string) => {
    const index = statusSteps.findIndex((step) => step.key === status);
    return index >= 0 ? index : 0;
  };

  return (
    <>
      <Helmet>
        <title>Track Your Order - AirPods Store</title>
        <meta name="description" content="Track your AirPods Store order status in real-time. Enter your order number and email to get updates." />
      </Helmet>

      <Layout>
        <div className="container mx-auto px-6 py-12 pt-28">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
              <p className="text-muted-foreground">
                Enter your order details to check the status
              </p>
            </div>

            <Card className="mb-8">
              <CardContent className="pt-6">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="orderNumber">Order Number</Label>
                      <Input
                        id="orderNumber"
                        placeholder="e.g., ORD-ABC123"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Track Order
                  </Button>
                </form>
              </CardContent>
            </Card>

            {error && searched && (
              <Card className="border-destructive/50">
                <CardContent className="py-8 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{error}</p>
                </CardContent>
              </Card>
            )}

            {order && (
              <div className="space-y-6">
                {/* Order Status Progress */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Order #{order.order_number}</CardTitle>
                        <CardDescription>
                          Placed on {format(new Date(order.created_at), "PPP")}
                        </CardDescription>
                      </div>
                      <span className="px-4 py-2 bg-foreground text-background rounded-full text-sm font-medium capitalize">
                        {order.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Progress Steps */}
                    <div className="relative">
                      <div className="flex justify-between">
                        {statusSteps.map((step, index) => {
                          const currentIndex = getCurrentStepIndex(order.status);
                          const isCompleted = index <= currentIndex;
                          const isCurrent = index === currentIndex;
                          const Icon = step.icon;

                          return (
                            <div
                              key={step.key}
                              className={cn(
                                "flex flex-col items-center relative z-10",
                                index < statusSteps.length - 1 && "flex-1"
                              )}
                            >
                              <div
                                className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                  isCompleted
                                    ? "bg-foreground text-background"
                                    : "bg-muted text-muted-foreground"
                                )}
                              >
                                <Icon className="h-5 w-5" />
                              </div>
                              <span
                                className={cn(
                                  "text-xs mt-2 text-center",
                                  isCurrent ? "font-semibold" : "text-muted-foreground"
                                )}
                              >
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      {/* Progress Line */}
                      <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-0">
                        <div
                          className="h-full bg-foreground transition-all duration-500"
                          style={{
                            width: `${(getCurrentStepIndex(order.status) / (statusSteps.length - 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Tracking Number */}
                    {order.tracking_number && (
                      <div className="mt-6 p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Tracking Number</p>
                        <p className="font-mono font-medium">{order.tracking_number}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Order Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Array.isArray(order.items) &&
                        (order.items as Array<{ id: string; name: string; price: number; quantity: number; image?: string }>).map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
                          >
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-lg bg-muted"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <p className="font-medium">
                              ₹{((item.price * item.quantity) / 100).toLocaleString()}
                            </p>
                          </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="mt-6 pt-4 border-t border-border space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₹{(order.subtotal / 100).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>{order.shipping === 0 ? "Free" : `₹${(order.shipping / 100).toLocaleString()}`}</span>
                      </div>
                      <div className="flex justify-between font-semibold pt-2 border-t border-border">
                        <span>Total</span>
                        <span>₹{(order.total / 100).toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                {order.shipping_address && typeof order.shipping_address === 'object' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Shipping Address</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const addr = order.shipping_address as { name?: string; address?: string; city?: string; state?: string; pincode?: string; phone?: string };
                        return (
                          <div className="text-sm space-y-1">
                            <p className="font-medium">{addr.name}</p>
                            <p className="text-muted-foreground">{addr.address}</p>
                            <p className="text-muted-foreground">
                              {addr.city}, {addr.state} {addr.pincode}
                            </p>
                            <p className="text-muted-foreground">{addr.phone}</p>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}
