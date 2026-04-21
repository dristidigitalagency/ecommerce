"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { ProductCard } from "@/components/ProductCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ColorFilter } from "@/components/ColorFilter";
import { PriceFilter } from "@/components/PriceFilter";
import { SizeFilter } from "@/components/SizeFilter";
import { useFilterStore } from "@/lib/store/useFilterStore";
import { useCartStore } from "@/lib/store/useCartStore";
import { MOCK_PRODUCTS, PRODUCT_CATEGORIES } from "@/lib/data/constants";
import { Filter, X } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { Suspense } from "react";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const addItem = useCartStore((state) => state.addItem);
  const [filteredProducts, setFilteredProducts] = useState(MOCK_PRODUCTS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [displayProducts, setDisplayProducts] = useState(MOCK_PRODUCTS);

  const {
    selectedCategory,
    selectedColors,
    selectedSizes,
    priceRange,
    sortBy,
    searchQuery,
    setCategory,
  } = useFilterStore();

  // Set category from URL on load
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setCategory(categoryParam);
    }
  }, [searchParams, setCategory]);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...MOCK_PRODUCTS];

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Color filter
    if (selectedColors.length > 0) {
      filtered = filtered.filter((p) =>
        p.colors.some((c) => selectedColors.includes(c))
      );
    }

    // Size filter
    if (selectedSizes.length > 0) {
      filtered = filtered.filter((p) =>
        p.sizes.some((s) => selectedSizes.includes(s))
      );
    }

    // Price range filter
    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
      default:
        // Keep original order
        break;
    }

    setFilteredProducts(filtered);
    setDisplayProducts(filtered);
  }, [selectedCategory, selectedColors, selectedSizes, priceRange, sortBy, searchQuery]);

  const handleAddToCart = (productId: string) => {
    const product = MOCK_PRODUCTS.find((p) => p.id === productId);
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
    <Suspense fallback={<div className="text-center py-12">Loading products...</div>}>
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="page-title">Our Collection</h1>
            <p className="page-subtitle mt-2">
              {filteredProducts.length} products found
            </p>
          </div>

          {/* Sort Dropdown - Desktop */}
          <div className="hidden sm:block mt-4 sm:mt-0">
            <label className="text-gray-700 dark:text-gray-300 mr-2">
              Sort by:
            </label>
            <select className="input-field w-full sm:w-48">
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Mobile Filter Button */}
        <div className="md:hidden mb-6">
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="w-full flex items-center justify-center gap-2 bg-mountain-600 hover:bg-mountain-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            <Filter className="w-5 h-5" />
            {mobileFiltersOpen ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside
            className={`${
              mobileFiltersOpen ? "block" : "hidden"
            } md:block w-full md:w-64 flex-shrink-0`}
          >
            <div className="space-y-6">
              <CategoryFilter />
              <PriceFilter />
              <ColorFilter />
              <SizeFilter />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    {...product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                  <X className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your filters or search criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </Suspense>
  );
}
