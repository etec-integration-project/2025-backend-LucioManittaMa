/**
 * Middleware para habilitar CORS.
 * Configura los encabezados CORS para permitir solicitudes desde cualquier origen.
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
export function corsMiddleware(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:81'); // Permitir el origen del frontend
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Manejar solicitudes preflight (OPTIONS)
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204); // Responder con No Content
    }

    next();
}
