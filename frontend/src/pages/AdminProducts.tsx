import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';

interface Category {
  category_id: number;
  nombre: string;
  descripción: string;
}

export default function AdminProducts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    nombre: '',
    descripción: '',
    precio: '',
    stock: '',
    category_id: '',
    imagen: '', // Para URL
    imagenFile: null as File | null, // Para archivo
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/categories`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
        toast.error('Error al cargar las categorías');
      }
    };

    fetchCategories();
  }, []);

  if (!user || user.rol !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === 'imagenFile' && files) {
      setFormData({ ...formData, imagenFile: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const form = new FormData();

      form.append('nombre', formData.nombre);
      form.append('descripción', formData.descripción);
      form.append('precio', formData.precio);
      form.append('stock', formData.stock);
      form.append('category_id', formData.category_id);

      if (formData.imagenFile) {
        form.append('imagen', formData.imagenFile);
      } else if (formData.imagen) {
        form.append('imagen', formData.imagen); // URL como texto
      }

      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: form
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al conectar con el servidor');
      }

      toast.success('Producto agregado exitosamente');
      setFormData({
        nombre: '',
        descripción: '',
        precio: '',
        stock: '',
        category_id: '',
        imagen: '',
        imagenFile: null,
      });
    } catch (error: any) {
      console.error('Error al crear producto:', error);
      if (error.message === 'Unauthorized') {
        toast.error('Sesión expirada. Iniciá sesión nuevamente.');
        navigate('/login', { replace: true });
      } else {
        toast.error(error.message || 'Error al conectar con el servidor');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Agregar Nuevo Producto
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Inputs comunes */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                Nombre del Producto
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                value={formData.nombre}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="descripción" className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                id="descripción"
                name="descripción"
                required
                value={formData.descripción}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="precio" className="block text-sm font-medium text-gray-700">
                Precio
              </label>
              <input
                id="precio"
                name="precio"
                type="number"
                step="0.01"
                required
                value={formData.precio}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                Stock
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                required
                value={formData.stock}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                Categoría
              </label>
              <select
                id="category_id"
                name="category_id"
                required
                value={formData.category_id}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              >
                <option value="">Seleccionar categoría</option>
                {categories.map((category) => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Imagen desde archivo */}
            <div>
              <label htmlFor="imagenFile" className="block text-sm font-medium text-gray-700">
                Subir Imagen
              </label>
              <input
                id="imagenFile"
                name="imagenFile"
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="mt-1 block w-full"
              />
            </div>

            {/* Imagen desde URL */}
            <div>
              <label htmlFor="imagen" className="block text-sm font-medium text-gray-700">
                O URL de Imagen
              </label>
              <input
                id="imagen"
                name="imagen"
                type="url"
                value={formData.imagen}
                onChange={handleChange}
                className="mt-1 block w-full"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                {isLoading ? 'Agregando...' : 'Agregar Producto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
