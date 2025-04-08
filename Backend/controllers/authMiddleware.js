import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/dotenv.js';

/**
 * Middleware para verificar el token JWT.
 * @param {Request} req - Solicitud HTTP.
 * @param {Response} res - Respuesta HTTP.
 * @param {Function} next - Siguiente middleware.
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
        console.error('Error en authMiddleware:', error);
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado',
            error: error.message
        });
    }
};
