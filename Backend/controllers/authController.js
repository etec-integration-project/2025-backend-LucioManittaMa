import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/dotenv.js';
import { User } from '../models/index.js';

/**
 * Registrar un nuevo usuario.
 * @param {Request} req - Solicitud HTTP.
 * @param {Response} res - Respuesta HTTP.
 */
const registerUser = async (req, res) => {
    const { nombre, email, contraseña, rol = 'cliente', dirección, teléfono } = req.body;

    // Validación de campos obligatorios
    if (!nombre || !email || !contraseña) {
        return res.status(400).json({ message: 'Faltan datos obligatorios: nombre, email y contraseña' });
    }

    try {
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        // Crear el nuevo usuario
        const newUser = await User.create({
            nombre,
            email,
            contraseña: hashedPassword,
            rol,
            dirección,
            teléfono
        });

        // Generar el token JWT
        const token = jwt.sign({ userId: newUser.user_id, rol: newUser.rol }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN
        });

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
    }
};

/**
 * Iniciar sesión.
 * @param {Request} req - Solicitud HTTP.
 * @param {Response} res - Respuesta HTTP.
 */
const loginUser = async (req, res) => {
    const { email, contraseña } = req.body;

    try {
        const user = await User.findOne({ 
            where: { email },
            attributes: ['user_id', 'nombre', 'email', 'contraseña', 'rol']
        });

        if (!user || !(await bcrypt.compare(contraseña, user.contraseña))) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { userId: user.user_id, rol: user.rol }, 
            JWT_SECRET, 
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Asegurarse de que todos los campos requeridos estén presentes
        const userData = {
            id: user.user_id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol
        };
        
        res.status(200).json({
            token,
            user: userData
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            message: 'Error al iniciar sesión', 
            error: error.message 
        });
    }
};

/**
 * Obtener el perfil del usuario autenticado.
 * @param {Request} req - Solicitud HTTP.
 * @param {Response} res - Respuesta HTTP.
 */
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json({
            id: user.user_id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el perfil del usuario', error: error.message });
    }
};

// Exportar todas las funciones juntas al final del archivo
export {
    registerUser as register,
    loginUser as login,
    getUserProfile
};