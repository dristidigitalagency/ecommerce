"use client";

import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { useCartStore } from "@/lib/store/useCartStore";
import { ShoppingCart, User as UserIcon, LogOut, Menu, X } from "lucide-react";
import { auth } from "@/lib/firebase/client";
import { signOut } from "firebase/auth";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { BRAND_CONFIG } from "@/lib/data/constants";
import Image from 'next/image';
export function Navbar() {
  const { user, userData } = useAuth();
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-16   h-10 bg-gradient-to-br from-mountain-100 to-earth-200 rounded-lg flex items-center justify-center">
                {/* <span className="text-white font-bold text-lg">HT</span> */}
                <Image
                  src="/logo.png"
                  alt="Hiker's Trail Logo"
                  className="w-16  object-cover rounded-lg"
                  width={50}
                  height={50}
                />
              </div>
              <div className=" sm:block">
                <h1 className="text-lg font-bold text-mountain-600 dark:text-mountain-400">{BRAND_CONFIG.name}</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-none">{BRAND_CONFIG.tagline}</p>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-gray-700 dark:text-gray-300 hover:text-mountain-600 dark:hover:text-mountain-400 font-medium transition-colors">
              Products
            </Link>
            <Link href="/products?category=mens" className="text-gray-700 dark:text-gray-300 hover:text-mountain-600 dark:hover:text-mountain-400 font-medium transition-colors">
              Men's
            </Link>
            <Link href="/products?category=womens" className="text-gray-700 dark:text-gray-300 hover:text-mountain-600 dark:hover:text-mountain-400 font-medium transition-colors">
              Women's
            </Link>
            <Link href="/products?category=kids" className="text-gray-700 dark:text-gray-300 hover:text-mountain-600 dark:hover:text-mountain-400 font-medium transition-colors">
              Kids
            </Link>
            <Link href="/products?category=accessories" className="text-gray-700 dark:text-gray-300 hover:text-mountain-600 dark:hover:text-mountain-400 font-medium transition-colors">
              Accessories
            </Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />

            <Link href="/cart" className="relative text-gray-700 dark:text-gray-300 hover:text-mountain-600 dark:hover:text-mountain-400 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden md:flex items-center space-x-4">
                {userData?.role === "admin" && (
                  <Link href="/admin" className="text-gray-700 dark:text-gray-300 hover:text-mountain-600 dark:hover:text-mountain-400 font-medium transition-colors">
                    Admin
                  </Link>
                )}
                <Link href="/profile/orders" className="text-gray-700 dark:text-gray-300 hover:text-mountain-600 dark:hover:text-mountain-400 transition-colors">
                  <UserIcon className="w-6 h-6" />
                </Link>
                <button onClick={handleLogout} className="text-gray-700 dark:text-gray-300 hover:text-red-500 transition-colors">
                  <LogOut className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="hidden md:inline-block text-gray-700 dark:text-gray-300 hover:text-mountain-600 dark:hover:text-mountain-400 font-medium transition-colors">
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-700 dark:text-gray-300 hover:text-mountain-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 dark:border-gray-800">
            <div className="space-y-3 pt-4">
              <Link href="/products" className="block text-gray-700 dark:text-gray-300 hover:text-mountain-600 py-2 transition-colors">
                Products
              </Link>
              <Link href="/products?category=mens" className="block text-gray-700 dark:text-gray-300 hover:text-mountain-600 py-2 transition-colors">
                Men's
              </Link>
              <Link href="/products?category=womens" className="block text-gray-700 dark:text-gray-300 hover:text-mountain-600 py-2 transition-colors">
                Women's
              </Link>
              <Link href="/products?category=kids" className="block text-gray-700 dark:text-gray-300 hover:text-mountain-600 py-2 transition-colors">
                Kids
              </Link>
              <Link href="/products?category=accessories" className="block text-gray-700 dark:text-gray-300 hover:text-mountain-600 py-2 transition-colors">
                Accessories
              </Link>

              {user ? (
                <>
                  {userData?.role === "admin" && (
                    <Link href="/admin" className="block text-gray-700 dark:text-gray-300 hover:text-mountain-600 py-2 transition-colors">
                      Admin
                    </Link>
                  )}
                  <Link href="/profile/orders" className="block text-gray-700 dark:text-gray-300 hover:text-mountain-600 py-2 transition-colors">
                    My Orders
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left text-gray-700 dark:text-gray-300 hover:text-red-500 py-2 transition-colors">
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login" className="block text-gray-700 dark:text-gray-300 hover:text-mountain-600 py-2 transition-colors">
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
