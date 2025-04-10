import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';

// Configuración embebida
const JWT_SECRET = 'tu_clave_secreta_aqui';
const JWT_EXPIRES_IN = '24h';

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ where: { email } }); 

        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword }); 

        const token = jwt.sign({ id: user.user_id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.status(201).json({
            user: {
                id: user.user_id,
                name: user.name,
                email: user.email,
            },
            token,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar usuario', error });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } }); 

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const token = jwt.sign({ id: user.user_id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.json({
            user: {
                id: user.user_id,
                name: user.name,
                email: user.email,
            },
            token,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al iniciar sesión', error });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.user_id); 

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({
            id: user.user_id,
            name: user.name,
            email: user.email,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener perfil de usuario', error });
    }
};
