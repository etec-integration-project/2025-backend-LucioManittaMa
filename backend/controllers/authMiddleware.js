import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    try {
        console.log('=== Debug Auth ===');
        console.log('Path:', req.path);
        console.log('Method:', req.method);
        console.log('Headers:', req.headers);

        // Permitir GET requests a /products sin autenticación
        if (req.method === 'GET' && (req.path === '/products' || req.originalUrl === '/api/products')) {
            return next();
        }

        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log('❌ No authorization header found');
            return res.status(401).json({ message: 'No autenticado' });
        }

        if (!authHeader.startsWith('Bearer ')) {
            console.log('❌ Invalid token format');
            return res.status(401).json({ message: 'Formato de token inválido' });
        }

        const token = authHeader.split(' ')[1];
        console.log('🔑 Token recibido:', token);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token decodificado:', decoded);

        // Verificar que el token tenga la información necesaria
        if (!decoded.userId || !decoded.rol) {
            console.log('❌ Token no contiene userId o rol');
            return res.status(401).json({ 
                message: 'Token inválido: falta información necesaria',
                decoded
            });
        }

        // Verificar rol para rutas que requieren admin
        if (req.path.includes('/products') && req.method !== 'GET') {
            if (decoded.rol !== 'admin') {
                console.log('❌ Usuario no es admin:', decoded.rol);
                return res.status(403).json({ message: 'Se requiere rol de administrador' });
            }
        }

        req.user = decoded;
        console.log('✅ Usuario autenticado:', {
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
