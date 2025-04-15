import { Product } from '../models/index.js';

/**
 * @desc Obtener todos los productos (ruta pública)
 * @route GET /api/products
 * @access Public
 */
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        res.status(200).json(products);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al obtener productos',
            error: error.message 
        });
    }
};

/**
 * @desc Crear un nuevo producto
 * @route POST /api/products
 * @access Private/Admin
 */
export const createProduct = async (req, res) => {
    try {
        // Check if user exists and has admin role
        if (!req.user) {
            return res.status(401).json({ message: 'No autenticado' });
        }

        if (req.user.rol !== 'admin') {
            return res.status(403).json({ message: 'No autorizado - Se requiere rol de administrador' });
        }

        const { nombre, descripción, precio, stock, category_id, imagen } = req.body;

        // Validate required fields
        if (!nombre || !precio || !stock || !category_id) {
            return res.status(400).json({ 
                message: 'Faltan campos requeridos',
                required: ['nombre', 'precio', 'stock', 'category_id'],
                received: req.body 
            });
        }

        const product = await Product.create({
            nombre,
            descripción,
            precio,
            stock,
            category_id,
            imagen
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ 
            message: 'Error al crear el producto',
            error: error.message 
        });
    }
};

/**
 * @desc Actualizar un producto
 * @route PUT /api/products/:id
 * @access Private/Admin
 */
export const updateProduct = async (req, res) => {
    if (req.user.rol !== 'admin') {
        return res.status(403).json({ message: 'No autorizado' });
    }

    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        await product.update(req.body);
        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * @desc Eliminar un producto
 * @route DELETE /api/products/:id
 * @access Private/Admin
 */
export const deleteProduct = async (req, res) => {
    if (req.user.rol !== 'admin') {
        return res.status(403).json({ message: 'No autorizado' });
    }

    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        await product.destroy();
        res.status(200).json({ message: "Producto eliminado" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * @desc Obtener un producto por ID
 * @route GET /api/products/:id
 * @access Public
 */
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
