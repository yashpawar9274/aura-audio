import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { Product } from "@/data/products";
import { toast } from "@/hooks/use-toast";
import { t } from "@/lib/i18n";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
}

const CART_STORAGE_KEY = "airpods-cart";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error("Failed to save cart to localStorage:", error);
      }
    }
  }, [items, isLoaded]);

  const addItem = useCallback((product: Product, quantity: number = 1, selectedColor?: string) => {
    const color = selectedColor || product.colors[0]?.name || "Default";
    
    setItems((currentItems) => {
      const existingIndex = currentItems.findIndex(
        (item) => item.product.id === product.id && item.selectedColor === color
      );

      if (existingIndex >= 0) {
        const updated = [...currentItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      return [...currentItems, { product, quantity, selectedColor: color }];
    });

    toast({
      title: t("cart.itemAdded"),
      description: `${product.name} added to your cart`,
    });
  }, []);

  const removeItem = useCallback((productId: string, selectedColor: string) => {
    setItems((currentItems) => {
      const item = currentItems.find(
        (i) => i.product.id === productId && i.selectedColor === selectedColor
      );
      
      if (item) {
        toast({
          title: t("cart.itemRemoved"),
          description: `${item.product.name} removed from your cart`,
        });
      }

      return currentItems.filter(
        (i) => !(i.product.id === productId && i.selectedColor === selectedColor)
      );
    });
  }, []);

  const updateQuantity = useCallback((productId: string, selectedColor: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, selectedColor);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId && item.selectedColor === selectedColor
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const getItemQuantity = useCallback((productId: string, selectedColor?: string) => {
    const item = items.find(
      (i) => i.product.id === productId && (!selectedColor || i.selectedColor === selectedColor)
    );
    return item?.quantity || 0;
  }, [items]);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    itemCount,
    subtotal,
    getItemQuantity,
    isLoaded,
  };
}

// Create a singleton context for the cart

interface CartContextValue extends ReturnType<typeof useCart> {}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useCart();
  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
}

export function calculateTotals(items: CartItem[]) {
  const subtotal = items.reduce((s, it) => s + it.product.price * it.quantity, 0);
  // Fixed shipping: always charge 100 INR
  const shipping = 100;
  const total = subtotal + shipping;
  return { subtotal, shipping, total };
}
