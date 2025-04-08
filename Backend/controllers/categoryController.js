import { Category } from '../models/index.js';

/**
 * @desc Crear una nueva categoría
 * @route POST /api/categories
 * @access Private
 */
export const createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * @desc Obtener todas las categorías
 * @route GET /api/categories
 * @access Public
 */
export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.status(200).json(categories);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * @desc Obtener una categoría por ID
 * @route GET /api/categories/:id
 * @access Public
 */
export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * @desc Actualizar una categoría
 * @route PUT /api/categories/:id
 * @access Private
 */
export const updateCategory = async (req, res) => {
    try {
        const [updated] = await Category.update(req.body, {
            where: { category_id: req.params.id }
        });

        if (!updated) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }

        const updatedCategory = await Category.findByPk(req.params.id);
        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * @desc Eliminar una categoría
 * @route DELETE /api/categories/:id
 * @access Private
 */
export const deleteCategory = async (req, res) => {
    try {
        const deleted = await Category.destroy({ where: { category_id: req.params.id } });

        if (!deleted) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }

        res.status(200).json({ message: "Categoría eliminada" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
