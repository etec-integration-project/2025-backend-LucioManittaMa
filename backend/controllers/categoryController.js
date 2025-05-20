import { Category } from '../models/index.js';

/**
 * @desc Crear una nueva categoría
 * @route POST /api/categories
 * @access Private
 */
export const createCategory = async (req, res) => {
    try {
        const { nombre, descripción } = req.body;
        
        if (!nombre) {
            return res.status(400).json({ error: 'El nombre es requerido' });
        }

        const category = await Category.create({
            nombre,
            descripción
        });

        res.status(201).json({
            message: 'Categoría creada exitosamente',
            category
        });
    } catch (error) {
        console.error('Error al crear categoría:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
        }
        res.status(500).json({ error: 'Error al crear la categoría' });
    }
};

/**
 * @desc Obtener todas las categorías
 * @route GET /api/categories
 * @access Public
 */
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            order: [['nombre', 'ASC']]
        });
        res.json(categories);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ error: 'Error al obtener las categorías' });
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
        const { id } = req.params;
        const { nombre, descripción } = req.body;

        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        await category.update({
            nombre: nombre || category.nombre,
            descripción: descripción || category.descripción
        });

        res.json({
            message: 'Categoría actualizada exitosamente',
            category
        });
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
        }
        res.status(500).json({ error: 'Error al actualizar la categoría' });
    }
};

/**
 * @desc Eliminar una categoría
 * @route DELETE /api/categories/:id
 * @access Private
 */
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id);
        
        if (!category) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        await category.destroy();
        res.json({ message: 'Categoría eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        res.status(500).json({ error: 'Error al eliminar la categoría' });
    }
};
