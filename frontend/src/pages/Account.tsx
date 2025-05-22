import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';
import { toast } from 'react-hot-toast';
import { Order, OrderDetail } from '../types';

export default function Account() {
  const navigate = useNavigate();
  const { user, refreshUserSession, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      refreshUserSession();
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar los pedidos');
      }

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error al cargar los pedidos:', error);
      toast.error('No se pudieron cargar tus pedidos');
    }
  };

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  const getOrderStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'procesando':
        return 'bg-blue-100 text-blue-800';
      case 'enviado':
        return 'bg-green-100 text-green-800';
      case 'entregado':
        return 'bg-green-500 text-white';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return 'https://via.placeholder.com/50?text=No+Image';
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    if (imageUrl.startsWith('/uploads')) {
      return `${API_URL}${imageUrl}`;
    }
    
    return 'https://via.placeholder.com/50?text=Error';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">Mi Cuenta</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Información del Perfil</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Nombre:</span> {user.nombre}
              </p>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Rol:</span> {user.rol}
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Configuración de la Cuenta</h3>
            <button
              className="text-green-600 hover:text-green-700"
              onClick={() => navigate('/change-password')}
            >
              Cambiar Contraseña
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Mis Pedidos</h2>
        
        {orders.length === 0 ? (
          <p className="text-gray-600">Aún no has realizado ningún pedido.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pedido #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map(order => (
                  <tr key={order.order_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{order.order_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(order.fecha)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${Number(order.total).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getOrderStatusClass(order.estado)}`}>
                        {order.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => openOrderModal(order)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para ver detalles de la orden */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Pedido #{selectedOrder.order_id}</h3>
              <button
                onClick={closeOrderModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Información del Pedido</h4>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Fecha:</span> {formatDate(selectedOrder.fecha)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Estado:</span>{' '}
                  <span className={`px-2 py-1 text-xs rounded-full ${getOrderStatusClass(selectedOrder.estado)}`}>
                    {selectedOrder.estado}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Total:</span> ${Number(selectedOrder.total).toFixed(2)}
                </p>
              </div>
            </div>

            <h4 className="font-medium text-gray-900 mb-3">Productos</h4>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Talla
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedOrder.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-md object-cover"
                              src={getImageUrl(item.product.imagen)}
                              alt={item.product.nombre}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {item.product.nombre}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.talla}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${Number(item.precio).toFixed(2)}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.cantidad}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${(Number(item.precio) * Number(item.cantidad)).toFixed(2)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}