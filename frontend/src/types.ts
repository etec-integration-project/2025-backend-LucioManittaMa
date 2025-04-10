export interface Product {
  product_id: number;
  name: string;
  price: number;
  image: string;
  brand: string;
  sizes: number[];
  color: string;
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: number;
}