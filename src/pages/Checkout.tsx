import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useCartContext } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Loader2, CreditCard, Wallet, ShoppingBag, ArrowLeft, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShippingAddress {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCartContext();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cashfree");
  const [step, setStep] = useState<"shipping" | "payment" | "success">("shipping");
  const [orderId, setOrderId] = useState("");
  
  const [address, setAddress] = useState<ShippingAddress>({
    name: "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const shippingCost = subtotal >= 500000 ? 0 : 9900; // Free shipping over ₹5000
  const finalTotal = subtotal + shippingCost;

  const generateOrderNumber = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "ORD-";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const isAddressValid = () => {
    return (
      address.name &&
      address.email &&
      address.phone &&
      address.address &&
      address.city &&
      address.state &&
      address.pincode
    );
  };

  const handlePlaceOrder = async () => {
    if (!isAddressValid()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all shipping details",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const orderNumber = generateOrderNumber();
      const orderItems = items.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images?.[0] || "",
        color: item.selectedColor,
      }));

      const { error } = await supabase.from("orders").insert([{
        order_number: orderNumber,
        user_id: user?.id || null,
        email: address.email,
        items: orderItems,
        subtotal: subtotal,
        shipping: shippingCost,
        total: finalTotal,
        shipping_address: address as unknown as Record<string, unknown>,
        status: "confirmed",
        payment_method: paymentMethod,
        payment_status: paymentMethod === "cod" ? "pending" : "paid",
        status_history: [
          { status: "pending", timestamp: new Date().toISOString() },
          { status: "confirmed", timestamp: new Date().toISOString() },
        ],
      }]);

      if (error) throw error;

      setOrderId(orderNumber);
      setStep("success");
      clearCart();

      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${orderNumber} has been confirmed.`,
      });
    } catch (error) {
      console.error("Order error:", error);
      toast({
        title: "Order Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0 && step !== "success") {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-12 pt-28">
          <div className="max-w-md mx-auto text-center">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Add some products to your cart before checkout.
            </p>
            <Button onClick={() => navigate("/products")}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (step === "success") {
    return (
      <>
        <Helmet>
          <title>Order Confirmed - AirPods Store</title>
        </Helmet>
        <Layout>
          <div className="container mx-auto px-6 py-12 pt-28">
            <div className="max-w-md mx-auto text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
              <p className="text-muted-foreground mb-2">
                Thank you for your purchase.
              </p>
              <p className="text-lg font-semibold mb-6">
                Order Number: {orderId}
              </p>
              <div className="space-y-3">
                <Button
                  className="w-full"
                  onClick={() => navigate(`/track-order?order=${orderId}`)}
                >
                  Track Order
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/products")}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        </Layout>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checkout - AirPods Store</title>
        <meta name="description" content="Complete your purchase securely at AirPods Store." />
      </Helmet>

      <Layout>
        <div className="container mx-auto px-6 py-12 pt-28">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate("/cart")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Side - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                  <CardDescription>
                    Where should we deliver your order?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={address.name}
                        onChange={(e) => handleAddressChange("name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={address.email}
                        onChange={(e) => handleAddressChange("email", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+91 9876543210"
                      value={address.phone}
                      onChange={(e) => handleAddressChange("phone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="Street address, apartment, etc."
                      value={address.address}
                      onChange={(e) => handleAddressChange("address", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="Mumbai"
                        value={address.city}
                        onChange={(e) => handleAddressChange("city", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        placeholder="Maharashtra"
                        value={address.state}
                        onChange={(e) => handleAddressChange("state", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        placeholder="400001"
                        value={address.pincode}
                        onChange={(e) => handleAddressChange("pincode", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>
                    Choose how you want to pay
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="space-y-3"
                  >
                    <label
                      htmlFor="cashfree"
                      className="flex items-center gap-4 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <RadioGroupItem value="cashfree" id="cashfree" />
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">Online Payment</p>
                        <p className="text-sm text-muted-foreground">
                          Credit/Debit Card, UPI, Net Banking
                        </p>
                      </div>
                    </label>
                    <label
                      htmlFor="cod"
                      className="flex items-center gap-4 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <RadioGroupItem value="cod" id="cod" />
                      <Wallet className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">
                          Pay when you receive your order
                        </p>
                      </div>
                    </label>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Order Summary */}
            <div>
              <Card className="sticky top-28">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-3 max-h-60 overflow-auto">
                    {items.map((item) => (
                      <div key={`${item.product.id}-${item.selectedColor}`} className="flex gap-3">
                        <img
                          src={item.product.images?.[0] || "/placeholder.svg"}
                          alt={item.product.name}
                          className="w-14 h-14 object-cover rounded-lg bg-muted"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          ₹{((item.product.price * item.quantity) / 100).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{(subtotal / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>
                        {shippingCost === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          `₹${(shippingCost / 100).toLocaleString()}`
                        )}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-base font-semibold">
                      <span>Total</span>
                      <span>₹{(finalTotal / 100).toLocaleString()}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={isLoading || !isAddressValid()}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    {paymentMethod === "cod" ? "Place Order" : "Pay Now"}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By placing this order, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
