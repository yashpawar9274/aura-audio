import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/products/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Loader2 } from "lucide-react";

type SortOption = "popular" | "newest" | "price-asc" | "price-desc";
type FilterCategory = "all" | "pro" | "standard" | "premium" | "accessories";
type StockFilter = "all" | "in-stock" | "upcoming";

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
  created_at: string;
}

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
  createdAt: p.created_at,
});

const Products = () => {
  const [products, setProducts] = useState<ReturnType<typeof transformProduct>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [category, setCategory] = useState<FilterCategory>("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts((data || []).map(transformProduct));
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.shortDescription.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (category !== "all") {
      result = result.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Stock filter
    if (stockFilter === "in-stock") {
      result = result.filter((p) => p.inStock && !p.isUpcoming);
    } else if (stockFilter === "upcoming") {
      result = result.filter((p) => p.isUpcoming);
    }

    // Sort
    switch (sortBy) {
      case "popular":
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case "newest":
        result.sort((a, b) => (a.isUpcoming ? -1 : 1));
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
    }

    return result;
  }, [products, searchQuery, sortBy, category, stockFilter]);

  const categories: { value: FilterCategory; label: string }[] = [
    { value: "all", label: "All Products" },
    { value: "pro", label: "AirPods Pro" },
    { value: "standard", label: "AirPods" },
    { value: "accessories", label: "Accessories" },
  ];

  const clearFilters = () => {
    setSearchQuery("");
    setCategory("all");
    setStockFilter("all");
    setSortBy("popular");
  };

  const hasActiveFilters =
    searchQuery || category !== "all" || stockFilter !== "all";

  return (
    <>
      <Helmet>
        <title>Shop AirPods - All Products | AirPods Store</title>
        <meta
          name="description"
          content="Browse our complete collection of AirPods, AirPods Pro, AirPods Max and accessories. Find the perfect wireless audio companion for your lifestyle."
        />
      </Helmet>

      <Layout>
        <div className="pt-28 pb-24">
          <div className="container mx-auto px-6">
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                Our Collection
              </h1>
              <p className="mt-4 text-muted-foreground text-lg max-w-2xl">
                Discover the perfect sound companion from our curated selection
                of premium wireless audio products.
              </p>
            </div>

            {/* Filters Bar */}
            <div className="mb-8 space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex gap-3 flex-wrap">
                  {/* Category Select */}
                  <Select
                    value={category}
                    onValueChange={(v) => setCategory(v as FilterCategory)}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Stock Filter */}
                  <Select
                    value={stockFilter}
                    onValueChange={(v) => setStockFilter(v as StockFilter)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="in-stock">In Stock</SelectItem>
                      <SelectItem value="upcoming">Coming Soon</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort */}
                  <Select
                    value={sortBy}
                    onValueChange={(v) => setSortBy(v as SortOption)}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>

                  {hasActiveFilters && (
                    <Button variant="ghost" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Results count */}
              <p className="text-sm text-muted-foreground">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search or filter criteria
                </p>
                <Button onClick={clearFilters}>Clear All Filters</Button>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Products;
