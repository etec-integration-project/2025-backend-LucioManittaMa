import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../config/api';
import { toast } from 'react-hot-toast';
import { useCart } from '../store/useCart';

export default function Checkout() {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    direccionEnvio: '',
    metodoPago: '',
    // ... otros campos necesarios
  });

  useEffect(() => {
    const savedCheckout = sessionStorage.getItem('checkoutItems');
    if (!savedCheckout) {
      navigate('/cart');
      return;
    }
    setCheckoutData(JSON.parse(savedCheckout));
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const orderData = {
        items: checkoutData.items.map((item: any) => ({
          product_id: item.id,
          cantidad: item.quantity,
          precio: item.price
        })),
        estado: 'pendiente',
        fecha: new Date().toISOString(),
        total: checkoutData.total,
        direccionEnvio: formData.direccionEnvio,
        metodoPago: formData.metodoPago
      };

      const response = await fetchWithAuth('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        toast.success('Orden creada exitosamente');
        sessionStorage.removeItem('checkoutItems');
        clearCart();
        navigate('/order-success'); // O a donde prefieras
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Error al procesar la orden');
      }
    } catch (error) {
      console.error('Error en checkout:', error);
      toast.error('Error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  if (!checkoutData) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-bold mb-8">Checkout</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">Detalles de envío</h3>
          <form onSubmit={handleSubmit}>
            {/* Campos del formulario */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dirección de envío
                </label>
                <input
                  type="text"
                  name="direccionEnvio"
                  value={formData.direccionEnvio}
                  onChange={(e) => setFormData({...formData, direccionEnvio: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Método de pago
                </label>
                <select
                  name="metodoPago"
                  value={formData.metodoPago}
                  onChange={(e) => setFormData({...formData, metodoPago: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                >
                  <option value="">Seleccione un método</option>
                  <option value="tarjeta">Tarjeta de crédito</option>
                  <option value="transferencia">Transferencia bancaria</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition-colors"
              >
                {isLoading ? 'Procesando...' : 'Confirmar pedido'}
              </button>
            </div>
          </form>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Resumen del pedido</h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            {/* Mostrar items y total */}
            {checkoutData.items.map((item: any) => (
              <div key={item.id} className="flex justify-between mb-2">
                <span>{item.name} x {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${checkoutData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}