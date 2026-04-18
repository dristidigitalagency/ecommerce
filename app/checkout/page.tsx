"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store/useCartStore";
import { useAuth } from "@/lib/context/AuthContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";

export default function Checkout() {
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuth();
  const router = useRouter();

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);

  // if (items.length === 0) {
  //   router.push("/cart");
  //   return null;
  // }

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items, router]);

  if (items.length === 0) {
    return null; // or loading UI
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to place an order");
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        userId: user.uid,
        items: items,
        totalAmount: getTotal() + 5, // including shipping
        status: "PENDING",
        shippingAddress: {
          address,
          city,
          zip,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "orders"), orderData);
      clearCart();
      router.push("/profile/orders");




    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Shipping Information</h2>
            <form onSubmit={handlePlaceOrder} className="space-y-6" id="checkout-form">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                <input required type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm px-3 py-2 border text-gray-900 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                  <input required type="text" value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm px-3 py-2 border text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">ZIP</label>
                  <input required type="text" value={zip} onChange={(e) => setZip(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm px-3 py-2 border text-gray-900 dark:text-white" />
                </div>
              </div>
            </form>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Order Summary</h2>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <ul className="divide-y divide-gray-200 dark:divide-gray-600 mb-4">
                {items.map((item) => (
                  <li key={item.id} className="py-3 flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">{item.name} x {item.quantity}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Subtotal</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">${getTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Shipping</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">$5.00</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-600 pt-2 mt-2 text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>${(getTotal() + 5).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              form="checkout-form"
              type="submit"
              disabled={loading}
              className="mt-6 w-full bg-teal-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-teal-500 disabled:bg-gray-400"
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
