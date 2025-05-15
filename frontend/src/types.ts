export interface Product {
  product_id: number;
  nombre: string;
  precio: number;
  imagen: string;
  descripción: string;
  stock: number | Record<number, number>;
  category_id: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: number;
}