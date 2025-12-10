import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { useCartContext } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import {
  Star,
  ShoppingBag,
  Heart,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Check,
  Truck,
  Shield,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

interface DBReview {
  id: string;
  product_id: string;
  reviewer_name: string;
  rating: number;
  title: string;
  content: string;
  images: string[] | null;
  is_verified: boolean | null;
  helpful: number | null;
  created_at: string;
  is_approved: boolean | null;
}

interface ProductColor {
  name: string;
  value: string;
  image?: string;
}

interface ProductSpec {
  label: string;
  value: string;
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
  colors: (Array.isArray(p.colors) ? p.colors : []) as ProductColor[],
  rating: p.rating || 0,
  reviewCount: p.review_count || 0,
  inStock: p.in_stock ?? true,
  stockCount: p.stock_count || 0,
  isUpcoming: p.is_upcoming ?? false,
  launchDate: p.launch_date || undefined,
  isFeatured: p.is_featured ?? false,
  specs: (Array.isArray(p.specs) ? p.specs : []) as ProductSpec[],
  category: p.category || "",
});

const transformReview = (r: DBReview) => ({
  id: r.id,
  productId: r.product_id,
  reviewerName: r.reviewer_name,
  rating: r.rating,
  title: r.title,
  content: r.content,
  images: r.images || [],
  isVerified: r.is_verified ?? false,
  helpful: r.helpful || 0,
  createdAt: r.created_at,
  isApproved: r.is_approved ?? false,
});

