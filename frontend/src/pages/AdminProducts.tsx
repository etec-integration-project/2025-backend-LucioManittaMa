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

interface SizeStock {
  [key: number]: number;
}

export default function AdminProducts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadType, setUploadType] = useState<'file' | 'url'>('file');
  const [sizeStocks, setSizeStocks] = useState<SizeStock>({
    36: 0, 37: 0, 38: 0, 39: 0, 40: 0, 41: 0, 42: 0, 43: 0, 44: 0
  });
  const [formData, setFormData] = useState({
    nombre: '',
    descripción: '',
    precio: '',
    category_id: '',
    imagen: '',
    imagenFile: null as File | null,
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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSizeStockChange = (size: number, value: string) => {
    // Asegurarse de que el valor sea un número no negativo
    const stockValue = Math.max(0, parseInt(value) || 0);
    
    // Actualizar con el nuevo valor numérico
    setSizeStocks(prev => {
      const newStocks = { ...prev };
      newStocks[size] = stockValue;
      console.log(`Actualizado stock para talla ${size}: ${stockValue}`);
      return newStocks;
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    
    if (name === 'imageUrl') {
      setFormData(prev => ({
        ...prev,
        imagen: value,
        imagenFile: null
      }));
    } else if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          imagen: reader.result as string,
          imagenFile: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación de campos requeridos
    if (!formData.nombre || !formData.descripción || !formData.precio || !formData.category_id) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }
    
    // Validar que al menos una talla tenga stock
    const hasStock = Object.values(sizeStocks).some(stock => stock > 0);
    if (!hasStock) {
      toast.error('Debes ingresar stock para al menos una talla');
      return;
    }
    
    // Validar que se haya cargado una imagen
    if ((uploadType === 'file' && !formData.imagenFile) || (uploadType === 'url' && !formData.imagen)) {
      toast.error('Por favor selecciona una imagen');
      return;
    }
    
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }
      
      const form = new FormData();

      // Agregar los campos básicos
      form.append('nombre', formData.nombre.trim());
      form.append('descripción', formData.descripción.trim());
      form.append('precio', formData.precio);
      form.append('category_id', formData.category_id);
      
      // Convertir el stock por talla a un JSON string para enviarlo
      const stockJSON = JSON.stringify(sizeStocks);
      console.log('Stock a enviar (objeto):', sizeStocks);
      console.log('Stock a enviar (JSON string):', stockJSON);
      form.append('stock', stockJSON);

      // Manejar la imagen según el tipo de carga
      if (uploadType === 'file' && formData.imagenFile) {
        // Si es un archivo, agregarlo al FormData
        form.append('imagen', formData.imagenFile);
      } else if (uploadType === 'url' && formData.imagen) {
        // Si es una URL, agregarla como campo adicional
        form.append('imagen', formData.imagen.trim());
        // También la agregamos como 'imagenUrl' para que el backend la pueda detectar
        form.append('imagenUrl', formData.imagen.trim());
      }

      console.log('Enviando formulario al servidor...');
      console.log('Datos del formulario:', {
        nombre: formData.nombre,
        descripción: formData.descripción,
        precio: formData.precio,
        category_id: formData.category_id,
        stock: sizeStocks,
        uploadType,
        hasImage: uploadType === 'file' ? !!formData.imagenFile : !!formData.imagen
      });

      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: form
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Error del servidor:', responseData);
        throw new Error(responseData.message || `Error ${response.status}: ${response.statusText}`);
      }

      toast.success('Producto agregado exitosamente');
      
      // Resetear el formulario
      setFormData({
        nombre: '',
        descripción: '',
        precio: '',
        category_id: '',
        imagen: '',
        imagenFile: null,
      });
      
      // Reiniciar el stock por talla
      setSizeStocks({
        36: 0, 37: 0, 38: 0, 39: 0, 40: 0, 41: 0, 42: 0, 43: 0, 44: 0
      });
      
      // Cambiar a la pestaña de subir archivo por defecto
      setUploadType('file');
      
    } catch (error: any) {
      console.error('Error al crear producto:', error);
      if (error.message === 'Unauthorized') {
        toast.error('Sesión expirada. Iniciá sesión nuevamente.');
        navigate('/login', { replace: true });
      } else {
        const errorMessage = error.message || 'Error al conectar con el servidor';
        console.error('Detalles del error:', error);
        toast.error(`Error: ${errorMessage}`);
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock por Talla
              </label>
              <div className="grid grid-cols-3 gap-3">
                {Object.keys(sizeStocks).map(size => (
                  <div key={size} className="flex items-center space-x-2">
                    <label className="w-8 text-sm text-gray-600">{size}:</label>
                    <input
                      type="number"
                      min="0"
                      value={sizeStocks[parseInt(size)]}
                      onChange={(e) => handleSizeStockChange(parseInt(size), e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                ))}
              </div>
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

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Imagen del Producto
              </label>
              <div className="mt-2 space-y-2">
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setUploadType('file')}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      uploadType === 'file'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Subir archivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadType('url')}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      uploadType === 'url'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    URL de imagen
                  </button>
                </div>

                {uploadType === 'file' ? (
                  <input
                    id="imagen"
                    name="imagen"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-1 block w-full"
                  />
                ) : (
                  <input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={formData.imagen}
                    onChange={handleImageChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                )}

                {formData.imagen && (
                  <div className="mt-2">
                    <img
                      src={formData.imagen}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-md"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = 'https://via.placeholder.com/150?text=Error+de+imagen';
                      }}
                    />
                  </div>
                )}
              </div>
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
