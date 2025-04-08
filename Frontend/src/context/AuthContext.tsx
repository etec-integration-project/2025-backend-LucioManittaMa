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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  // Verificar token y actualizar perfil
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error verificando token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  useEffect(() => {
    console.log('Estado actual:', {
      user,
      isAuthenticated,
      isLoading
    });
  }, [user, isAuthenticated, isLoading]);

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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, isAuthenticated }}>
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