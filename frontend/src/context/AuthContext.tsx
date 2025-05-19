import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_URL } from '../config/api';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
  setUser: (user: User | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
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

  const navigate = useNavigate();

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
        setIsLoading(false);
        return;
      }

      console.log('Refrescando sesión...');
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Respuesta del servidor:', response.data);

      if (response.status === 200) {
        const { user: userData, token: newToken } = response.data;
        
        // Actualizar el token si se recibió uno nuevo
        if (newToken) {
          localStorage.setItem('token', newToken);
        }
        
        // Actualizar el estado y el almacenamiento local
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log('Sesión actualizada:', userData);
      } else {
        console.log('Token inválido, cerrando sesión');
        handleLogout();
      }
    } catch (error) {
      console.error('Error al refrescar la sesión:', error);
      handleLogout();
    } finally {
      setIsLoading(false);
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
        const token = localStorage.getItem('token');
        
        if (token) {
          // Intentar refrescar la sesión inmediatamente
          await refreshUserSession();
        } else {
          handleLogout();
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error al verificar token:', error);
        handleLogout();
        setIsLoading(false);
      }
    };

    verifyToken();
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
      
      return data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const logout = () => {
    handleLogout();
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isLoading,
      isAuthenticated,
      refreshUserSession,
      setUser,
      setIsAuthenticated
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