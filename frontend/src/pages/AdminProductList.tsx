import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';
import { Product } from '../types';

interface StockUpdate {
  productId: number | null;
  size: number | null;
  stock: number;
}

export default function AdminProductList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingStock, setEditingStock] = useState<{
    productId: number | null;
    size: number | null;
    stock: number;
  }>({
    productId: null,
    size: null,
    stock: 0
  });
  const [showStockModal, setShowStockModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('No se pudieron cargar los productos');
      }
      
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      toast.error('Error al cargar los productos');
    } finally {
      setIsLoading(false);
    }
  };

  const openStockModal = (productId: number, size: number, currentStock: number) => {
    setEditingStock({
      productId,
      size,
      stock: currentStock
    });
    setShowStockModal(true);
  };

  const closeStockModal = () => {
    setShowStockModal(false);
    setEditingStock({
      productId: null,
      size: null,
      stock: 0
    });
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setEditingStock(prev => ({
      ...prev,
      stock: Math.max(0, value) // Asegurar que no sea negativo
    }));
  };

  const updateStock = async () => {
    if (!editingStock.productId || editingStock.size === null) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/products/${editingStock.productId}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          size: editingStock.size,
          quantity: editingStock.stock
        })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el stock');
      }

      toast.success('Stock actualizado correctamente');
      closeStockModal();
      fetchProducts(); // Recargar productos para mostrar la actualización
    } catch (error) {
      console.error('Error al actualizar stock:', error);
      toast.error('Error al actualizar el stock');
    }
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

  if (!user || user.rol !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
      </div>
    );
  }

  return (
    <div className="py-8 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Administrar Productos</h1>
        <button 
          onClick={() => navigate('/admin/productos')}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Agregar Nuevo Producto
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Imagen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock por Talla
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map(product => (
                <tr key={product.product_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img 
                      src={getImageUrl(product.imagen)} 
                      alt={product.nombre}
                      className="h-12 w-12 object-cover rounded-md"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.nombre}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${Number(product.precio).toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(product.stock).map(([size, qty]) => (
                        <button
                          key={size}
                          onClick={() => openStockModal(product.product_id, parseInt(size), qty)}
                          className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-between"
                        >
                          <span className="font-medium">{size}</span>
                          <span className="ml-1">({qty})</span>
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {/* Implementar edición de producto */}}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para actualizar stock */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Actualizar Stock</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Producto: {products.find(p => p.product_id === editingStock.productId)?.nombre}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Talla: {editingStock.size}
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad en Stock
              </label>
              <input
                type="number"
                min="0"
                value={editingStock.stock}
                onChange={handleStockChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeStockModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={updateStock}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 