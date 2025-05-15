import { create } from 'zustand';
import { CartItem } from '../types';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, newQuantity: number) => void;
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
  removeItem: (itemId) =>
    set((state) => ({
      items: state.items.filter(
        (i) => i.id !== itemId
      ),
    })),
  updateQuantity: (itemId, newQuantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ),
    })),
  clearCart: () => set({ items: [] }),
}));