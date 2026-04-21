"use client";

import { useFilterStore } from "@/lib/store/useFilterStore";
import { PRODUCT_CATEGORIES } from "@/lib/data/constants";

export const CategoryFilter: React.FC = () => {
  const { selectedCategory, setCategory } = useFilterStore();

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4">Category</h3>
      <div className="space-y-2">
        {PRODUCT_CATEGORIES.map((category) => (
          <label key={category.id} className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="category"
              value={category.id}
              checked={selectedCategory === category.id}
              onChange={() => setCategory(category.id)}
              className="w-4 h-4 text-mountain-600 dark:text-mountain-400"
            />
            <span className="text-gray-700 dark:text-gray-300">{category.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
