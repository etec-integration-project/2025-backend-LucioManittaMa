import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types';

interface FavoritesStore {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  isFavorite: (productId: number) => boolean;
}

export const useFavorites = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) =>
        set((state) => ({
          items: [...state.items, product],
        })),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.product_id !== productId),
        })),
      isFavorite: (productId) =>
        get().items.some((item) => item.product_id === productId),
    }),
    {
      name: 'favorites-storage',
    }
  )
);