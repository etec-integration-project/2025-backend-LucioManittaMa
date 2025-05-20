import express from 'express';
import { upload } from '../controllers/uploadMiddleware.js';
import { authenticateToken, isAdmin } from '../controllers/authMiddleware.js';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  checkProductStock
} from '../controllers/productsController.js';

const router = express.Router();

// Rutas públicas
router.get('/', getAllProducts); // Obtener todos los productos
router.get('/:id', getProductById); // Obtener un producto por ID
router.get('/:id/stock', checkProductStock);

// Rutas privadas (requieren autenticación y rol de admin)
router.post('/', authenticateToken, isAdmin, upload.single('imagen'), createProduct); // Crear un producto
router.put('/:id', authenticateToken, isAdmin, upload.single('imagen'), updateProduct); // Actualizar un producto
router.delete('/:id', authenticateToken, isAdmin, deleteProduct); // Eliminar un producto
router.patch('/:id/stock', authenticateToken, isAdmin, updateProductStock);

export default router;