const express = require('express');
const router = express.Router();
const { register, login, getProfile, googleAuth, forgotPassword, resetPassword, githubAuth } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/github', githubAuth);

module.exports = router; 