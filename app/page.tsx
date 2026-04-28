"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductCard } from "@/components/ProductCard";
import { useCartStore } from "@/lib/store/useCartStore";
import { MOCK_PRODUCTS, BRAND_CONFIG } from "@/lib/data/constants";
import { ArrowRight, Truck, Shield, RotateCcw } from "lucide-react";

export default function Home() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [featured, setFeatured] = useState(MOCK_PRODUCTS.slice(0, 8));
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    // In a real app, fetch from Firebase
    setProducts(MOCK_PRODUCTS);
    setFeatured(MOCK_PRODUCTS.slice(0, 8));
  }, []);

  const handleAddToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.image,
      });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative h-screen sm:h-96 flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop"
            alt="Mountain landscape"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40 dark:from-black/80 dark:to-black/50"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="inline-block w-16 h-16 bg-gradient-to-br from-mountain-600 to-earth-600 rounded-lg flex items-center justify-center mb-4">
              <span className="text-white font-bold text-3xl">HT</span>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
            {BRAND_CONFIG.name}
          </h1>
          <p className="text-lg sm:text-xl text-gray-100 mb-2">{BRAND_CONFIG.tagline}</p>
          <p className="text-base sm:text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
            {BRAND_CONFIG.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 bg-mountain-600 hover:bg-mountain-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Shop Now <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#featured"
              className="inline-flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-lg font-semibold transition-colors backdrop-blur"
            >
              Explore Featured
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 sm:py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-mountain-100 dark:bg-mountain-900 rounded-lg mb-4">
                <Truck className="w-6 h-6 text-mountain-600 dark:text-mountain-400" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Free Shipping</h3>
              <p className="text-gray-600 dark:text-gray-400">On orders over $100</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-mountain-100 dark:bg-mountain-900 rounded-lg mb-4">
                <Shield className="w-6 h-6 text-mountain-600 dark:text-mountain-400" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Secure Checkout</h3>
              <p className="text-gray-600 dark:text-gray-400">100% encrypted payments</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-mountain-100 dark:bg-mountain-900 rounded-lg mb-4">
                <RotateCcw className="w-6 h-6 text-mountain-600 dark:text-mountain-400" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Easy Returns</h3>
              <p className="text-gray-600 dark:text-gray-400">30-day money-back guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="featured" className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Collections
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover our most popular mountain wear and accessories, handpicked for quality and authenticity
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 bg-mountain-600 hover:bg-mountain-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              View All Products <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
            Shop by Category
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "Men's Collection",
                href: "/products?category=mens",
                image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop",
              },
              {
                name: "Women's Collection",
                href: "/products?category=womens",
                image: "https://media.columbia.com/i/columbia/2085051_397_f_om?w=768&h=806&fmt=auto",
              },
              {
                name: "Kids Collection",
                href: "/products?category=kids",
                image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7RaHWLMTfyRg7adl7mMVNE6D6GQA89EBfDA&s",
              },
              {
                name: "Accessories",
                href: "/products?category=accessories",
                image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0iDFIgALovzgm61pUMLOxtYFj762yP22Ivw&s",
              },
            ].map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-mountain transition-all duration-300 h-48 sm:h-56"
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 group-hover:from-black/80 transition-colors"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-lg sm:text-xl font-bold text-white">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-mountain-600 to-earth-600">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-white/90 mb-8">
            Subscribe to our newsletter for exclusive offers and new collection announcements
          </p>
          <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-mountain-600 hover:bg-gray-100 font-semibold px-6 py-3 rounded-lg transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
        
    