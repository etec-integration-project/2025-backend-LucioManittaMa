/**
 * Middleware para manejar errores.
 * @param {Object} err - Objeto de error.
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
export function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    // Errores específicos de JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Token inválido'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expirado'
        });
    }

    // Error de validación de Sequelize
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors: err.errors.map(e => e.message)
        });
    }

    // Error por defecto
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor'
    });
}
