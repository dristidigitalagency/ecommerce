"use client";

import { useFilterStore } from "@/lib/store/useFilterStore";
import { PRODUCT_CATEGORIES } from "@/lib/data/constants";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export const CategoryFilter: React.FC = () => {
  const { selectedCategory, setCategory } = useFilterStore();
  const [dynamicCategories, setDynamicCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const snap = await getDocs(collection(db, "products"));
        const cats = new Set<string>();
        snap.docs.forEach(d => {
          const cat = d.data().category;
          if (cat) cats.add(cat);
        });
        // Build merged list: static categories first, then any custom ones from Firestore
        const staticIds = PRODUCT_CATEGORIES.map(c => c.id);
        const extra = Array.from(cats)
          .filter(c => !staticIds.includes(c))
          .map(c => ({ id: c, name: c }));
        setDynamicCategories(extra);
      } catch {}
    }
    loadCategories();
  }, []);

  const allCategories = [
    ...PRODUCT_CATEGORIES,
    ...dynamicCategories,
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4">Category</h3>
      <div className="space-y-2">
        {allCategories.map((category) => (
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
