"use client";

import { useFilterStore } from "@/lib/store/useFilterStore";
import { formatPrice } from "@/lib/utils";

export const PriceFilter: React.FC = () => {
  const { priceRange, setPriceRange } = useFilterStore();

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4">Price Range</h3>
      
      <div className="space-y-4">
        {/* Price inputs */}
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            max="300"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Min"
          />
          <span className="flex items-center text-gray-600 dark:text-gray-400">-</span>
          <input
            type="number"
            min="0"
            max="300"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Max"
          />
        </div>

        {/* Range slider */}
        <input
          type="range"
          min="0"
          max="300"
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
          className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
        />

        {/* Display current range */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
        </div>
      </div>
    </div>
  );
};
