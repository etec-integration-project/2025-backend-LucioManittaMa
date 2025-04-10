import express from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/userController.js';
import { authMiddleware } from '../controllers/authMiddleware.js'; 

// Crear una instancia del enrutador
const router = express.Router();

/**
 * @route POST /api/users/register
 * @desc Registra un nuevo usuario
 * @access Público
 */
router.post('/register', registerUser);

/**
 * @route POST /api/users/login
 * @desc Autentica un usuario
 * @access Público
 */
router.post('/login', loginUser);

/**
 * @route GET /api/users/me
 * @desc Obtiene el perfil del usuario autenticado
 * @access Privado
 */
router.get('/me', authMiddleware, getUserProfile);

export default router;
