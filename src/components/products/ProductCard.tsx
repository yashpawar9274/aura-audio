import { Link } from "react-router-dom";
import { Star, ShoppingBag, Eye } from "lucide-react";
import { Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { useCartContext } from "@/hooks/useCart";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
  style?: React.CSSProperties;
}

export function ProductCard({ product, className, style }: ProductCardProps) {
  const { addItem } = useCartContext();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.inStock) {
      addItem(product, 1);
    }
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className={cn(
        "group relative bg-card rounded-2xl overflow-hidden transition-all duration-500",
        "hover:shadow-hover hover:-translate-y-1",
        className
      )}
      style={style}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-secondary to-secondary/50 p-6 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.isUpcoming && (
            <span className="px-3 py-1 bg-foreground text-background text-xs font-semibold rounded-full">
              Coming Soon
            </span>
          )}
          {product.originalPrice && product.inStock && (
            <span className="px-3 py-1 bg-destructive text-destructive-foreground text-xs font-semibold rounded-full">
              {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
            </span>
          )}
          {!product.inStock && !product.isUpcoming && (
            <span className="px-3 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded-full">
              Out of Stock
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <Button
            variant="glass"
            size="iconSm"
            onClick={handleQuickAdd}
            disabled={!product.inStock}
            className="rounded-full"
          >
            <ShoppingBag className="h-4 w-4" />
          </Button>
          <Button variant="glass" size="iconSm" className="rounded-full">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category */}
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          {product.category}
        </p>

        {/* Name */}
        <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Short Description */}
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {product.shortDescription}
        </p>

        {/* Rating & Price */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {product.rating > 0 ? (
              <>
                <Star className="h-4 w-4 fill-foreground text-foreground" />
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-xs text-muted-foreground">
                  ({product.reviewCount})
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">No reviews yet</span>
            )}
          </div>

          <div className="text-right">
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through mr-2">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span className="font-bold text-lg">{formatPrice(product.price)}</span>
          </div>
        </div>

        {/* Color Options */}
        {product.colors.length > 1 && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Colors:</span>
            <div className="flex gap-1">
              {product.colors.map((color) => (
                <div
                  key={color.name}
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
