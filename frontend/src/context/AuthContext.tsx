import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_URL } from '../config/api';
import axios from 'axios';

interface User {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  dirección?: string;
  teléfono?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ token: any; user: any }>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUserSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Crear un interceptor para añadir el token a todas las peticiones
const setupAxiosInterceptors = () => {
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Interceptor para manejar errores de autenticación (401)
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // Si recibimos un 401 y no es un intento de refresh, intentamos refrescar el token
      if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== `${API_URL}/auth/me`) {
        originalRequest._retry = true;
        
        try {
          // Intentamos refrescar la sesión
          const token = localStorage.getItem('token');
          if (token) {
            const response = await axios.get(`${API_URL}/auth/me`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            if (response.status === 200) {
              return axios(originalRequest);
            }
          }
          // Si falla, redirigimos al login
          window.location.href = '/login';
          return Promise.reject(error);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Error al parsear usuario:', error);
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return !!localStorage.getItem('token');
    } catch (error) {
      console.error('Error al verificar token:', error);
      return false;
    }
  });

  // Configurar interceptores de Axios
  useEffect(() => {
    setupAxiosInterceptors();
  }, []);

  const refreshUserSession = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        const userData = response.data;
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        // Si el token ya no es válido, limpiamos el almacenamiento
        handleLogout();
      }
    } catch (error) {
      console.error('Error al refrescar la sesión:', error);
      handleLogout();
    }
  };

  // Función auxiliar para manejar el logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Verificar token y actualizar perfil al cargar la página
  useEffect(() => {
    const verifyToken = async () => {
      try {
        await refreshUserSession();
      } catch (error) {
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();

    // Configurar un intervalo para verificar el token periódicamente (cada 5 minutos)
    const intervalId = setInterval(() => {
      refreshUserSession();
    }, 5 * 60 * 1000);

    // Configurar eventos para detectar cuando el usuario vuelve a la página
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshUserSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Limpiar al desmontar
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const login = async (email: string, contraseña: string) => {
    try {
      console.log('Iniciando login...');
      const response = await axios.post(`${API_URL}/auth/login`, 
        { email, contraseña },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      const data = response.data;
      console.log('Respuesta completa del servidor:', data);

      if (!data.token) {
        throw new Error('El servidor no devolvió un token');
      }

      if (!data.user || !data.user.id || !data.user.nombre || !data.user.email || !data.user.rol) {
        console.error('Datos de usuario incompletos:', data.user);
        throw new Error('Los datos del usuario están incompletos');
      }

      // Guardamos el token y los datos del usuario
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Actualizamos el estado
      setUser(data.user);
      setIsAuthenticated(true);
      
      console.log('Login completado exitosamente');
      return { token: data.token, user: data.user };
    } catch (error) {
      console.error('Error en proceso de login:', error);
      throw error;
    }
  };

  const logout = () => {
    handleLogout();
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isLoading,
      isAuthenticated,
      refreshUserSession
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
} 