import express from 'express';
import { createProduct, updateProduct, deleteProduct } from '../controllers/productsController.js';

const router = express.Router();

// Ya no necesitamos el authMiddleware aquí porque lo aplicamos en app.js
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;