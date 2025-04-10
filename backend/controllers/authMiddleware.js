import jwt from 'jsonwebtoken';

// Configuración embebida
const JWT_SECRET = 'tu_clave_secreta_aqui';

/**
 * Middleware para verificar el token JWT.
 */
export const authMiddleware = (req, res, next) => {
    // Permitir GET requests a /products sin autenticación
    if (req.method === 'GET' && (req.path === '/products' || req.originalUrl === '/api/products')) {
        return next();
    }

    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ 
                success: false, 
                message: 'No se proporcionó token de autorización' 
            });
        }

        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.slice(7) 
            : authHeader;

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado',
            error: error.message
        });
    }
};
