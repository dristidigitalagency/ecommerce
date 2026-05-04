"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { COLORS, SIZES } from "@/lib/data/constants";
import { useCartStore } from "@/lib/store/useCartStore";
import { formatPrice, calculateDiscount, getCloudFrontUrl } from "@/lib/utils";
import { Star, Heart, ShoppingCart, Truck, RotateCcw, Check, AlertCircle } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

function resolveImage(product: any, colorKey: string): string {
  if (product.images && typeof product.images === "object" && !Array.isArray(product.images)) {
    const key = colorKey || product.defaultColor || "default";
    const url = product.images[key] || product.images[product.defaultColor] || product.images["default"] || Object.values(product.images)[0];
    if (url) return getCloudFrontUrl(url as string);
  }
  return getCloudFrontUrl(product.imageUrl || product.image || "");
}

function resolveStock(product: any, colorKey: string, sizeKey: string): number {
  if (!product.stock) return 0;
  if (typeof product.stock === "number") return product.stock;
  if (typeof product.stock === "object") {
    const hc = product.hasColors ?? (product.colors?.length > 0);
    const hs = product.hasSizes ?? (product.sizes?.length > 0);
    if (hc && hs && colorKey && sizeKey) return Number(product.stock[`${colorKey}|${sizeKey}`] || 0);
    if (hc && colorKey) return Number(product.stock[colorKey] || 0);
    if (hs && sizeKey) return Number(product.stock[sizeKey] || 0);
    return Number(product.stock["default"] || 0);
  }
  return 0;
}

function getSizeStockForColor(product: any, colorKey: string, sizeKey: string): number {
  if (!product.stock || typeof product.stock !== "object") return 0;
  const hc = product.hasColors ?? (product.colors?.length > 0);
  const hs = product.hasSizes ?? (product.sizes?.length > 0);
  if (hc && hs) return Number(product.stock[`${colorKey}|${sizeKey}`] || 0);
  if (hs) return Number(product.stock[sizeKey] || 0);
  return 0;
}

