"use client";

import { useFilterStore } from "@/lib/store/useFilterStore";
import { SIZES } from "@/lib/data/constants";

export const SizeFilter: React.FC = () => {
  const { selectedSizes, toggleSize } = useFilterStore();

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4">Sizes</h3>
      <div className="grid grid-cols-3 gap-2">
        {SIZES.map((size) => (
          <button
            key={size.id}
            onClick={() => toggleSize(size.id)}
            className={`py-2 px-3 rounded border transition-all font-semibold ${
              selectedSizes.includes(size.id)
                ? "bg-mountain-600 dark:bg-mountain-500 text-white border-mountain-600 dark:border-mountain-500"
                : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:border-mountain-600"
            }`}
          >
            {size.label}
          </button>
        ))}
      </div>
    </div>
  );
};
