import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 bg-foreground text-background">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Ready to Experience
            <br />
            <span className="text-background/60">Pure Audio Perfection?</span>
          </h2>
          <p className="mt-6 text-lg text-background/70 max-w-xl mx-auto">
            Join thousands of satisfied customers who have made the switch to premium wireless audio.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/products">
              <Button
                size="xl"
                className="bg-background text-foreground hover:bg-background/90 rounded-full group"
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/about">
              <Button
                variant="outline"
                size="xl"
                className="border-background/30 text-background hover:bg-background/10 rounded-full"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