function getFirstAvailableSize(product: any, colorKey: string): string {
  if (!product.sizes?.length) return "";
  for (const s of product.sizes) {
    if (getSizeStockForColor(product, colorKey, s) > 0) return s;
  }
  return product.defaultSize || product.sizes[0] || "";
}

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

  useEffect(() => {
    async function fetchProduct() {
      try {
        const docSnap = await getDoc(doc(db, "products", productId));
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as any;
          setProduct(data);
          const initColor = data.defaultColor || data.colors?.[0] || "";
          setSelectedColor(initColor);
          setSelectedSize(data.defaultSize || getFirstAvailableSize(data, initColor) || data.sizes?.[0] || "");
        }
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    }
    fetchProduct();
  }, [productId]);

  // When color changes, auto-pick first available size
  const handleColorChange = (colorId: string) => {
    setSelectedColor(colorId);
    if (product?.hasSizes || product?.sizes?.length > 0) {
      const avail = getFirstAvailableSize(product, colorId);
      setSelectedSize(avail);
    }
  };

  if (loading) return <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center"><div className="text-gray-600 dark:text-gray-400">Loading product...</div></div>;
  if (!product) return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center"><h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Product not found</h1><Link href="/products" className="text-mountain-600 hover:underline">Back to products</Link></div>
    </div>
  );

  const discount = product.originalPrice ? calculateDiscount(product.originalPrice, product.price) : 0;
  const hasColors = product.hasColors ?? (Array.isArray(product.colors) && product.colors.length > 0);
  const hasSizes = product.hasSizes ?? (Array.isArray(product.sizes) && product.sizes.length > 0);
  const currentStock = resolveStock(product, selectedColor, selectedSize);
  const isInStock = currentStock > 0;
  const displayImage = resolveImage(product, selectedColor);
  const colorData = COLORS.find(c => c.id === selectedColor);

  const handleAddToCart = () => {
    addItem({ id: product.id, name: product.name, price: product.price, imageUrl: displayImage, color: selectedColor || undefined, size: selectedSize || undefined } as any);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex gap-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          <Link href="/" className="hover:text-mountain-600">Home</Link><span>/</span>
          <Link href="/products" className="hover:text-mountain-600">Products</Link><span>/</span>
          <span className="text-gray-900 dark:text-white">{product.name}</span>
        </nav>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden group">
              {displayImage ? (
                <Image src={displayImage} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" priority />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No image available</div>
              )}
              {discount > 0 && <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded font-bold">-{discount}%</div>}
              {!isInStock && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-white font-bold text-lg">Out of Stock</span></div>}
            </div>
            {/* Color image thumbnails */}
            {hasColors && product.colors && product.colors.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((colorId: string) => {
                  const colorDef = COLORS.find(c => c.id === colorId);
                  const thumbSrc = resolveImage(product, colorId);
                  return (
                    <button key={colorId} onClick={() => handleColorChange(colorId)} title={colorDef?.name || colorId}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${selectedColor === colorId ? "border-mountain-600" : "border-gray-300 dark:border-gray-600"}`}>
                      {thumbSrc ? <Image src={thumbSrc} alt={colorDef?.name || colorId} fill className="object-cover" /> : <div className="w-full h-full" style={{ backgroundColor: colorDef?.hex || "#ccc" }} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {/* Details */}
          <div className="space-y-6">
            <div>
              {product.category && <p className="text-sm font-semibold text-mountain-600 dark:text-mountain-400 uppercase mb-2">{product.category}</p>}
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
            </div>
            {product.rating > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}`} />)}
                </div>
                <span className="text-gray-600 dark:text-gray-400">{product.rating} ({product.reviews} reviews)</span>
              </div>
            )}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-mountain-600 dark:text-mountain-400">{formatPrice(product.price)}</span>
              {product.originalPrice && <span className="text-lg text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>}
              {discount > 0 && <span className="text-sm font-semibold text-red-500 bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded">Save {discount}%</span>}
            </div>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{product.description}</p>
            {(product.material || product.care) && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {product.material && <div><p className="text-sm font-semibold text-gray-900 dark:text-white">Material</p><p className="text-sm text-gray-600 dark:text-gray-400">{product.material}</p></div>}
                {product.care && <div><p className="text-sm font-semibold text-gray-900 dark:text-white">Care</p><p className="text-sm text-gray-600 dark:text-gray-400">{product.care}</p></div>}
              </div>
            )}
            {/* Color Selection */}
            {hasColors && product.colors?.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Color: <span className="font-normal text-mountain-600 dark:text-mountain-400">{colorData?.name}</span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((colorId: string) => {
                    const color = COLORS.find(c => c.id === colorId);
                    // Check if this color has any stock at all
                    const colorHasStock = hasSizes
                      ? product.sizes?.some((s: string) => getSizeStockForColor(product, colorId, s) > 0)
                      : resolveStock(product, colorId, "") > 0;
                    return (
                      <button key={colorId} onClick={() => handleColorChange(colorId)} title={`${color?.name}${!colorHasStock ? " (Out of stock)" : ""}`}
                        className={`relative w-10 h-10 rounded-lg border-2 transition-all ${selectedColor === colorId ? "border-gray-900 dark:border-white ring-2 ring-mountain-600" : "border-gray-300 dark:border-gray-600"} ${!colorHasStock ? "opacity-40" : ""}`}
                        style={{ backgroundColor: color?.hex }} />
                    );
                  })}
                </div>
              </div>
            )}
            {/* Size Selection */}
            {hasSizes && product.sizes?.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Size: <span className="font-normal text-mountain-600 dark:text-mountain-400">{SIZES.find(s => s.id === selectedSize)?.label}</span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((sizeId: string) => {
                    const size = SIZES.find(s => s.id === sizeId);
                    const sizeStock = getSizeStockForColor(product, selectedColor, sizeId);
                    const unavailable = hasColors ? sizeStock === 0 : false;
                    return (
                      <button key={sizeId} onClick={() => !unavailable && setSelectedSize(sizeId)} disabled={unavailable}
                        className={`py-2 px-4 rounded border-2 font-semibold transition-all relative ${selectedSize === sizeId ? "bg-mountain-600 dark:bg-mountain-500 text-white border-mountain-600" : unavailable ? "bg-gray-100 dark:bg-gray-700 text-gray-400 border-gray-200 dark:border-gray-600 cursor-not-allowed line-through" : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:border-mountain-400"}`}>
                        {size?.label}
                        {unavailable && <span className="text-xs block text-red-400 leading-none -mt-0.5">sold out</span>}
                      </button>
                    );
                  })}
                </div>
                {/* Per-size stock hint for selected color */}
                {hasColors && selectedColor && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {selectedSize && currentStock > 0 ? `${currentStock} available in ${SIZES.find(s => s.id === selectedSize)?.label}` : selectedSize ? "This size is not available in the selected color" : "Select a size"}
                  </p>
                )}
              </div>
            )}
            {/* Quantity */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-gray-900 dark:text-white">Quantity:</label>
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">−</button>
                <input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-12 text-center border-l border-r border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white" min="1" max={currentStock || undefined} />
                <button onClick={() => setQuantity(Math.min(currentStock || 999, quantity + 1))} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">+</button>
              </div>
            </div>
            {/* Stock Status */}
            <div className={`flex items-center gap-2 p-3 rounded-lg ${isInStock ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20"}`}>
              {isInStock ? <Check className="w-5 h-5 text-green-600 dark:text-green-400" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
              <span className={`text-sm ${isInStock ? "text-green-700 dark:text-green-300" : "text-red-600 dark:text-red-400"}`}>
                {isInStock ? `${currentStock} in stock` : "Out of stock for selected options"}
              </span>
            </div>
            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={handleAddToCart} disabled={!isInStock}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all ${isAdded ? "bg-green-500 text-white" : isInStock ? "bg-mountain-600 hover:bg-mountain-700 text-white" : "bg-gray-400 cursor-not-allowed text-white"}`}>
                <ShoppingCart className="w-5 h-5" />
                {isAdded ? "Added to Cart!" : "Add to Cart"}
              </button>
              <button onClick={() => setIsFavorite(!isFavorite)} className="flex items-center justify-center w-12 h-12 border-2 border-mountain-600 dark:border-mountain-500 text-mountain-600 dark:text-mountain-400 rounded-lg hover:bg-mountain-50 dark:hover:bg-gray-800 transition-colors">
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-start gap-3"><Truck className="w-5 h-5 text-mountain-600 dark:text-mountain-400 shrink-0 mt-0.5" /><div className="text-sm"><p className="font-semibold text-gray-900 dark:text-white">Free Shipping</p><p className="text-gray-600 dark:text-gray-400">On orders over Rs. 1000</p></div></div>
              <div className="flex items-start gap-3"><RotateCcw className="w-5 h-5 text-mountain-600 dark:text-mountain-400 shrink-0 mt-0.5" /><div className="text-sm"><p className="font-semibold text-gray-900 dark:text-white">Easy Returns</p><p className="text-gray-600 dark:text-gray-400">30-day guarantee</p></div></div>
            </div>
            <Link href="/products" className="inline-block text-mountain-600 dark:text-mountain-400 hover:text-mountain-700 font-semibold">← View More Products</Link>
          </div>
        </div>
      </div>
    </div>
  );
}