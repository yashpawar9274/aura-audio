import { Headphones, Truck, Shield, RefreshCw } from "lucide-react";

const features = [
  {
    icon: Headphones,
    title: "Premium Sound",
    description: "Experience crystal-clear audio with advanced noise cancellation technology.",
  },
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Free delivery on all orders above ₹5,000. Express delivery available.",
  },
  {
    icon: Shield,
    title: "1 Year Warranty",
    description: "All products come with a 1-year manufacturer warranty.",
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    description: "Not satisfied? Return within 30 days for a full refund.",
  },
];

export function Features() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 transition-all duration-300 hover:shadow-soft hover:-translate-y-1 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-foreground flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-background" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
