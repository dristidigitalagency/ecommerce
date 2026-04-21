import { create } from 'zustand';

export interface FilterState {
  selectedCategory: string;
  selectedColors: string[];
  selectedSizes: string[];
  priceRange: [number, number];
  sortBy: 'price-asc' | 'price-desc' | 'rating' | 'newest';
  searchQuery: string;
}

interface FilterStore extends FilterState {
  setCategory: (category: string) => void;
  toggleColor: (color: string) => void;
  toggleSize: (size: string) => void;
  setPriceRange: (range: [number, number]) => void;
  setSortBy: (sort: FilterState['sortBy']) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

const initialState: FilterState = {
  selectedCategory: 'all',
  selectedColors: [],
  selectedSizes: [],
  priceRange: [0, 300],
  sortBy: 'newest',
  searchQuery: '',
};

export const useFilterStore = create<FilterStore>((set) => ({
  ...initialState,
  setCategory: (category) => set({ selectedCategory: category }),
  toggleColor: (color) => set((state) => ({
    selectedColors: state.selectedColors.includes(color)
      ? state.selectedColors.filter((c) => c !== color)
      : [...state.selectedColors, color],
  })),
  toggleSize: (size) => set((state) => ({
    selectedSizes: state.selectedSizes.includes(size)
      ? state.selectedSizes.filter((s) => s !== size)
      : [...state.selectedSizes, size],
  })),
  setPriceRange: (range) => set({ priceRange: range }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  resetFilters: () => set(initialState),
}));
