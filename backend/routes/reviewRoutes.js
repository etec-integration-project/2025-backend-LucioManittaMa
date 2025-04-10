import express from 'express';
import {
    getReviews,
    createReview,
    updateReview,
    deleteReview
} from '../controllers/reviewController.js';
import { authMiddleware } from '../controllers/authMiddleware.js';

const router = express.Router();

/**
 * @route GET /api/reviews/:product_id
 * @description Obtener todas las reseñas de un producto.
 * @access Público
 */
router.get('/:product_id', getReviews);

/**
 * @route POST /api/reviews
 * @description Crear una nueva reseña.
 * @access Privado (Usuario autenticado)
 */
router.post('/', authMiddleware, createReview);

/**
 * @route PUT /api/reviews/:id
 * @description Actualizar una reseña existente.
 * @access Privado (Usuario autenticado)
 */
router.put('/:id', authMiddleware, updateReview);

/**
 * @route DELETE /api/reviews/:id
 * @description Eliminar una reseña existente.
 * @access Privado (Usuario autenticado o Admin)
 */
router.delete('/:id', authMiddleware, deleteReview);

export default router;
