export const API_URL = 'http://localhost:3000/api';

// Verificar si la sesión ha expirado o no es válida
export const handleSessionExpiration = (status: number): boolean => {
  if (status === 401 || status === 403) {
    // Almacenar la URL actual antes de redirigir al login
    const currentPath = window.location.pathname;
    if (currentPath !== '/login' && currentPath !== '/register') {
      sessionStorage.setItem('redirectAfterLogin', currentPath);
    }
    
    // Opcionalmente, mostrar un mensaje al usuario
    console.warn('Sesión expirada o no autorizada');
    
    // No redirigir automáticamente, permitir que el contexto de autenticación lo maneje
    return true;
  }
  return false;
};

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

// Función helper para hacer peticiones autenticadas con manejo mejorado de sesiones
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const headers = getAuthHeaders();
  const url = `${API_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {})
      }
    });

    // Verificar si hay problemas de autenticación
    if (handleSessionExpiration(response.status)) {
      // Opcional: intentar refrescar el token si existe una función para ello
      // Por ahora solo arrojamos un error
      throw new Error('Sesión expirada');
    }

    return response;
  } catch (error) {
    console.error(`Error en la petición a ${url}:`, error);
    throw error;
  }
};