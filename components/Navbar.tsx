"use client";

import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { useCartStore } from "@/lib/store/useCartStore";
import { ShoppingCart, User as UserIcon, LogOut } from "lucide-react";
import { auth } from "@/lib/firebase/client";
import { signOut } from "firebase/auth";

export function Navbar() {
  const { user, userData } = useAuth();
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              GameChanger
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/products" className="text-gray-700 dark:text-gray-300 hover:text-teal-600">
              Products
            </Link>
            
            <Link href="/cart" className="relative text-gray-700 dark:text-gray-300 hover:text-teal-600">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                {userData?.role === "admin" && (
                  <Link href="/admin" className="text-gray-700 dark:text-gray-300 hover:text-teal-600">
                    Admin
                  </Link>
                )}
                <Link href="/profile/orders" className="text-gray-700 dark:text-gray-300 hover:text-teal-600">
                  <UserIcon className="w-6 h-6" />
                </Link>
                <button onClick={handleLogout} className="text-gray-700 dark:text-gray-300 hover:text-red-500">
                  <LogOut className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-teal-600 font-medium">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
