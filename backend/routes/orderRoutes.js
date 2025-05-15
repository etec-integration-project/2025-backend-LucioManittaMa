/**
 * @file orderRoutes.js
 * @description Rutas relacionadas con la gestión de órdenes.
 */

import express from 'express';
import { 
    createOrder, 
    getAllOrders, 
    getUserOrders, 
    updateOrderStatus,
    getOrderById
} from '../controllers/ordersController.js';
import { authMiddleware } from '../controllers/authMiddleware.js';

const router = express.Router();

/**
 * @route POST /api/orders
 * @description Crear una nueva orden.
 * @access Privado (requiere autenticación)
 */
router.post('/', authMiddleware, createOrder);

/**
 * @route GET /api/orders
 * @description Obtener todas las órdenes (solo admin).
 * @access Privado/Admin (requiere autenticación y rol de admin)
 */
router.get('/', authMiddleware, getAllOrders);

/**
 * @route GET /api/orders/me
 * @description Obtener las órdenes del usuario autenticado.
 * @access Privado (requiere autenticación)
 */
router.get('/me', authMiddleware, getUserOrders);

/**
 * @route GET /api/orders/:id
 * @description Obtener una orden por su ID.
 * @access Privado (requiere autenticación)
 */
router.get('/:id', authMiddleware, getOrderById);

/**
 * @route PATCH /api/orders/:id
 * @description Actualizar el estado de una orden (solo admin).
 * @access Privado/Admin (requiere autenticación y rol de admin)
 */
router.patch('/:id', authMiddleware, updateOrderStatus);

export default router;
