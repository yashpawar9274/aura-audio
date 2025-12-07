import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bell } from "lucide-react";
import { getUpcomingProducts } from "@/data/products";
import heroAirpods from "@/assets/hero-airpods.png";

export function Hero() {
  const upcomingProducts = getUpcomingProducts();
  const upcomingProduct = upcomingProducts[0];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 via-background to-background" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            {/* Upcoming Product Badge */}
            {upcomingProduct && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/5 border border-border mb-8 animate-fade-in">
                <span className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
                <span className="text-sm font-medium">
                  Coming Soon: {upcomingProduct.name}
                </span>
              </div>
            )}

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[0.9] animate-slide-up">
              <span className="block">Pure Sound.</span>
              <span className="block text-muted-foreground">Zero Noise.</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Experience audio perfection with our premium AirPods collection. Immersive sound, seamless connectivity, and iconic design.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/products">
                <Button variant="hero" size="lg" className="group">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              {upcomingProduct && (
                <Button variant="heroOutline" size="lg" className="group">
                  <Bell className="mr-2 h-5 w-5" />
                  Notify Me
                </Button>
              )}
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div>
                <div className="text-3xl sm:text-4xl font-bold">50K+</div>
                <div className="text-sm text-muted-foreground mt-1">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold">4.9</div>
                <div className="text-sm text-muted-foreground mt-1">Average Rating</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold">24h</div>
                <div className="text-sm text-muted-foreground mt-1">Fast Delivery</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative order-1 lg:order-2">
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-radial from-foreground/5 to-transparent rounded-full blur-3xl" />
              
              {/* Main image with floating animation */}
              <img
                src={heroAirpods}
                alt="AirPods Pro floating"
                className="relative w-full h-full object-contain animate-float drop-shadow-2xl"
              />
              
              {/* Decorative circles */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-border/30 rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border border-border/20 rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] h-[160%] border border-border/10 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground animate-fade-in" style={{ animationDelay: '1s' }}>
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <div className="w-6 h-10 border-2 border-border rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-foreground rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
