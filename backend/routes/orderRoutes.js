/**
 * @file orderRoutes.js
 * @description Rutas relacionadas con la gestión de órdenes.
 */

import express from 'express';
import { createOrder, getOrderById, getOrders, updateOrderStatus, deleteOrder } from '../controllers/ordersController.js';
import { authMiddleware } from '../controllers/authMiddleware.js';

const router = express.Router();

/**
 * @route POST /api/orders
 * @description Crear una nueva orden.
 * @access Privado (requiere autenticación)
 * @param {Object} req.body - Datos de la nueva orden.
 * @returns {Object} - Orden creada.
 * @middleware authMiddleware, validateData(orderSchema)
 */
router.post('/', authMiddleware, createOrder);

/**
 * @route GET /api/orders/:id
 * @description Obtener una orden por su ID.
 * @access Privado (requiere autenticación)
 * @param {string} req.params.id - ID de la orden.
 * @returns {Object} - Datos de la orden.
 * @middleware authMiddleware
 */

router.get('/', authMiddleware, getOrders);

/**
 * @route GET /api/orders/:id
 * @description Obtener una orden por su ID.
 * @access Privado (requiere autenticación)
 * @param {string} req.params.id - ID de la orden.
 * @returns {Object} - Datos de la orden.
 * @middleware authMiddleware
 */

router.get('/:id', authMiddleware, getOrderById);

/**
 * @route PUT /api/orders/:id
 * @description Actualizar el estado de una orden.
 * @access Privado (requiere autenticación)
 * @param {string} req.params.id - ID de la orden.
 * @param {Object} req.body - Nuevos datos de la orden.
 * @returns {Object} - Orden actualizada.
 * @middleware authMiddleware, validateData(orderSchema)
 */
router.put('/:id', authMiddleware, updateOrderStatus);

/**
 * @route DELETE /api/orders/:id
 * @description Eliminar una orden.
 * @access Privado (requiere autenticación)
 * @param {string} req.params.id - ID de la orden a eliminar.
 * @returns {Object} - Mensaje de éxito.
 * @middleware authMiddleware
 */
router.delete('/:id', authMiddleware, deleteOrder);

export default router;
