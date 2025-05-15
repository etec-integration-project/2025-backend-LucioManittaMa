import { useState, useEffect } from 'react';
import { Product } from '../types';
import { useCart } from '../store/useCart';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useFavorites } from '../store/useFavorites';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { API_URL } from '../config/api';

interface ProductCardProps {
  product: Product;
}

const AVAILABLE_SIZES = [36, 37, 38, 39, 40, 41, 42, 43, 44];

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [stockBySize, setStockBySize] = useState<Record<number, number>>({});
  const addToCart = useCart((state: any) => state.addItem);
  const token = localStorage.getItem('token');
  const { addItem, removeItem, isFavorite } = useFavorites();
  const isProductFavorite = isFavorite(product.product_id);

  useEffect(() => {
    // Inicializar el stock por talla
    if (typeof product.stock === 'object') {
      setStockBySize(product.stock as Record<number, number>);
    } else {
      // Si el stock es un número, distribuir equitativamente
      const totalStock = product.stock as number;
      const stockPerSize = Math.floor(totalStock / AVAILABLE_SIZES.length);
      const stockMap = AVAILABLE_SIZES.reduce((acc, size) => {
        acc[size] = stockPerSize;
        return acc;
      }, {} as Record<number, number>);
      setStockBySize(stockMap);
    }
  }, [product.stock]);

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

  const handleAction = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (!selectedSize) {
      toast.error('Por favor selecciona un talle');
      return;
    }

    // Verificar disponibilidad de stock
    try {
      // Verificación en el cliente antes de hacer la llamada al API
      if (stockBySize[selectedSize] <= 0) {
        toast.error('No hay stock disponible para esta talla');
        return;
      }

      addToCart({
        id: product.product_id,
        name: product.nombre,
        price: product.precio,
        image: product.imagen || 'https://via.placeholder.com/400',
        quantity: 1,
        selectedSize
      });

      toast.success('Producto agregado al carrito');
    } catch (error) {
      console.error('Error al verificar stock:', error);
      toast.error('Error al verificar la disponibilidad del producto');
    }
  };

  const handleFavoriteClick = () => {
    if (isProductFavorite) {
      removeItem(product.product_id);
    } else {
      addItem(product);
    }
  };

  // Calcular el stock total para mostrar
  const totalStock = Object.values(stockBySize).reduce((sum, current) => sum + current, 0);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <img
          src={getImageUrl(product.imagen)}
          alt={product.nombre}
          className="w-full h-64 object-cover"
          onError={(e: any) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/400?text=Error+Loading+Image';
            console.log('Error loading image:', product.imagen);
          }}
        />
        
        <button 
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 p-2"
        >
          {isProductFavorite ? (
            <FaHeart className="text-red-500" />
          ) : (
            <FaRegHeart className="text-gray-400 hover:text-red-500" />
          )}
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{product.nombre}</h3>
        <p className="text-gray-600 mt-1">Stock total: {totalStock}</p>
        <p className="text-sm text-gray-500 mt-1">{product.descripción}</p>
        <p className="text-green-600 font-bold mt-2">${Number(product.precio).toFixed(2)}</p>
        
        {token ? (
          <>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Talla
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    disabled={stockBySize[size] <= 0}
                    className={`px-3 py-1 rounded-md text-sm ${
                      selectedSize === size
                        ? 'bg-green-600 text-white'
                        : stockBySize[size] <= 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {size}
                    <span className="text-xs ml-1">
                      ({stockBySize[size] || 0})
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleAction}
              disabled={!selectedSize || (selectedSize && stockBySize[selectedSize] <= 0)}
              className={`w-full mt-4 py-2 rounded-md transition-colors ${
                !selectedSize || (selectedSize && stockBySize[selectedSize] <= 0)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {!selectedSize 
                ? 'Selecciona una talla'
                : stockBySize[selectedSize] <= 0
                ? 'Sin stock'
                : 'Agregar al Carrito'}
            </button>
          </>
        ) : (
          <button
            onClick={handleAction}
            className="w-full mt-4 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Comprar
          </button>
        )}
      </div>
    </div>
  );
}