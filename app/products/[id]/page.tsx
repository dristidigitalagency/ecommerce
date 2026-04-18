"use client";

import { useEffect, useState, use } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import Image from "next/image";
import { useCartStore } from "@/lib/store/useCartStore";
import { ShoppingCart } from "lucide-react";

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const docRef = doc(db, "products", resolvedParams.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [resolvedParams.id]);

  const handleAddToCart = () => {
    if (product) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      });
      // Optionally show a toast notification here
      alert("Added to cart");
    }
  };

  if (loading) return <div className="text-center py-20">Loading product...</div>;
  if (!product) return <div className="text-center py-20">Product not found.</div>;

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 xl:gap-x-16">
          <div className="lg:max-w-lg lg:self-end">
            <div className="aspect-w-4 aspect-h-3 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden relative h-96">
              {product.imageUrl ? (
                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">No Image</div>
              )}
            </div>
          </div>

          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              {product.name}
            </h1>
            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl text-gray-900 dark:text-white">${Number(product.price).toFixed(2)}</p>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <div className="text-base text-gray-700 dark:text-gray-300 space-y-6">
                <p>{product.description}</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Category: <span className="font-medium text-gray-900 dark:text-white">{product.category}</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Stock: <span className="font-medium text-gray-900 dark:text-white">{product.stock} available</span>
              </p>
            </div>

            <div className="mt-10 flex">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="max-w-xs flex-1 bg-teal-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-teal-500 sm:w-full disabled:bg-gray-400"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
