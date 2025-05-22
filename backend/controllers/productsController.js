import { Product, updateStockBySize, checkStockAvailability } from '../models/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @desc Obtener todos los productos (ruta pública)
 * @route GET /api/products
 * @access Public
 */
export const getAllProducts = async (req, res) => {
    try {
        // Deshabilitar el caché para esta respuesta
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        
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
        const { nombre, descripción, precio, stock, category_id, imagen: imagenUrl } = req.body;
        
        // Manejar la imagen (puede venir como archivo o como URL)
        let imagen = null;
        if (req.file) {
            // Si se subió un archivo
            imagen = `/uploads/${req.file.filename}`;
        } else if (imagenUrl && imagenUrl.startsWith('http')) {
            // Si se proporcionó una URL de imagen
            imagen = imagenUrl;
        }

        // Parsear el stock si viene como string JSON
        let stockData = stock;
        if (typeof stock === 'string') {
            try {
                stockData = JSON.parse(stock);
            } catch (e) {
                console.error('Error al parsear stock:', e);
                return res.status(400).json({ message: 'Formato de stock inválido' });
            }
        }

        const productData = {
            nombre,
            descripción,
            precio,
            stock: stockData,
            category_id,
            imagen
        };

        ('Datos del producto a crear:', productData);

        const product = await Product.create(productData);
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

        // Procesar imagen: archivo o URL
        let imagen = product.imagen; // valor actual por defecto
        if (req.file) {
            imagen = `/uploads/${req.file.filename}`;
        } else if (req.body.imagen && req.body.imagen.startsWith('http')) {
            imagen = req.body.imagen;
        }

        // Construir los datos a actualizar
        const updateData = {
            ...req.body,
            imagen
        };

        await product.update(updateData);
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

/**
 * @desc Actualizar stock de un producto por talla
 * @route PATCH /api/products/:id/stock
 * @access Private/Admin
 */
export const updateProductStock = async (req, res) => {
    if (req.user.rol !== 'admin') {
        return res.status(403).json({ message: 'No autorizado' });
    }

    try {
        const { size, quantity } = req.body;
        const productId = req.params.id;

        if (!size || quantity === undefined) {
            return res.status(400).json({ 
                message: 'Faltan campos requeridos',
                required: ['size', 'quantity']
            });
        }

        const success = await updateStockBySize(productId, size, quantity);
        if (!success) {
            return res.status(400).json({ 
                message: 'No se pudo actualizar el stock. Verifique que el producto existe y hay suficiente stock.'
            });
        }

        res.status(200).json({ message: 'Stock actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error al actualizar el stock',
            error: error.message 
        });
    }
};

/**
 * @desc Verificar disponibilidad de stock
 * @route GET /api/products/:id/stock
 * @access Public
 */
export const checkProductStock = async (req, res) => {
    try {
        const { size, quantity } = req.query;
        const productId = req.params.id;

        if (!size || !quantity) {
            return res.status(400).json({ 
                message: 'Faltan parámetros requeridos',
                required: ['size', 'quantity']
            });
        }

        const available = await checkStockAvailability(
            productId, 
            parseInt(size), 
            parseInt(quantity)
        );

        res.status(200).json({ available });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error al verificar el stock',
            error: error.message 
        });
    }
};
