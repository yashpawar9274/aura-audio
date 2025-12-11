import { Layout } from "@/components/layout/Layout";
import { Truck, Clock, MapPin, Package } from "lucide-react";

export default function Shipping() {
  return (
    <Layout>
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Shipping Information</h1>
          <p className="text-muted-foreground mb-12">
            Everything you need to know about our shipping and delivery options.
          </p>

          {/* Shipping Options */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Standard Shipping</h3>
              <p className="text-muted-foreground mb-4">5-7 business days</p>
              <p className="text-2xl font-bold">₹99</p>
              <p className="text-sm text-muted-foreground">Free on orders above ₹5,000</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Express Shipping</h3>
              <p className="text-muted-foreground mb-4">2-3 business days</p>
              <p className="text-2xl font-bold">₹249</p>
              <p className="text-sm text-muted-foreground">Available pan India</p>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">Delivery Areas</h2>
              </div>
              <div className="bg-secondary/30 rounded-xl p-6">
                <p className="text-muted-foreground mb-4">
                  We currently deliver to all major cities and towns across India. Our delivery network covers:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>All state capitals and major metros</li>
                  <li>Tier 2 and Tier 3 cities</li>
                  <li>Select pin codes in remote areas</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Package className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">Order Processing</h2>
              </div>
              <div className="bg-secondary/30 rounded-xl p-6">
                <ul className="space-y-4 text-muted-foreground">
                  <li>
                    <strong className="text-foreground">Order Confirmation:</strong> You'll receive an email confirmation within 30 minutes of placing your order.
                  </li>
                  <li>
                    <strong className="text-foreground">Processing Time:</strong> Orders are processed within 24 hours on business days.
                  </li>
                  <li>
                    <strong className="text-foreground">Tracking:</strong> Once shipped, you'll receive a tracking number via email and SMS.
                  </li>
                  <li>
                    <strong className="text-foreground">Delivery Attempts:</strong> Our courier partners will attempt delivery up to 3 times before returning the package.
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Important Notes</h2>
              <div className="bg-secondary/30 rounded-xl p-6">
                <ul className="space-y-3 text-muted-foreground">
                  <li>• Delivery times may vary during sale periods and festivals</li>
                  <li>• Orders placed after 2 PM will be processed the next business day</li>
                  <li>• COD orders require verification before shipping</li>
                  <li>• Contact support for international shipping inquiries</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}