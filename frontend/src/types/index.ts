export interface Product {
  product_id: number;
  nombre: string;
  descripción: string;
  precio: number;
  stock: Record<string, number>;
  category_id: number;
  imagen: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  selectedSize?: number;
  image?: string;
}

export interface OrderDetail {
  product_id: number;
  cantidad: number;
  precio: number;
  talla: number;
  product: {
    nombre: string;
    imagen: string;
  };
}

export interface Order {
  order_id: number;
  user_id: number;
  fecha: string;
  estado: string;
  total: number;
  direccionEnvio: string;
  metodoPago: string;
  items: OrderDetail[];
} 