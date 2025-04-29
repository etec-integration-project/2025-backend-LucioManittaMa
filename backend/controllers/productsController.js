import { Product } from '../models/index.js';
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
        console.log('Body:', req.body);
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
            // Si se subió un archivo
            imagenPath = `/uploads/${req.file.filename}`;
        } else if (req.body.imagen && req.body.imagen.startsWith('data:image')) {
            // Si es una imagen base64
            const base64Data = req.body.imagen.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
            const filePath = path.join(__dirname, '../uploads', fileName);
            
            fs.writeFileSync(filePath, buffer);
            imagenPath = `/uploads/${fileName}`;
        } else if (req.body.imagen) {
            // Si es una URL
            imagenPath = req.body.imagen;
        }

        const productData = {
            nombre,
            descripción: descripción || '',
            precio: parseFloat(precio),
            stock: parseInt(stock),
            category_id: parseInt(category_id),
            imagen: imagenPath
        };

        console.log('Datos del producto a crear:', productData);

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
