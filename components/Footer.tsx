"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail } from "lucide-react";
import { BRAND_CONFIG } from "@/lib/data/constants";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300 dark:text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-mountain-600 to-earth-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">HT</span>
              </div>
              <div>
                <h3 className="font-bold text-white">{BRAND_CONFIG.name}</h3>
                <p className="text-xs">{BRAND_CONFIG.tagline}</p>
              </div>
            </div>
            <p className="text-sm">{BRAND_CONFIG.description}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="hover:text-mountain-400 transition-colors">Shop All</Link></li>
              <li><Link href="/products?category=mens" className="hover:text-mountain-400 transition-colors">Men's</Link></li>
              <li><Link href="/products?category=womens" className="hover:text-mountain-400 transition-colors">Women's</Link></li>
              <li><Link href="/products?category=kids" className="hover:text-mountain-400 transition-colors">Kids</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-mountain-400 transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-mountain-400 transition-colors">Contact</Link></li>
              <li><Link href="#" className="hover:text-mountain-400 transition-colors">Shipping Info</Link></li>
              <li><Link href="#" className="hover:text-mountain-400 transition-colors">Returns</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-white mb-4">Newsletter</h4>
            <p className="text-sm mb-4">Subscribe for updates and exclusive offers</p>
            <form className="space-y-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-3 py-2 bg-gray-800 dark:bg-gray-700 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-mountain-600"
              />
              <button className="w-full bg-mountain-600 hover:bg-mountain-700 text-white font-semibold py-2 rounded transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Social Links */}
          <div className="flex gap-4">
            <a href={BRAND_CONFIG.social.facebook} className="text-gray-400 hover:text-mountain-400 transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href={BRAND_CONFIG.social.instagram} className="text-gray-400 hover:text-mountain-400 transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href={BRAND_CONFIG.social.twitter} className="text-gray-400 hover:text-mountain-400 transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="mailto:info@himalayanthreads.com" className="text-gray-400 hover:text-mountain-400 transition-colors">
              <Mail className="w-5 h-5" />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-center">
            © {new Date().getFullYear()} {BRAND_CONFIG.name}. All rights reserved.
          </p>

          {/* Links */}
          <div className="flex gap-4 text-sm">
            <Link href="#" className="hover:text-mountain-400 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-mountain-400 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
