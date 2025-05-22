export interface Product {
  product_id: number;
  nombre: string;
  precio: number;
  imagen: string;
  descripción: string;
  stock: number | Record<number, number>;
  category_id: number;
}

export interface OrderDetail {
  product_id: number;
  cantidad: number;
  precio: number;
  talla: number;
  product: Product;
}

export interface Order {
  order_id: number;
  user_id: number;
  fecha: string;
  estado: string;
  total: number;
  direccion_envio?: string;
  metodo_pago?: string;
  items: OrderDetail[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: number;
}