type TransformedProduct = ReturnType<typeof transformProduct>;
type TransformedReview = ReturnType<typeof transformReview>;

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCartContext();

  const [product, setProduct] = useState<TransformedProduct | null>(null);
  const [reviews, setReviews] = useState<TransformedReview[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<TransformedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (slug) {
      fetchProduct(slug);
    }
  }, [slug]);

  const fetchProduct = async (productSlug: string) => {
    setIsLoading(true);
    try {
      // Fetch product
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("slug", productSlug)
        .maybeSingle();

      if (productError) throw productError;
      
      if (!productData) {
        setProduct(null);
        setIsLoading(false);
        return;
      }

      const transformedProduct = transformProduct(productData);
      setProduct(transformedProduct);
      setSelectedColor(transformedProduct.colors[0]?.name || "");

      // Fetch reviews
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productData.id)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      setReviews((reviewsData || []).map(transformReview));

      // Fetch related products
      const { data: relatedData } = await supabase
        .from("products")
        .select("*")
        .eq("category", productData.category)
        .neq("id", productData.id)
        .limit(4);

      setRelatedProducts((relatedData || []).map(transformProduct));
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // Create a compatible product object for the cart
    const cartProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      currency: product.currency,
      images: product.images,
      colors: product.colors,
      rating: product.rating,
      reviewCount: product.reviewCount,
      inStock: product.inStock,
      stockCount: product.stockCount,
      isUpcoming: product.isUpcoming,
      launchDate: product.launchDate,
      isFeatured: product.isFeatured,
      specs: product.specs,
      category: product.category,
    };
    
    addItem(cartProduct as any, quantity, selectedColor);
  };

  const nextImage = () => {
    if (!product) return;
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    if (!product) return;
    setSelectedImage(
      (prev) => (prev - 1 + product.images.length) % product.images.length
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="pt-28 pb-24">
          <div className="container mx-auto px-6 flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="pt-28 pb-24">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Product not found</h1>
            <Link to="/products">
              <Button>Back to Products</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Helmet>
        <title>{product.name} | AirPods Store</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <Layout>
        <div className="pt-28 pb-24">
          <div className="container mx-auto px-6">
            {/* Breadcrumb */}
            <nav className="mb-8 text-sm">
              <ol className="flex items-center gap-2 text-muted-foreground">
                <li>
                  <Link to="/" className="hover:text-foreground">
                    Home
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link to="/products" className="hover:text-foreground">
                    Products
                  </Link>
                </li>
                <li>/</li>
                <li className="text-foreground">{product.name}</li>
              </ol>
            </nav>

            {/* Product Section */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Images */}
              <div className="space-y-4">
                <div className="relative aspect-square bg-secondary rounded-2xl overflow-hidden">
                  <img
                    src={product.images[selectedImage] || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-contain p-8"
                  />

                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}

                  {/* Badges */}
                  {product.isUpcoming && (
                    <span className="absolute top-4 left-4 px-3 py-1 bg-foreground text-background text-sm font-semibold rounded-full">
                      Coming Soon
                    </span>
                  )}
                  {product.originalPrice && product.inStock && (
                    <span className="absolute top-4 left-4 px-3 py-1 bg-destructive text-destructive-foreground text-sm font-semibold rounded-full">
                      {Math.round(
                        (1 - product.price / product.originalPrice) * 100
                      )}
                      % OFF
                    </span>
                  )}
                </div>

                {/* Thumbnails */}
                {product.images.length > 1 && (
                  <div className="flex gap-3">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={cn(
                          "w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors",
                          selectedImage === index
                            ? "border-foreground"
                            : "border-transparent hover:border-border"
                        )}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Info */}
              <div>
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                    {product.category}
                  </p>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                    {product.name}
                  </h1>

                  {/* Rating */}
                  {product.rating > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-5 w-5",
                              i < Math.floor(product.rating)
                                ? "fill-foreground text-foreground"
                                : "text-border"
                            )}
                          />
                        ))}
                      </div>
                      <span className="font-medium">{product.rating}</span>
                      <span className="text-muted-foreground">
                        ({product.reviewCount} reviews)
                      </span>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xl text-muted-foreground line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Inclusive of all taxes
                  </p>
                </div>

                {/* Description */}
                <p className="text-muted-foreground mb-8">
                  {product.description}
                </p>

                {/* Color Selection */}
                {product.colors.length > 1 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-medium mb-3">
                      Color: <span className="font-normal">{selectedColor}</span>
                    </h3>
                    <div className="flex gap-3">
                      {product.colors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(color.name)}
                          className={cn(
                            "w-10 h-10 rounded-full border-2 transition-all",
                            selectedColor === color.name
                              ? "border-foreground scale-110"
                              : "border-border hover:border-muted-foreground"
                          )}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        >
                          {selectedColor === color.name && (
                            <Check
                              className={cn(
                                "h-4 w-4 mx-auto",
                                color.value === "#FFFFFF" ||
                                  color.value === "#E3E4E5" ||
                                  color.value === "#F0E6D8"
                                  ? "text-foreground"
                                  : "text-background"
                              )}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity & Add to Cart */}
                {product.inStock && !product.isUpcoming && (
                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="flex items-center border border-border rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-12 h-12 flex items-center justify-center hover:bg-secondary transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-medium">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-12 h-12 flex items-center justify-center hover:bg-secondary transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <Button
                      variant="cart"
                      size="lg"
                      className="flex-1 h-12"
                      onClick={handleAddToCart}
                    >
                      <ShoppingBag className="h-5 w-5 mr-2" />
                      Add to Cart
                    </Button>

                    <Button variant="outline" size="icon" className="h-12 w-12">
                      <Heart className="h-5 w-5" />
                    </Button>
                  </div>
                )}

                {product.isUpcoming && (
                  <div className="mb-8">
                    <Button variant="hero" size="lg" className="w-full">
                      Notify Me When Available
                    </Button>
                    <p className="text-sm text-muted-foreground text-center mt-3">
                      Expected launch: {product.launchDate}
                    </p>
                  </div>
                )}

                {/* Features */}
                <div className="grid grid-cols-3 gap-4 py-6 border-t border-border">
                  <div className="text-center">
                    <Truck className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs font-medium">Free Shipping</p>
                  </div>
                  <div className="text-center">
                    <Shield className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs font-medium">1 Year Warranty</p>
                  </div>
                  <div className="text-center">
                    <RefreshCw className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs font-medium">30-Day Returns</p>
                  </div>
                </div>

                {/* Specs */}
                {product.specs.length > 0 && (
                  <div className="pt-6 border-t border-border">
                    <h3 className="font-semibold mb-4">Specifications</h3>
                    <div className="space-y-3">
                      {product.specs.map((spec) => (
                        <div
                          key={spec.label}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-muted-foreground">
                            {spec.label}
                          </span>
                          <span className="font-medium">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <section className="mt-20">
                <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </section>
            )}

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <section className="mt-20">
                <h2 className="text-2xl font-bold mb-8">You Might Also Like</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedProducts.map((relatedProduct) => (
                    <ProductCard key={relatedProduct.id} product={relatedProduct as any} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

function ReviewCard({ review }: { review: TransformedReview }) {
  return (
    <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold">{review.reviewerName}</span>
            {review.isVerified && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-foreground/10 text-foreground">
                Verified
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < review.rating
                    ? "fill-foreground text-foreground"
                    : "text-border"
                )}
              />
            ))}
          </div>
        </div>
        <span className="text-sm text-muted-foreground">
          {new Date(review.createdAt).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
      <h4 className="font-medium mb-2">{review.title}</h4>
      <p className="text-sm text-muted-foreground">{review.content}</p>
      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <button className="hover:text-foreground transition-colors">
          Helpful ({review.helpful})
        </button>
      </div>
    </div>
  );
}

export default ProductDetail;
