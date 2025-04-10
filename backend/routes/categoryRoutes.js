/**
 * @file categoryRoutes.js
 * @description Rutas para la gestión de categorías.
 */

import express from 'express';
import {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} from '../controllers/categoryController.js';

const router = express.Router();

/**
 * @route POST /api/categories
 * @description Crear una nueva categoría.
 * @access Público
 * @param {Object} req.body - Datos de la nueva categoría.
 * @returns {Object} - Categoría creada.
 */
router.post('/', createCategory);

/**
 * @route GET /api/categories
 * @description Obtener todas las categorías.
 * @access Público
 * @returns {Array} - Lista de categorías.
 */
router.get('/', getAllCategories);

/**
 * @route GET /api/categories/:id
 * @description Obtener una categoría por su ID.
 * @access Público
 * @param {string} req.params.id - ID de la categoría.
 * @returns {Object} - Datos de la categoría.
 */
router.get('/:id', getCategoryById);

/**
 * @route PUT /api/categories/:id
 * @description Actualizar una categoría existente.
 * @access Público
 * @param {string} req.params.id - ID de la categoría a actualizar.
 * @param {Object} req.body - Nuevos datos de la categoría.
 * @returns {Object} - Categoría actualizada.
 */
router.put('/:id', updateCategory);

/**
 * @route DELETE /api/categories/:id
 * @description Eliminar una categoría existente.
 * @access Público
 * @param {string} req.params.id - ID de la categoría a eliminar.
 * @returns {Object} - Mensaje de éxito.
 */
router.delete('/:id', deleteCategory);

export default router;
