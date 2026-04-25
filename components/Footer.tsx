"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone, MessageCircle } from "lucide-react";
import { BRAND_CONFIG } from "@/lib/data/constants";

export const Footer: React.FC = () => {
  const ownerEmail = process.env.NEXT_PUBLIC_OWNER_EMAIL || "info@himalayanthreads.com";
  const phoneNumber = process.env.NEXT_PUBLIC_PHONE_NUMBER || "";
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const address = process.env.NEXT_PUBLIC_ADDRESS || "";
  const facebookLink = process.env.NEXT_PUBLIC_FACEBOOK_LINK || "#";
  const twitterLink = process.env.NEXT_PUBLIC_TWITTER_LINK || "#";
  const instagramLink = process.env.NEXT_PUBLIC_INSTAGRAM_LINK || "#";
  const linkedinLink = process.env.NEXT_PUBLIC_LINKEDIN_LINK || "#";
  const tiktokLink = process.env.NEXT_PUBLIC_TIKTOK_LINK || "#";

  const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}` : "#";

  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300 dark:text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
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

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-white mb-4">Contact Info</h4>
            <div className="space-y-3 text-sm">
              {ownerEmail && (
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 mt-0.5 text-mountain-400 flex-shrink-0" />
                  <a href={`mailto:${ownerEmail}`} className="hover:text-mountain-400 transition-colors break-all">
                    {ownerEmail}
                  </a>
                </div>
              )}
              {phoneNumber && (
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 mt-0.5 text-mountain-400 flex-shrink-0" />
                  <a href={`tel:${phoneNumber.replace(/\s/g, "")}`} className="hover:text-mountain-400 transition-colors">
                    {phoneNumber}
                  </a>
                </div>
              )}
              {whatsappNumber && (
                <div className="flex items-start gap-2">
                  <MessageCircle className="w-4 h-4 mt-0.5 text-mountain-400 flex-shrink-0" />
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-mountain-400 transition-colors">
                    WhatsApp
                  </a>
                </div>
              )}
              {address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-mountain-400 flex-shrink-0" />
                  <p>{address}</p>
                </div>
              )}
            </div>
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
            {facebookLink !== "#" && (
              <a href={facebookLink} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-mountain-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            )}
            {instagramLink !== "#" && (
              <a href={instagramLink} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-mountain-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {twitterLink !== "#" && (
              <a href={twitterLink} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-mountain-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            )}
            {ownerEmail && (
              <a href={`mailto:${ownerEmail}`} className="text-gray-400 hover:text-mountain-400 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            )}
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
