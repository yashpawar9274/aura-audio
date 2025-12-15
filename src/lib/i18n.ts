// Internationalization strings - easy to translate
export const strings = {
  en: {
    // Navigation
    nav: {
      home: "Home",
      products: "Products",
      about: "About",
      contact: "Contact",
      cart: "Cart",
      login: "Login",
      signup: "Sign Up",
      account: "Account",
      orders: "Orders",
      logout: "Logout",
    },
    
    // Hero
    hero: {
      badge: "New Release",
      title: "Pure Sound.",
      titleHighlight: "Zero Noise.",
      subtitle: "Experience audio perfection with our premium AirPods collection. Immersive sound, seamless connectivity, and iconic design.",
      cta: "Shop Now",
      ctaSecondary: "Learn More",
      upcomingBadge: "Coming Soon",
      notifyMe: "Notify Me",
    },
    
    // Products
    products: {
      title: "Our Collection",
      subtitle: "Discover the perfect sound companion",
      filterAll: "All",
      filterInStock: "In Stock",
      filterUpcoming: "Upcoming",
      sortPopular: "Most Popular",
      sortNewest: "Newest",
      sortPriceLow: "Price: Low to High",
      sortPriceHigh: "Price: High to Low",
      addToCart: "Add to Cart",
      quickAdd: "Quick Add",
      outOfStock: "Out of Stock",
      viewDetails: "View Details",
      reviews: "reviews",
      specs: "Specifications",
      description: "Description",
      relatedProducts: "You Might Also Like",
    },
    
    // Cart
    cart: {
      title: "Your Cart",
      empty: "Your cart is empty",
      emptySubtitle: "Add some items to get started",
      continueShopping: "Continue Shopping",
      subtotal: "Subtotal",
      shipping: "Shipping",
      shippingFree: "Free",
      shippingCalculated: "Calculated at checkout",
      total: "Total",
      checkout: "Proceed to Checkout",
      remove: "Remove",
      quantity: "Qty",
      itemAdded: "Added to cart",
      itemRemoved: "Removed from cart",
    },
    
    // Reviews
    reviews: {
      title: "Customer Reviews",
      writeReview: "Write a Review",
      verifiedPurchase: "Verified Purchase",
      helpful: "Helpful",
      showMore: "Show More Reviews",
      noReviews: "No reviews yet",
      beFirst: "Be the first to review this product",
    },
    
    // Footer
    footer: {
      tagline: "Premium audio, redefined.",
      shop: "Shop",
      support: "Support",
      company: "Company",
      legal: "Legal",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      returns: "Returns & Refunds",
      shipping: "Shipping Info",
      faq: "FAQ",
      contact: "Contact Us",
      about: "About Us",
      careers: "Careers",
      newsletter: "Newsletter",
      newsletterSubtitle: "Get updates on new products and offers",
      subscribe: "Subscribe",
      emailPlaceholder: "Enter your email",
      copyright: "© 2024 AirPods Store. All rights reserved.",
    },
    
    // Common
    common: {
      loading: "Loading...",
      error: "Something went wrong",
      tryAgain: "Try Again",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      search: "Search",
      searchPlaceholder: "Search products...",
      noResults: "No results found",
      currency: "₹",
      currencyCode: "INR",
    },
  },
};

export type Language = keyof typeof strings;
export const defaultLanguage: Language = "en";

export function t(key: string, lang: Language = defaultLanguage): string {
  const keys = key.split(".");
  let value: any = strings[lang];
  
  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      return key;
    }
  }
  
  return typeof value === "string" ? value : key;
}
