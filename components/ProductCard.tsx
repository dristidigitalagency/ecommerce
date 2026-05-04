"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { formatPrice, calculateDiscount, getCloudFrontUrl } from "@/lib/utils";
import { useState } from "react";
import { COLORS } from "@/lib/data/constants";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  imageUrl?: string;
  images?: Record<string, string>;
  colors?: string[];
  defaultColor?: string;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  stock?: number | Record<string, number>;
  onAddToCart?: (id: string) => void;
  category?: string;
}

function getTotalStock(stock: number | Record<string, number> | undefined): number {
  if (stock === undefined) return 0;
  if (typeof stock === "number") return stock;
  return Object.values(stock).reduce((sum, v) => sum + (Number(v) || 0), 0);
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id, name, price, originalPrice, image, imageUrl, images, colors,
  defaultColor, rating = 0, reviews = 0, inStock, stock, onAddToCart, category,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [activeColor, setActiveColor] = useState<string>(defaultColor || colors?.[0] || "default");

  const totalStock = getTotalStock(stock);
  const effectiveInStock = inStock !== undefined ? inStock : totalStock > 0;

  function getDisplayImage(): string {
    // Try new images map keyed by activeColor
    if (images && typeof images === "object") {
      const key = activeColor !== "default" ? activeColor : (defaultColor || Object.keys(images)[0]);
      if (key && images[key]) return getCloudFrontUrl(images[key]);
      const firstKey = Object.keys(images)[0];
      if (firstKey && images[firstKey]) return getCloudFrontUrl(images[firstKey]);
    }
    // Fallback to legacy single image
    return getCloudFrontUrl(image || imageUrl || "");
  }

  const discount = originalPrice ? calculateDiscount(originalPrice, price) : 0;

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(id);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  const displayImage = getDisplayImage();

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md dark:shadow-lg hover:shadow-mountain dark:hover:shadow-mountain transition-all duration-300 animate-fadeIn">
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-700 h-64 sm:h-72">
        <Link href={`/products/${id}`}>
          {displayImage ? (
            <Image
              src={displayImage}
              alt={name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}
        </Link>

        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
            -{discount}%
          </div>
        )}

        {!effectiveInStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}

        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-3 left-3 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors"
        >
          <Heart className={`w-5 h-5 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600 dark:text-gray-400"}`} />
        </button>

        <button
          onClick={handleAddToCart}
          disabled={!effectiveInStock}
          className={`absolute bottom-3 right-3 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 ${
            isAdded
              ? "bg-green-500 text-white"
              : effectiveInStock
                ? "bg-mountain-600 dark:bg-mountain-500 text-white hover:bg-mountain-700 dark:hover:bg-mountain-600"
                : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {category && (
          <p className="text-xs text-mountain-600 dark:text-mountain-400 font-semibold uppercase mb-1">{category}</p>
        )}

        <Link href={`/products/${id}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-2 hover:text-mountain-600 dark:hover:text-mountain-400 transition-colors">
            {name}
          </h3>
        </Link>

        {/* Color swatches */}
        {colors && colors.length > 0 && (
          <div className="flex gap-1.5 mt-2">
            {colors.map(colorId => {
              const colorDef = COLORS.find(c => c.id === colorId);
              return (
                <button
                  key={colorId}
                  onClick={() => setActiveColor(colorId)}
                  title={colorDef?.name || colorId}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${
                    activeColor === colorId
                      ? "border-gray-900 dark:border-white scale-110"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                  style={{ backgroundColor: colorDef?.hex || "#ccc" }}
                />
              );
            })}
          </div>
        )}

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-2 mt-2 mb-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}`} />
              ))}
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">({reviews})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-lg font-bold text-mountain-600 dark:text-mountain-400">{formatPrice(price)}</span>
          {originalPrice && (
            <span className="text-sm text-gray-500 dark:text-gray-400 line-through">{formatPrice(originalPrice)}</span>
          )}
        </div>
      </div>
    </div>
  );
};
