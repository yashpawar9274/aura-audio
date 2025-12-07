export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  images: string[];
  colors: ProductColor[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  isUpcoming: boolean;
  launchDate?: string;
  isFeatured: boolean;
  specs: ProductSpec[];
  category: string;
}

export interface ProductColor {
  name: string;
  value: string;
  image?: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Review {
  id: string;
  productId: string;
  reviewerName: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  isVerified: boolean;
  helpful: number;
  createdAt: string;
  isApproved: boolean;
}

// Seed Products Data
export const products: Product[] = [
  {
    id: "airpods-pro-2",
    name: "AirPods Pro (2nd Gen)",
    slug: "airpods-pro-2nd-generation",
    shortDescription: "Adaptive Audio. Active Noise Cancellation. Spatial Audio.",
    description: "AirPods Pro (2nd generation) feature up to 2x more Active Noise Cancellation than the previous generation. The H2 chip delivers Adaptive Audio and Personalized Spatial Audio with dynamic head tracking.",
    price: 24900,
    originalPrice: 26900,
    currency: "INR",
    images: [
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=80",
      "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800&q=80",
      "https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=800&q=80",
    ],
    colors: [
      { name: "White", value: "#FFFFFF" },
    ],
    rating: 4.9,
    reviewCount: 2847,
    inStock: true,
    stockCount: 150,
    isUpcoming: false,
    isFeatured: true,
    specs: [
      { label: "Chip", value: "Apple H2" },
      { label: "Active Noise Cancellation", value: "Yes, 2x more" },
      { label: "Spatial Audio", value: "Personalized with dynamic head tracking" },
      { label: "Battery Life", value: "Up to 6 hours (30 hours with case)" },
      { label: "Sweat Resistant", value: "IPX4" },
      { label: "Connectivity", value: "Bluetooth 5.3" },
    ],
    category: "Pro",
  },
  {
    id: "airpods-3",
    name: "AirPods (3rd Gen)",
    slug: "airpods-3rd-generation",
    shortDescription: "Spatial Audio. Adaptive EQ. All-day battery life.",
    description: "The all-new AirPods. Featuring Spatial Audio with dynamic head tracking for immersive sound, Adaptive EQ that tunes music to your ears, and sweat and water resistance.",
    price: 19900,
    currency: "INR",
    images: [
      "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800&q=80",
      "https://images.unsplash.com/photo-1629367494173-c78a56567877?w=800&q=80",
    ],
    colors: [
      { name: "White", value: "#FFFFFF" },
    ],
    rating: 4.7,
    reviewCount: 1923,
    inStock: true,
    stockCount: 200,
    isUpcoming: false,
    isFeatured: true,
    specs: [
      { label: "Chip", value: "Apple H1" },
      { label: "Spatial Audio", value: "Yes, with dynamic head tracking" },
      { label: "Adaptive EQ", value: "Yes" },
      { label: "Battery Life", value: "Up to 6 hours (30 hours with case)" },
      { label: "Sweat Resistant", value: "IPX4" },
      { label: "Connectivity", value: "Bluetooth 5.0" },
    ],
    category: "Standard",
  },
  {
    id: "airpods-max",
    name: "AirPods Max",
    slug: "airpods-max",
    shortDescription: "High-fidelity audio. Breathable knit mesh canopy.",
    description: "AirPods Max combine a custom acoustic design, H1 chips, and advanced software to create the ultimate listening experience with computational audio.",
    price: 59900,
    originalPrice: 64900,
    currency: "INR",
    images: [
      "https://images.unsplash.com/photo-1625245488600-f03fef636a3c?w=800&q=80",
      "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=800&q=80",
    ],
    colors: [
      { name: "Space Gray", value: "#1D1D1F" },
      { name: "Silver", value: "#E3E4E5" },
      { name: "Sky Blue", value: "#8DB4CB" },
      { name: "Pink", value: "#F4C8CC" },
      { name: "Green", value: "#AEC8A4" },
    ],
    rating: 4.8,
    reviewCount: 856,
    inStock: true,
    stockCount: 45,
    isUpcoming: false,
    isFeatured: true,
    specs: [
      { label: "Chip", value: "Apple H1 (x2)" },
      { label: "Active Noise Cancellation", value: "Yes" },
      { label: "Spatial Audio", value: "Personalized with dynamic head tracking" },
      { label: "Battery Life", value: "Up to 20 hours" },
      { label: "Design", value: "Over-ear, breathable knit mesh" },
      { label: "Connectivity", value: "Bluetooth 5.0" },
    ],
    category: "Premium",
  },
  {
    id: "airpods-2",
    name: "AirPods (2nd Gen)",
    slug: "airpods-2nd-generation",
    shortDescription: "Effortless setup. Quick access to Siri.",
    description: "The iconic AirPods that started it all. Powered by H1 chip for fast, stable wireless connection and hands-free access to Siri.",
    price: 12900,
    currency: "INR",
    images: [
      "https://images.unsplash.com/photo-1504274066651-8d31a536b11a?w=800&q=80",
    ],
    colors: [
      { name: "White", value: "#FFFFFF" },
    ],
    rating: 4.5,
    reviewCount: 4521,
    inStock: true,
    stockCount: 300,
    isUpcoming: false,
    isFeatured: false,
    specs: [
      { label: "Chip", value: "Apple H1" },
      { label: "Hey Siri", value: "Yes" },
      { label: "Battery Life", value: "Up to 5 hours (24 hours with case)" },
      { label: "Quick Charging", value: "15 min = 3 hours playback" },
      { label: "Connectivity", value: "Bluetooth 5.0" },
    ],
    category: "Standard",
  },
  {
    id: "airpods-pro-usbc",
    name: "AirPods Pro (USB-C)",
    slug: "airpods-pro-usbc",
    shortDescription: "Now with USB-C. Lossless Audio with Apple Vision Pro.",
    description: "The latest AirPods Pro with USB-C charging case. Features up to 2x more Active Noise Cancellation, Adaptive Audio, and now supports Lossless Audio with Apple Vision Pro.",
    price: 24900,
    currency: "INR",
    images: [
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=80",
    ],
    colors: [
      { name: "White", value: "#FFFFFF" },
    ],
    rating: 4.9,
    reviewCount: 1243,
    inStock: true,
    stockCount: 120,
    isUpcoming: false,
    isFeatured: false,
    specs: [
      { label: "Chip", value: "Apple H2" },
      { label: "Charging", value: "USB-C" },
      { label: "Lossless Audio", value: "Yes, with Apple Vision Pro" },
      { label: "Active Noise Cancellation", value: "Yes, 2x more" },
      { label: "Battery Life", value: "Up to 6 hours (30 hours with case)" },
      { label: "Dust Resistant", value: "IP54" },
    ],
    category: "Pro",
  },
  {
    id: "airpods-max-2",
    name: "AirPods Max 2",
    slug: "airpods-max-2",
    shortDescription: "Next-gen premium audio. Coming soon.",
    description: "The next generation of over-ear excellence. Featuring enhanced computational audio, improved Active Noise Cancellation, and a new lightweight design.",
    price: 69900,
    currency: "INR",
    images: [
      "https://images.unsplash.com/photo-1625245488600-f03fef636a3c?w=800&q=80",
    ],
    colors: [
      { name: "Midnight", value: "#1D1D1F" },
      { name: "Starlight", value: "#F0E6D8" },
    ],
    rating: 0,
    reviewCount: 0,
    inStock: false,
    stockCount: 0,
    isUpcoming: true,
    launchDate: "2025-03-15",
    isFeatured: false,
    specs: [
      { label: "Chip", value: "Apple H3 (Expected)" },
      { label: "Active Noise Cancellation", value: "Enhanced" },
      { label: "Battery Life", value: "Up to 24 hours (Expected)" },
      { label: "Charging", value: "USB-C" },
    ],
    category: "Premium",
  },
  {
    id: "airpods-case-black",
    name: "Silicone Case - Black",
    slug: "airpods-case-black",
    shortDescription: "Premium protection for your AirPods.",
    description: "Sleek silicone case with a soft-touch finish. Precisely engineered to fit your AirPods Pro charging case with easy access to the charging port.",
    price: 2490,
    currency: "INR",
    images: [
      "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&q=80",
    ],
    colors: [
      { name: "Black", value: "#000000" },
      { name: "White", value: "#FFFFFF" },
    ],
    rating: 4.6,
    reviewCount: 342,
    inStock: true,
    stockCount: 500,
    isUpcoming: false,
    isFeatured: false,
    specs: [
      { label: "Material", value: "Premium Silicone" },
      { label: "Compatibility", value: "AirPods Pro (1st & 2nd Gen)" },
      { label: "Features", value: "Carabiner included" },
      { label: "Wireless Charging", value: "Compatible" },
    ],
    category: "Accessories",
  },
  {
    id: "airpods-lanyard",
    name: "Premium Lanyard Strap",
    slug: "airpods-lanyard",
    shortDescription: "Never lose your AirPods again.",
    description: "Magnetic anti-loss lanyard strap. Lightweight, durable, and designed for active lifestyles.",
    price: 990,
    currency: "INR",
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80",
    ],
    colors: [
      { name: "Black", value: "#000000" },
      { name: "White", value: "#FFFFFF" },
    ],
    rating: 4.4,
    reviewCount: 189,
    inStock: true,
    stockCount: 400,
    isUpcoming: false,
    isFeatured: false,
    specs: [
      { label: "Material", value: "Premium Nylon" },
      { label: "Length", value: "60cm adjustable" },
      { label: "Magnetic Tips", value: "Yes" },
      { label: "Compatibility", value: "All AirPods models" },
    ],
    category: "Accessories",
  },
  {
    id: "airpods-cleaning-kit",
    name: "Cleaning Kit Pro",
    slug: "airpods-cleaning-kit",
    shortDescription: "Professional cleaning for pristine audio.",
    description: "Complete cleaning kit designed specifically for AirPods. Includes precision brushes, microfiber cloth, and safe cleaning solution.",
    price: 790,
    currency: "INR",
    images: [
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
    ],
    colors: [
      { name: "White/Black", value: "#FFFFFF" },
    ],
    rating: 4.3,
    reviewCount: 256,
    inStock: true,
    stockCount: 600,
    isUpcoming: false,
    isFeatured: false,
    specs: [
      { label: "Includes", value: "3 precision brushes" },
      { label: "Cloth", value: "Microfiber cleaning cloth" },
      { label: "Solution", value: "50ml safe cleaning solution" },
      { label: "Case", value: "Travel case included" },
    ],
    category: "Accessories",
  },
  {
    id: "airpods-stand",
    name: "Aluminum Charging Stand",
    slug: "airpods-stand",
    shortDescription: "Elegant desktop charging solution.",
    description: "Premium aluminum charging stand with built-in cable management. The perfect home for your AirPods on any desk or nightstand.",
    price: 1990,
    currency: "INR",
    images: [
      "https://images.unsplash.com/photo-1610438235354-a6ae5528385c?w=800&q=80",
    ],
    colors: [
      { name: "Space Gray", value: "#1D1D1F" },
      { name: "Silver", value: "#E3E4E5" },
    ],
    rating: 4.7,
    reviewCount: 412,
    inStock: true,
    stockCount: 180,
    isUpcoming: false,
    isFeatured: false,
    specs: [
      { label: "Material", value: "Aluminum alloy" },
      { label: "Cable Management", value: "Built-in" },
      { label: "Compatibility", value: "All AirPods cases" },
      { label: "Base", value: "Anti-slip silicone" },
    ],
    category: "Accessories",
  },
];

