import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Account() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Mi Cuenta</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Información del Perfil</h3>
            <p className="text-gray-600">Email: {user.email}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Configuración de la Cuenta</h3>
            <button className="text-green-600 hover:text-green-700">
              Cambiar Contraseña
            </button>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Historial de Pedidos</h3>
            <p className="text-gray-600">Aún no has realizado ningún pedido.</p>
          </div>
        </div>
      </div>
    </div>
  );
}