import { Trash2 } from 'lucide-react';
import { useCart } from '../store/useCart';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../config/api';
import { toast } from 'react-hot-toast';

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity } = useCart();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {items.map((item) => (
            <div key={`${item.id}-${item.selectedSize}`} className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-md mb-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-md"
              />
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <p className="text-gray-600">Size: {item.selectedSize}</p>
                <p className="text-green-600 font-bold">${item.price}</p>
                
                <div className="flex items-center gap-4 mt-2">
                  <select
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, item.selectedSize, Number(e.target.value))}
                    className="border rounded-md px-2 py-1"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    onClick={() => removeItem(item.id, item.selectedSize)}
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
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Envío</span>
              <span>Gratis</span>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
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