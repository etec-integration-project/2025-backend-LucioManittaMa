/**
 * Middleware para registrar las solicitudes.
 * Muestra el método HTTP y la URL solicitada en la 
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
export function requestLogger(req, res, next) {
    next();
}
