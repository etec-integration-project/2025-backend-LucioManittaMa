import express from 'express';
import { register, login, getUserProfile } from '../controllers/authController.js';
import { authMiddleware } from '../controllers/authMiddleware.js';

const router = express.Router();

// Rutas de autenticación
router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getUserProfile);

export default router;
