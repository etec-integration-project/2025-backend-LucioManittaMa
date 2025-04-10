import { useFavorites } from '../store/useFavorites';
import ProductCard from '../components/ProductCard';

export default function Favorites() {
  const { items } = useFavorites();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">  Favoritos</h2>
      
      {items.length === 0 ? (
        <p className="text-gray-600">Aún no has agregado ningún artículo a tus favoritos.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}