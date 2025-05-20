/**
 * @file categoryRoutes.js
 * @description Rutas para la gestión de categorías.
 */

import express from 'express';
import {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} from '../controllers/categoryController.js';
import { isAdmin, authenticateToken } from '../controllers/authMiddleware.js';

const router = express.Router();

/**
 * @route POST /api/categories
 * @description Crear una nueva categoría.
 * @access Private
 * @param {Object} req.body - Datos de la nueva categoría.
 * @returns {Object} - Categoría creada.
 */
router.post('/', authenticateToken, isAdmin, createCategory);

/**
 * @route GET /api/categories
 * @description Obtener todas las categorías.
 * @access Public
 * @returns {Array} - Lista de categorías.
 */
router.get('/', getCategories);

/**
 * @route GET /api/categories/:id
 * @description Obtener una categoría por su ID.
 * @access Public
 * @param {string} req.params.id - ID de la categoría.
 * @returns {Object} - Datos de la categoría.
 */
router.get('/:id', getCategoryById);

/**
 * @route PUT /api/categories/:id
 * @description Actualizar una categoría existente.
 * @access Private
 * @param {string} req.params.id - ID de la categoría a actualizar.
 * @param {Object} req.body - Nuevos datos de la categoría.
 * @returns {Object} - Categoría actualizada.
 */
router.put('/:id', authenticateToken, isAdmin, updateCategory);

/**
 * @route DELETE /api/categories/:id
 * @description Eliminar una categoría existente.
 * @access Private
 * @param {string} req.params.id - ID de la categoría a eliminar.
 * @returns {Object} - Mensaje de éxito.
 */
router.delete('/:id', authenticateToken, isAdmin, deleteCategory);

export default router;
