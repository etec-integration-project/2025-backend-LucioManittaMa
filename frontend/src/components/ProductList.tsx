import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';
import ProductCard from './ProductCard';
import { Product } from '../types';

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('search')?.toLowerCase() || '';
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Intentando obtener productos...');
        const token = localStorage.getItem('token');
        console.log('Token disponible:', !!token);

        const response = await fetch(`${API_URL}/products`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('no_token');
          }
          throw new Error(`Error al cargar productos: ${response.status}`);
        }
        
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error al cargar productos:', error);
        if (error instanceof Error && error.message === 'no_token') {
          setError('token_required');
        } else {
          setError('Error al cargar los productos');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product => 
        product.nombre.toLowerCase().includes(searchTerm) ||
        product.descripción?.toLowerCase().includes(searchTerm)
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  if (loading) return (
    <div className="flex justify-center items-center py-10">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
    </div>
  );

  if (error) {
    if (error === 'token_required') {
      return (
        <div className="text-center py-10">
          <p className="text-gray-700 mb-4">Inicia sesión para ver los productos</p>
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      );
    }
    return (
      <div className="text-center py-10 text-red-600">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    if (searchTerm) {
      return (
        <div className="text-center py-10 text-gray-600">
          No se encontraron productos que coincidan con "{searchTerm}"
        </div>
      );
    }
    return (
      <div className="text-center py-10 text-gray-600">
        No hay productos disponibles.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProducts.map(product => (
        <ProductCard key={product.product_id} product={product} />
      ))}
    </div>
  );
} 