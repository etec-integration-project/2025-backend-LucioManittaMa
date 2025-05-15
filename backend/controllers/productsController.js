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
        console.log('=== Debug Crear Producto ===');
        console.log('Usuario:', req.user);
        console.log('Body completo:', req.body);
        console.log('Stock (raw):', req.body.stock);
        console.log('Tipo de stock:', typeof req.body.stock);
        console.log('Archivo:', req.file);

        const { nombre, descripción, precio, stock, category_id } = req.body;

        // Validar campos requeridos
        if (!nombre || !precio || !stock || !category_id) {
            return res.status(400).json({
                message: 'Faltan campos requeridos',
                required: ['nombre', 'precio', 'stock', 'category_id'],
                received: req.body
            });
        }

        // Manejar la imagen
        let imagenPath = null;
        
        if (req.file) {
            imagenPath = `/uploads/${req.file.filename}`;
        } else if (req.body.imagen && req.body.imagen.startsWith('data:image')) {
            const base64Data = req.body.imagen.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
            const filePath = path.join(__dirname, '../uploads', fileName);
            
            fs.writeFileSync(filePath, buffer);
            imagenPath = `/uploads/${fileName}`;
        } else if (req.body.imagen) {
            imagenPath = req.body.imagen;
        }

        // Procesar el stock por talla
        let stockBySize = {};
        console.log('Procesando stock:', stock);
        
        if (typeof stock === 'string') {
            console.log('Stock es string, intentando parsear...');
            try {
                const parsedStock = JSON.parse(stock);
                console.log('Stock parseado correctamente:', parsedStock);
                
                // Convertir valores a enteros
                Object.keys(parsedStock).forEach(size => {
                    stockBySize[size] = parseInt(parsedStock[size]) || 0;
                });
            } catch (error) {
                console.error('Error al parsear JSON de stock:', error);
                // Valores por defecto
                [36, 37, 38, 39, 40, 41, 42, 43, 44].forEach(size => {
                    stockBySize[size] = 0;
                });
            }
        } else if (typeof stock === 'object' && stock !== null) {
            console.log('Stock es objeto, procesando directamente...');
            // Convertir valores a enteros
            Object.keys(stock).forEach(size => {
                stockBySize[size] = parseInt(stock[size]) || 0;
            });
        } else {
            console.log('Stock es otro tipo, distribuyendo equitativamente...');
            // Si es un número o cualquier otro valor, distribuir el stock equitativamente
            const totalStock = parseInt(stock) || 0;
            const sizes = [36, 37, 38, 39, 40, 41, 42, 43, 44];
            const stockPerSize = Math.floor(totalStock / sizes.length);
            sizes.forEach(size => {
                stockBySize[size] = stockPerSize;
            });
        }

        console.log('Stock final procesado:', stockBySize);

        const productData = {
            nombre,
            descripción: descripción || '',
            precio: parseFloat(precio),
            stock: stockBySize,
            category_id: parseInt(category_id),
            imagen: imagenPath
        };

        console.log('Datos completos del producto a crear:', productData);

        const product = await Product.create(productData);
        console.log('Producto creado:', product.toJSON());

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
