"use client";

import { useCartStore } from "@/lib/store/useCartStore";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus } from "lucide-react";

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 min-h-screen pt-20 px-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Your Cart is Empty</h1>
        <Link href="/products" className="text-teal-600 hover:text-teal-500 font-medium">
          Continue Shopping &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Shopping Cart</h1>
        
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          <div className="lg:col-span-7">
            <ul className="border-t border-b border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((item) => (
                <li key={item.id} className="flex py-6 sm:py-10">
                  <div className="flex-shrink-0 relative w-24 h-24 sm:w-32 sm:h-32 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-800">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-gray-500">No Image</div>
                    )}
                  </div>

                  <div className="ml-4 flex-1 flex flex-col justify-between sm:ml-6">
                    <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                      <div>
                        <div className="flex justify-between">
                          <h3 className="text-sm">
                            <Link href={`/products/${item.id}`} className="font-medium text-gray-700 dark:text-gray-200 hover:text-gray-800">
                              {item.name}
                            </Link>
                          </h3>
                        </div>
                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">${Number(item.price).toFixed(2)}</p>
                      </div>

                      <div className="mt-4 sm:mt-0 sm:pr-9 flex items-center">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-gray-400 hover:text-gray-500"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="mx-2 text-gray-700 dark:text-gray-300">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-gray-400 hover:text-gray-500"
                        >
                          <Plus size={16} />
                        </button>

                        <div className="absolute top-0 right-0">
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="-m-2 p-2 inline-flex text-gray-400 hover:text-red-500"
                          >
                            <span className="sr-only">Remove</span>
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Order summary */}
          <div className="mt-16 bg-white dark:bg-gray-800 rounded-lg px-4 py-6 sm:p-6 lg:p-8 lg:mt-0 lg:col-span-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Order summary</h2>
            
            <dl className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600 dark:text-gray-400">Subtotal</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">${getTotal().toFixed(2)}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                <dt className="flex text-sm text-gray-600 dark:text-gray-400">
                  <span>Shipping estimate</span>
                </dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">$5.00</dd>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                <dt className="text-base font-medium text-gray-900 dark:text-white">Order total</dt>
                <dd className="text-base font-medium text-gray-900 dark:text-white">${(getTotal() + 5).toFixed(2)}</dd>
              </div>
            </dl>

            <div className="mt-6">
              <Link
                href="/checkout"
                className="w-full bg-teal-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-teal-500 block text-center"
              >
                Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
