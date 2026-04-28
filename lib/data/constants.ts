// Brand Configuration - Easy to reuse by cloning
export const BRAND_CONFIG = {
  name: "Himalayan Threads",
  tagline: "Authentic Mountain Wear",
  description: "Premium handcrafted clothing inspired by the mountains",
  colors: {
    primary: "#B8860B", // Goldenrod
    secondary: "#8B4513", // Saddle Brown
    accent: "#D2691E", // Chocolate
    tertiary: "#DAA520", // Goldenrod
  },
  social: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    twitter: "https://twitter.com",
  },
};

export const PRODUCT_CATEGORIES = [
  { id: "all", name: "All Products", description: "Browse all items" },
  { id: "mens", name: "Men's Wear", description: "Clothing for men" },
  { id: "womens", name: "Women's Wear", description: "Clothing for women" },
  { id: "kids", name: "Kids Collection", description: "Clothing for children" },
  { id: "accessories", name: "Accessories", description: "Hats, scarves, and more" },
];

export const COLORS = [
  { id: "black", name: "Black", hex: "#000000" },
  { id: "white", name: "White", hex: "#FFFFFF" },
  { id: "navy", name: "Navy Blue", hex: "#001F3F" },
  { id: "burgundy", name: "Burgundy", hex: "#800020" },
  { id: "olive", name: "Olive Green", hex: "#556B2F" },
  { id: "cream", name: "Cream", hex: "#FFFDD0" },
  { id: "charcoal", name: "Charcoal", hex: "#36454F" },
  { id: "mustard", name: "Mustard", hex: "#FFDB58" },
];

export const SIZES = [
  { id: "xs", label: "XS", value: "xs" },
  { id: "s", label: "S", value: "s" },
  { id: "m", label: "M", value: "m" },
  { id: "l", label: "L", value: "l" },
  { id: "xl", label: "XL", value: "xl" },
  { id: "xxl", label: "2XL", value: "2xl" },
  { id: "xxxl", label: "3XL", value: "3xl" },
];

export const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "Classic Mountain Wool Sweater",
    category: "mens",
    price: 89.99,
    originalPrice: 129.99,
    rating: 4.8,
    reviews: 245,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&h=600&fit=crop",
    ],
    description: "Premium wool sweater perfect for mountain adventures",
    colors: ["navy", "cream", "charcoal"],
    sizes: ["s", "m", "l", "xl", "xxl"],
    inStock: true,
    stock: 45,
    material: "100% Merino Wool",
    care: "Hand wash in cold water",
  },
  {
    id: "2",
    name: "Traditional Himalayan Shawl",
    category: "accessories",
    price: 129.99,
    originalPrice: 169.99,
    rating: 4.9,
    reviews: 189,
    image:
      "https://images.unsplash.com/photo-1751797576961-76372820bb2a?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      images: [
      "https://images.unsplash.com/photo-1751797576961-76372820bb2a?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",

    ],
    description: "Handwoven traditional shawl from mountain artisans",
    colors: ["navy", "burgundy", "cream", "mustard"],
    sizes: ["one"],
    inStock: true,
    stock: 23,
    material: "Pashmina Blend",
    care: "Dry clean recommended",
  },
  {
    id: "3",
    name: "Women's Mountain Jacket",
    category: "womens",
    price: 159.99,
    originalPrice: 199.99,
    rating: 4.7,
    reviews: 156,
    image:
      "https://media.columbia.com/i/columbia/2085051_397_f_om?w=768&h=806&fmt=auto",
      images: [
      "https://media.columbia.com/i/columbia/2085051_397_f_om?w=768&h=806&fmt=auto",

    ],
    description: "Waterproof jacket designed for mountain weather",
    colors: ["black", "olive"],
    sizes: ["xs", "s", "m", "l", "xl"],
    inStock: true,
    stock: 32,
    material: "Polyester with Gore-Tex lining",
    care: "Machine wash warm",
  },
  {
    id: "4",
    name: "Kids' Cozy Fleece Hoodie",
    category: "kids",
    price: 54.99,
    originalPrice: 74.99,
    rating: 4.6,
    reviews: 98,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7RaHWLMTfyRg7adl7mMVNE6D6GQA89EBfDA&s",
      images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7RaHWLMTfyRg7adl7mMVNE6D6GQA89EBfDA&s",
    
    ],
    description: "Soft and warm fleece hoodie perfect for kids",
    colors: ["navy", "cream"],
    sizes: ["xs", "s", "m", "l"],
    inStock: true,
    stock: 67,
    material: "100% Polyester Fleece",
    care: "Machine wash cold",
  },
  {
    id: "5",
    name: "Wool Blend Pants",
    category: "mens",
    price: 99.99,
    originalPrice: 139.99,
    rating: 4.5,
    reviews: 134,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0iDFIgALovzgm61pUMLOxtYFj762yP22Ivw&s",
      images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0iDFIgALovzgm61pUMLOxtYFj762yP22Ivw&s",

    ],
    description: "Comfortable wool blend pants for all seasons",
    colors: ["charcoal", "navy", "black"],
    sizes: ["s", "m", "l", "xl", "xxl"],
    inStock: true,
    stock: 38,
    material: "60% Wool, 40% Polyester",
    care: "Dry clean recommended",
  },
  {
    id: "6",
    name: "Women's Cashmere Cardigan",
    category: "womens",
    price: 199.99,
    originalPrice: 299.99,
    rating: 4.9,
    reviews: 267,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAP9pT7As6carMNvjIZnwam3VtkT9Jcw-lTw&s",
      images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAP9pT7As6carMNvjIZnwam3VtkT9Jcw-lTw&s",

    ],
    description: "Luxurious cashmere cardigan for ultimate comfort",
    colors: ["cream", "burgundy", "charcoal"],
    sizes: ["xs", "s", "m", "l"],
    inStock: true,
    stock: 15,
    material: "100% Pure Cashmere",
    care: "Hand wash in lukewarm water",
  },
  {
    id: "7",
    name: "Wool Beanie Hat",
    category: "accessories",
    price: 34.99,
    originalPrice: 49.99,
    rating: 4.7,
    reviews: 212,
    image:
      "https://communityclothing.co.uk/cdn/shop/files/Male_Lambswool-Beanie-Hat_Charcoal_Editorial25Community-Clothing_1200x.jpg?v=1764341342",
      images: [
      "https://communityclothing.co.uk/cdn/shop/files/Male_Lambswool-Beanie-Hat_Charcoal_Editorial25Community-Clothing_1200x.jpg?v=1764341342",
      
    ],
    description: "Classic wool beanie for mountain expeditions",
    colors: ["black", "navy", "cream", "mustard"],
    sizes: ["one"],
    inStock: true,
    stock: 89,
    material: "100% Merino Wool",
    care: "Hand wash and lay flat to dry",
  },
  {
    id: "8",
    name: "Thermal Base Layer",
    category: "mens",
    price: 69.99,
    originalPrice: 99.99,
    rating: 4.6,
    reviews: 145,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop",
    ],
    description: "Moisture-wicking thermal layer for active pursuits",
    colors: ["black", "navy"],
    sizes: ["s", "m", "l", "xl", "xxl"],
    inStock: true,
    stock: 52,
    material: "85% Polyester, 15% Spandex",
    care: "Machine wash warm",
  },
];
