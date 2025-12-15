import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useCartContext } from "@/hooks/useCart";
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const Cart = () => {
  const { items, removeItem, updateQuantity, subtotal, itemCount } =
    useCartContext();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const shipping = subtotal >= 5000 ? 0 : 499;
  const total = subtotal + shipping;

  return (
    <>
      <Helmet>
        <title>Your Cart | AirPods Store</title>
        <meta name="description" content="Review your cart and proceed to checkout." />
      </Helmet>

      <Layout>
        <div className="pt-28 pb-24">
          <div className="container mx-auto px-6">
            <h1 className="text-4xl font-bold tracking-tight mb-12">
              Your Cart
              {itemCount > 0 && (
                <span className="text-muted-foreground font-normal ml-2">
                  ({itemCount} {itemCount === 1 ? "item" : "items"})
                </span>
              )}
            </h1>

            {items.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">
                  Your cart is empty
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Looks like you haven't added any items to your cart yet.
                  Explore our collection and find your perfect audio companion.
                </p>
                <Link to="/products">
                  <Button variant="hero" size="lg">
                    Continue Shopping
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-12">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-6">
                  {items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.selectedColor}`}
                      className="flex gap-6 p-6 rounded-2xl bg-secondary/30 border border-border/50"
                    >
                      {/* Image */}
                      <Link
                        to={`/product/${item.product.slug}`}
                        className="shrink-0"
                      >
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-secondary overflow-hidden">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-contain p-2"
                          />
                        </div>
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div>
                            <Link
                              to={`/product/${item.product.slug}`}
                              className="font-semibold text-lg hover:underline line-clamp-1"
                            >
                              {item.product.name}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              Color: {item.selectedColor}
                            </p>
                          </div>
                          <span className="font-bold text-lg shrink-0">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-4">
                          {/* Quantity */}
                          <div className="flex items-center border border-border rounded-lg">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.selectedColor,
                                  item.quantity - 1
                                )
                              }
                              className="w-9 h-9 flex items-center justify-center hover:bg-secondary transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-10 text-center font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.selectedColor,
                                  item.quantity + 1
                                )
                              }
                              className="w-9 h-9 flex items-center justify-center hover:bg-secondary transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Remove */}
                          <button
                            onClick={() =>
                              removeItem(item.product.id, item.selectedColor)
                            }
                            className="text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="sticky top-28 p-6 rounded-2xl bg-secondary/30 border border-border/50">
                    <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="font-medium">
                          {shipping === 0 ? "Free" : formatPrice(shipping)}
                        </span>
                      </div>
                      {shipping > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Add {formatPrice(5000 - subtotal)} more for free shipping
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-border">
                      <div className="flex justify-between mb-6">
                        <span className="font-semibold">Total</span>
                        <span className="font-bold text-xl">{formatPrice(total)}</span>
                      </div>

                      <Link to="/checkout">
                        <Button variant="cart" size="lg" className="w-full h-12">
                          Proceed to Checkout
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>

                      <p className="text-xs text-muted-foreground text-center mt-4">
                        Secure checkout powered by Cashfree
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Cart;
