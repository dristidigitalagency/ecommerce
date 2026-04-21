"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/store/useCartStore";
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <Link href="/products" className="flex items-center gap-2 text-mountain-600 dark:text-mountain-400 hover:text-mountain-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>

        <h1 className="page-title mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          // Empty Cart
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
              <ShoppingBag className="w-10 h-10 text-gray-600 dark:text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Add some items to get started
            </p>
            <Link
              href="/products"
              className="inline-block bg-mountain-600 hover:bg-mountain-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="space-y-6">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 pb-6 border-b border-gray-200 dark:border-gray-700 last:pb-0 last:border-0"
                    >
                      {/* Product Image */}
                      <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={120}
                          height={120}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {item.name}
                          </h3>
                          <p className="text-lg font-bold text-mountain-600 dark:text-mountain-400 mt-1">
                            {formatPrice(item.price)}
                          </p>
                        </div>

                        {/* Quantity Control */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="p-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.id, parseInt(e.target.value))
                            }
                            className="input-field w-12 text-center"
                            min="1"
                          />
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="p-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Subtotal & Remove */}
                      <div className="flex flex-col justify-between items-end">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-20">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                  Order Summary
                </h2>

                {/* Summary Items */}
                <div className="space-y-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>{formatPrice(getTotal())}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <span>{getTotal() > 100 ? "Free" : formatPrice(9.99)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tax</span>
                    <span>{formatPrice(getTotal() * 0.1)}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between mb-6">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-mountain-600 dark:text-mountain-400">
                    {formatPrice(
                      getTotal() + (getTotal() > 100 ? 0 : 9.99) + getTotal() * 0.1
                    )}
                  </span>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  className="w-full block text-center bg-mountain-600 hover:bg-mountain-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors mb-3"
                >
                  Proceed to Checkout
                </Link>

                {/* Clear Cart Button */}
                <button
                  onClick={clearCart}
                  className="w-full text-center border-2 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Clear Cart
                </button>

                {/* Free Shipping Info */}
                {getTotal() < 100 && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Add {formatPrice(100 - getTotal())} more to get free shipping!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
                