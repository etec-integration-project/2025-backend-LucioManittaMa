import { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../store/useCart';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useFavorites } from '../store/useFavorites';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

interface ProductCardProps {
  product: Product;
}

const AVAILABLE_SIZES = [36, 37, 38, 39, 40, 41, 42, 43, 44];

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const addToCart = useCart((state) => state.addItem);
  const token = localStorage.getItem('token');
  const { addItem, removeItem, isFavorite } = useFavorites();
  const isProductFavorite = isFavorite(product.product_id);

  const handleAction = () => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (!selectedSize) {
      toast.error('Por favor selecciona un talle');
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
  };

  const handleFavoriteClick = () => {
    if (isProductFavorite) {
      removeItem(product.product_id);
    } else {
      addItem(product);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <img
          src={product.imagen || 'https://via.placeholder.com/400?text=No+Image'}
          alt={product.nombre}
          className="w-full h-64 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/400?text=Error+Loading+Image';
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
        <p className="text-gray-600 mt-1">Stock disponible: {product.stock}</p>
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
                    className={`px-3 py-1 rounded-md text-sm ${
                      selectedSize === size
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleAction}
              className="w-full mt-4 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Agregar al Carrito
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