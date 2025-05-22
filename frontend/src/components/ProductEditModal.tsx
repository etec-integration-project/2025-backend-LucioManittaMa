import { useState } from 'react';
import { API_URL } from '../config/api';
import { toast } from 'react-hot-toast';

interface ProductEditModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
  onProductUpdated: (updated: any) => void;
}

export default function ProductEditModal({ product, isOpen, onClose, onProductUpdated }: ProductEditModalProps) {
  const [formData, setFormData] = useState({
    nombre: product.nombre || '',
    descripción: product.descripción || '',
    precio: product.precio || '',
    imagen: product.imagen || '',
    imagenFile: null as File | null,
    category_id: product.category_id || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [uploadType, setUploadType] = useState<'file' | 'url'>(product.imagen && product.imagen.startsWith('http') ? 'url' : 'file');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === 'imagenUrl') {
      setFormData(prev => ({ ...prev, imagen: value, imagenFile: null }));
      setUploadType('url');
    } else if (files && files[0]) {
      const file = files[0];
      setFormData(prev => ({ ...prev, imagen: '', imagenFile: file }));
      setUploadType('file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const form = new FormData();
      form.append('nombre', formData.nombre);
      form.append('descripción', formData.descripción);
      form.append('precio', formData.precio);
      form.append('category_id', formData.category_id);
      if (uploadType === 'file' && formData.imagenFile) {
        form.append('imagen', formData.imagenFile);
      } else if (uploadType === 'url' && formData.imagen) {
        form.append('imagen', formData.imagen.trim());
      }

      const resp = await fetch(`${API_URL}/products/${product.product_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: form
      });
      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.message || errorData.error || 'Error al actualizar el producto');
      }
      const updated = await resp.json();
      toast.success('Producto actualizado correctamente');
      onProductUpdated(updated);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar el producto');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Editar Producto</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Nombre</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Descripción</label>
            <textarea name="descripción" value={formData.descripción} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Precio</label>
            <input type="number" name="precio" value={formData.precio} onChange={handleChange} className="w-full border px-3 py-2 rounded" required min="0" step="0.01" />
          </div>
          <div>
            <label className="block text-sm font-medium">Categoría</label>
            <input type="text" name="category_id" value={formData.category_id} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium">Imagen</label>
            <div className="flex gap-2 mb-2">
              <button type="button" className={`px-2 py-1 rounded ${uploadType === 'file' ? 'bg-green-600 text-white' : 'bg-gray-200'}`} onClick={() => setUploadType('file')}>Archivo</button>
              <button type="button" className={`px-2 py-1 rounded ${uploadType === 'url' ? 'bg-green-600 text-white' : 'bg-gray-200'}`} onClick={() => setUploadType('url')}>URL</button>
            </div>
            {uploadType === 'file' ? (
              <input type="file" accept="image/*" name="imagenFile" onChange={handleImageChange} />
            ) : (
              <input type="text" name="imagenUrl" value={formData.imagen} onChange={handleImageChange} placeholder="URL de la imagen" className="w-full border px-3 py-2 rounded" />
            )}
            {product.imagen && (
              <div className="mt-2">
                <span className="text-xs text-gray-500">Imagen actual:</span>
                <img src={product.imagen.startsWith('/uploads') ? `${API_URL}${product.imagen}` : product.imagen} alt="Imagen actual" className="h-16 mt-1 rounded" />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancelar</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">{isLoading ? 'Guardando...' : 'Guardar Cambios'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