// Seed Reviews Data
export const reviews: Review[] = [
  {
    id: "review-1",
    productId: "airpods-pro-2",
    reviewerName: "Rahul Sharma",
    rating: 5,
    title: "Absolutely incredible noise cancellation!",
    content: "I've been using these for about 3 months now, and the noise cancellation is unreal. I work from home and these completely block out street noise, construction sounds, everything. The spatial audio makes movies feel like a theater experience. Battery life is great too - easily lasts my entire workday.",
    isVerified: true,
    helpful: 234,
    createdAt: "2024-11-15",
    isApproved: true,
  },
  {
    id: "review-2",
    productId: "airpods-pro-2",
    reviewerName: "Priya Patel",
    rating: 5,
    title: "Worth every rupee!",
    content: "Upgraded from regular AirPods and the difference is night and day. The fit is so much better with the different ear tip sizes. Active noise cancellation is a game-changer for my daily commute. The transparency mode is also surprisingly natural sounding.",
    isVerified: true,
    helpful: 156,
    createdAt: "2024-11-10",
    isApproved: true,
  },
  {
    id: "review-3",
    productId: "airpods-pro-2",
    reviewerName: "Amit Kumar",
    rating: 4,
    title: "Great but battery could be better",
    content: "Sound quality is phenomenal and the ANC works really well. My only complaint is I wish the battery lasted a bit longer during heavy use with ANC on. Still, the case gives you plenty of extra charges so it's not a dealbreaker. Fast delivery too!",
    isVerified: true,
    helpful: 89,
    createdAt: "2024-10-28",
    isApproved: true,
  },
  {
    id: "review-4",
    productId: "airpods-pro-2",
    reviewerName: "Sneha Reddy",
    rating: 5,
    title: "Perfect for workouts",
    content: "Finally earbuds that stay in my ears during intense workouts! The sweat resistance is tested daily at the gym and they've held up perfectly. The new volume slider on the stem is so convenient when my hands are sweaty.",
    isVerified: true,
    helpful: 178,
    createdAt: "2024-10-15",
    isApproved: true,
  },
  {
    id: "review-5",
    productId: "airpods-3",
    reviewerName: "Vikram Singh",
    rating: 5,
    title: "Perfect everyday earbuds",
    content: "Don't need the ANC? These are the ones to get. Sound quality is excellent, spatial audio is impressive for movies, and the battery life is fantastic. They're comfortable enough to wear all day. Setup with my iPhone was instant.",
    isVerified: true,
    helpful: 123,
    createdAt: "2024-11-12",
    isApproved: true,
  },
  {
    id: "review-6",
    productId: "airpods-3",
    reviewerName: "Deepika Nair",
    rating: 4,
    title: "Great value, slight fit issues",
    content: "Love the sound and features but the one-size-fits-all design doesn't work perfectly for my small ears. They stay in for casual use but tend to slip during runs. Otherwise, fantastic product with great integration with my Apple devices.",
    isVerified: true,
    helpful: 67,
    createdAt: "2024-10-20",
    isApproved: true,
  },
  {
    id: "review-7",
    productId: "airpods-max",
    reviewerName: "Arjun Mehta",
    rating: 5,
    title: "Best headphones I've ever owned",
    content: "The sound quality is absolutely spectacular. As someone who works in audio production, I can confidently say these deliver reference-quality sound. The build quality is premium, the ANC is best-in-class, and they're surprisingly comfortable for long sessions.",
    isVerified: true,
    helpful: 312,
    createdAt: "2024-11-08",
    isApproved: true,
  },
  {
    id: "review-8",
    productId: "airpods-max",
    reviewerName: "Kavitha Suresh",
    rating: 4,
    title: "Luxurious but heavy",
    content: "These are absolutely luxurious. The sound is incredible and the design is stunning. However, they are quite heavy for extended wear. The smart case is also a bit awkward. Still, for pure audio enjoyment, nothing comes close.",
    isVerified: true,
    helpful: 145,
    createdAt: "2024-10-25",
    isApproved: true,
  },
  {
    id: "review-9",
    productId: "airpods-2",
    reviewerName: "Rohan Joshi",
    rating: 5,
    title: "Classic and reliable",
    content: "Been using AirPods 2 for over a year now. They just work. Battery is still great, sound is clear for calls and music, and they're so light I forget I'm wearing them. Great entry point into the AirPods ecosystem.",
    isVerified: true,
    helpful: 89,
    createdAt: "2024-09-15",
    isApproved: true,
  },
  {
    id: "review-10",
    productId: "airpods-2",
    reviewerName: "Anjali Verma",
    rating: 4,
    title: "Good for the price",
    content: "Solid earbuds at a reasonable price. Call quality is excellent which is important for my work. Only wish they had better noise isolation, but for everyday use they're perfect. Fast shipping from this store!",
    isVerified: true,
    helpful: 56,
    createdAt: "2024-09-01",
    isApproved: true,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getReviewsByProductId(productId: string): Review[] {
  return reviews.filter((r) => r.productId === productId && r.isApproved);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.isFeatured && !p.isUpcoming);
}

export function getUpcomingProducts(): Product[] {
  return products.filter((p) => p.isUpcoming);
}
