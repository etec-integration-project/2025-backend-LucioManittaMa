import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    try {
        ('=== Debug Auth ===');
        ('Path:', req.path);
        ('Method:', req.method);
        ('Headers:', req.headers);

        // Permitir GET requests a /products sin autenticación
        if (req.method === 'GET' && (req.path === '/products' || req.originalUrl === '/api/products')) {
            return next();
        }

        const authHeader = req.headers.authorization;
        if (!authHeader) {
            ('❌ No authorization header found');
            return res.status(401).json({ message: 'No autenticado' });
        }

        if (!authHeader.startsWith('Bearer ')) {
            ('❌ Invalid token format');
            return res.status(401).json({ message: 'Formato de token inválido' });
        }

        const token = authHeader.split(' ')[1];
        ('🔑 Token recibido:', token);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        ('✅ Token decodificado:', decoded);

        // Verificar que el token tenga la información necesaria
        if (!decoded.userId || !decoded.rol) {
            ('❌ Token no contiene userId o rol');
            return res.status(401).json({ 
                message: 'Token inválido: falta información necesaria',
                decoded
            });
        }

        // Verificar rol para rutas que requieren admin
        if (req.path.includes('/products') && req.method !== 'GET') {
            if (decoded.rol !== 'admin') {
                ('❌ Usuario no es admin:', decoded.rol);
                return res.status(403).json({ message: 'Se requiere rol de administrador' });
            }
        }

        req.user = decoded;
        ('✅ Usuario autenticado:', {
            userId: decoded.userId,
            rol: decoded.rol,
            path: req.path
        });
        
        next();
    } catch (error) {
        console.error('🚫 Error de autenticación:', error);
        res.status(401).json({ 
            message: 'Token inválido',
            error: error.message
        });
    }
};

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Formato de token inválido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId || !decoded.rol) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  next();
};
