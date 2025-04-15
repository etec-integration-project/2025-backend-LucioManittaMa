import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productsController.js';

const router = express.Router();

// Rutas públicas
router.get('/', getAllProducts); // Obtener todos los productos
router.get('/:id', getProductById); // Obtener un producto por ID

// Rutas privadas (requieren autenticación y rol de admin)
router.post('/', createProduct); // Crear un producto
router.put('/:id', updateProduct); // Actualizar un producto
router.delete('/:id', deleteProduct); // Eliminar un producto

export default router;