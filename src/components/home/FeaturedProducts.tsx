import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";

interface DBProduct {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number;
  original_price: number | null;
  currency: string;
  images: string[] | null;
  colors: unknown;
  rating: number | null;
  review_count: number | null;
  in_stock: boolean | null;
  stock_count: number | null;
  is_upcoming: boolean | null;
  launch_date: string | null;
  is_featured: boolean | null;
  specs: unknown;
  category: string | null;
}

// Transform DB product to match the Product interface
const transformProduct = (p: DBProduct) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  shortDescription: p.short_description || "",
  description: p.description || "",
  price: p.price,
  originalPrice: p.original_price || undefined,
  currency: p.currency,
  images: p.images || [],
  colors: Array.isArray(p.colors) ? p.colors : [],
  rating: p.rating || 0,
  reviewCount: p.review_count || 0,
  inStock: p.in_stock ?? true,
  stockCount: p.stock_count || 0,
  isUpcoming: p.is_upcoming ?? false,
  launchDate: p.launch_date || undefined,
  isFeatured: p.is_featured ?? false,
  specs: Array.isArray(p.specs) ? p.specs : [],
  category: p.category || "",
});

export function FeaturedProducts() {
  const [products, setProducts] = useState<ReturnType<typeof transformProduct>[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_featured", true)
        .eq("is_upcoming", false)
        .limit(6);

      if (error) throw error;
      setProducts((data || []).map(transformProduct));
    } catch (error) {
      console.error("Error fetching featured products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Featured Products
            </h2>
            <p className="mt-3 text-muted-foreground text-lg max-w-xl">
              Discover our most popular products, loved by thousands of customers worldwide.
            </p>
          </div>
          <Link to="/products">
            <Button variant="outline" className="group">
              View All Products
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` } as React.CSSProperties}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
