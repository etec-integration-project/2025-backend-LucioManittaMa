import express from 'express';
import { register, login, getUserProfile, googleAuth, forgotPassword, resetPassword, githubAuth, verifyToken, changePassword } from '../controllers/authController.js';
import { authMiddleware as auth } from '../controllers/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getUserProfile);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', auth, changePassword);
router.post('/github', githubAuth);
router.get('/verify-token', auth, verifyToken);
router.get('/me', auth, verifyToken);

export default router; 