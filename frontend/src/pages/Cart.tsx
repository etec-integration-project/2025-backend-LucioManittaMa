import { Trash2 } from 'lucide-react';
import { useCart } from '../store/useCart';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';
import { CartItem } from '../types';

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity } = useCart();
  const total = items.reduce((sum: number, item: CartItem) => sum + Number(item.precio) * Number(item.quantity), 0);

  // Añadir la misma función getImageUrl que usamos en ProductCard
  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return 'https://via.placeholder.com/400?text=No+Image';
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    if (imageUrl.startsWith('/uploads')) {
      return `${API_URL}${imageUrl}`;
    }
    
    return 'https://via.placeholder.com/400?text=Invalid+Image';
  };

  const handleProceedToCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    sessionStorage.setItem('checkoutItems', JSON.stringify({
      items,
      total
    }));
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Carrito de Compras</h2>
        <p className="text-gray-600">Tu carrito está vacío</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Carrito de Compras</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.product_id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={getImageUrl(item.imagen)}
                    alt={item.nombre}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{item.nombre}</h3>
                    <p className="text-gray-500">Talla: {item.selectedSize}</p>
                    <p className="text-gray-500">${Number(item.precio).toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border rounded-md">
                    <button
                      onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                      className="px-3 py-1 text-gray-600 hover:text-gray-800"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="px-3 py-1 text-gray-600 hover:text-gray-800"
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md h-fit">
          <h3 className="text-xl font-semibold mb-4">Resumen del Pedido</h3>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${Number(total).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Envío</span>
              <span>Gratis</span>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${Number(total).toFixed(2)}</span>
            </div>
          </div>
          
          <button
            onClick={handleProceedToCheckout}
            className="w-full mt-6 bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition-colors inline-block text-center"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}