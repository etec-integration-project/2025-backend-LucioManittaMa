export interface Product {
  product_id: number;
  nombre: string;
  descripción: string | null;
  precio: number;
  stock: number;
  imagen: string | null;
  category_id: number;
  sizes?: number[];
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedSize: number;
} 