import { useState } from 'react';
import { API_URL } from '../config/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al cambiar la contraseña');
      }
      toast.success('Contraseña cambiada correctamente');
      navigate('/account');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 shadow rounded">
      <h2 className="text-2xl font-bold mb-6">Cambiar Contraseña</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Contraseña actual</label>
          <div className="relative">
  <input
    type={showCurrent ? "text" : "password"}
    className="w-full border px-3 py-2 rounded"
    value={currentPassword}
    onChange={e => setCurrentPassword(e.target.value)}
    required
  />
  <button
    type="button"
    tabIndex={-1}
    className="absolute right-2 top-2 text-gray-500"
    onClick={() => setShowCurrent((v) => !v)}
    aria-label={showCurrent ? "Ocultar contraseña" : "Mostrar contraseña"}
  >
    {showCurrent ? "🙈" : "👁️"}
  </button>
</div>
        </div>
        <div>
          <label className="block mb-1 font-medium">Nueva contraseña</label>
          <div className="relative">
  <input
    type={showNew ? "text" : "password"}
    className="w-full border px-3 py-2 rounded"
    value={newPassword}
    onChange={e => setNewPassword(e.target.value)}
    required
  />
  <button
    type="button"
    tabIndex={-1}
    className="absolute right-2 top-2 text-gray-500"
    onClick={() => setShowNew((v) => !v)}
    aria-label={showNew ? "Ocultar contraseña" : "Mostrar contraseña"}
  >
    {showNew ? "🙈" : "👁️"}
  </button>
</div>
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          disabled={loading}
        >
          {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
        </button>
      </form>
    </div>
  );
}
