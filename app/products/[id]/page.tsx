"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { COLORS, SIZES } from "@/lib/data/constants";
import { useCartStore } from "@/lib/store/useCartStore";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { Star, Heart, ShoppingCart, Truck, RotateCcw, Check } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const docSnap = await getDoc(doc(db, "products", productId));
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as any;
          setProduct(data);
          setSelectedColor(data?.colors?.[0] || "");
          setSelectedSize(data?.sizes?.[0] || "");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 dark:text-gray-400">Loading product...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="page-title">Product not found</h1>
          <Link href="/products" className="text-mountain-600 dark:text-mountain-400 hover:underline mt-4">
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? calculateDiscount(product.originalPrice, product.price)
    : 0;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.image,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const colorData = COLORS.find((c) => c.id === selectedColor);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex gap-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          <Link href="/" className="hover:text-mountain-600">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-mountain-600">Products</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden group">
              <Image
                src={product.images?.[currentImageIndex] || product.image}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                priority
              />
              {discount > 0 && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded font-bold">
                  -{discount}%
                </div>
              )}
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 0 && (
              <div className="flex gap-2">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${currentImageIndex === idx
                        ? "border-mountain-600"
                        : "border-gray-300 dark:border-gray-600"
                      }`}
                  >
                    <Image src={img} alt={`View ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
              {/* Category & Title */}
              <div>
                <p className="text-sm font-semibold text-mountain-600 dark:text-mountain-400 uppercase mb-2">
                  {product.category}
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                  {product.name}
                </h1>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 dark:text-gray-600"
                        }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-mountain-600 dark:text-mountain-400">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="text-sm font-semibold text-red-500 bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded">
                    Save {discount}%
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {product.description}
              </p>

              {/* Material & Care */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Material</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{product.material}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Care</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{product.care}</p>
                </div>
              </div>

              {/* Color Selection */}
              {product.colors.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Color: {colorData?.name}
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {product.colors.map((colorId: string) => {
                      const color = COLORS.find((c) => c.id === colorId);
                      return (
                        <button
                          key={colorId}
                          onClick={() => setSelectedColor(colorId)}
                          className={`relative w-10 h-10 rounded-lg border-2 transition-all ${selectedColor === colorId
                              ? "border-gray-900 dark:border-white ring-2 ring-mountain-600"
                              : "border-gray-300 dark:border-gray-600"
                            }`}
                          style={{ backgroundColor: color?.hex }}
                          title={color?.name}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Size: {SIZES.find((s) => s.id === selectedSize)?.label}
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {product.sizes.map((sizeId: string) => {
                      const size = SIZES.find((s) => s.id === sizeId);
                      return (
                        <button
                          key={sizeId}
                          onClick={() => setSelectedSize(sizeId)}
                          className={`py-2 px-4 rounded border-2 font-semibold transition-all ${selectedSize === sizeId
                              ? "bg-mountain-600 dark:bg-mountain-500 text-white border-mountain-600 dark:border-mountain-500"
                              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                            }`}
                        >
                          {size?.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-semibold text-gray-900 dark:text-white">Quantity:</label>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 text-center border-l border-r border-gray-300 dark:border-gray-600 bg-transparent"
                    min="1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  {product.inStock ? `${product.stock} in stock` : "Out of stock"}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all ${isAdded
                      ? "bg-green-500 text-white"
                      : product.inStock
                        ? "bg-mountain-600 hover:bg-mountain-700 dark:hover:bg-mountain-600 text-white"
                        : "bg-gray-400 cursor-not-allowed text-white"
                    }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {isAdded ? "Added to Cart!" : "Add to Cart"}
                </button>
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="flex items-center justify-center w-12 h-12 border-2 border-mountain-600 dark:border-mountain-500 text-mountain-600 dark:text-mountain-400 rounded-lg hover:bg-mountain-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-mountain-600 dark:text-mountain-400 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900 dark:text-white">Free Shipping</p>
                    <p className="text-gray-600 dark:text-gray-400">On orders over Rs. 1000</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RotateCcw className="w-5 h-5 text-mountain-600 dark:text-mountain-400 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900 dark:text-white">Easy Returns</p>
                    <p className="text-gray-600 dark:text-gray-400">30-day guarantee</p>
                  </div>
                </div>
              </div>

              {/* Related Products Link */}
              <Link
                href="/products"
                className="inline-block text-mountain-600 dark:text-mountain-400 hover:text-mountain-700 dark:hover:text-mountain-300 font-semibold"
              >
                ← View More Products
              </Link>
            </div>
          </div>
        </div>
      </div>
  
  );
}