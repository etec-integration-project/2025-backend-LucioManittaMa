/**
 * Middleware para habilitar CORS.
 * Configura los encabezados CORS para permitir solicitudes desde cualquier origen.
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
export function corsMiddleware(req, res, next) {
    const allowedOrigins = ['http://localhost:81', 'http://frontend_service']; // Agrega el origen del contenedor del frontend
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin); // Permitir el origen específico
        res.header('Access-Control-Allow-Credentials', 'true');
    } else {
        res.header('Access-Control-Allow-Origin', '*'); // Permitir todos los orígenes temporalmente
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range');

    // Manejar solicitudes preflight (OPTIONS)
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204); // Responder con No Content
    }

    next();
}
