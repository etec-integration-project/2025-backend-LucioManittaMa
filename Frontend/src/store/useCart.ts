import { create } from 'zustand';
import { CartItem } from '../types';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number, size: number) => void;
  updateQuantity: (id: number, size: number, quantity: number) => void;
  clearCart: () => void;
}

export const useCart = create<CartStore>((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => {
      const existingItem = state.items.find(
        (i) => i.id === item.id && i.selectedSize === item.selectedSize
      );
      if (existingItem) {
        return {
          items: state.items.map((i) =>
            i.id === item.id && i.selectedSize === item.selectedSize
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        };
      }
      return { items: [...state.items, item] };
    }),
  removeItem: (id, size) =>
    set((state) => ({
      items: state.items.filter(
        (i) => !(i.id === id && i.selectedSize === size)
      ),
    })),
  updateQuantity: (id, size, quantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id && item.selectedSize === size
          ? { ...item, quantity }
          : item
      ),
    })),
  clearCart: () => set({ items: [] }),
}));