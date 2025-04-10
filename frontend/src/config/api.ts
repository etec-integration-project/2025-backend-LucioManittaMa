export const API_URL = process.env.NODE_ENV === 'production'
  ? 'http://backend_service:3000/api' // Para producción (Docker)
  : 'http://localhost:3000/api'; // Para desarrollo local

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('No se encontró token en localStorage');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
    'Accept': 'application/json'
  };
};

// Función helper para hacer peticiones autenticadas
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {})
    }
  });

  if (response.status === 401) {
    // Token expirado o inválido
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Sesión expirada');
  }

  return response;
};