"use client";

import { useFilterStore } from "@/lib/store/useFilterStore";
import { COLORS } from "@/lib/data/constants";

export const ColorFilter: React.FC = () => {
  const { selectedColors, toggleColor } = useFilterStore();

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4">Colors</h3>
      <div className="grid grid-cols-4 gap-3">
        {COLORS.map((color) => (
          <button
            key={color.id}
            onClick={() => toggleColor(color.id)}
            className={`relative w-12 h-12 rounded-lg border-2 transition-all ${
              selectedColors.includes(color.id)
                ? "border-gray-900 dark:border-white ring-2 ring-mountain-600"
                : "border-gray-300 dark:border-gray-600"
            }`}
            style={{ backgroundColor: color.hex }}
            title={color.name}
          >
            {selectedColors.includes(color.id) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
