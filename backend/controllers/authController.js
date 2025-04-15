import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';

export const register = async (req, res) => {
    const { nombre, email, contraseña, rol = 'cliente', dirección, teléfono } = req.body;

    if (!nombre || !email || !contraseña) {
        return res.status(400).json({ message: 'Faltan datos obligatorios: nombre, email y contraseña' });
    }

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        const hashedPassword = await bcrypt.hash(contraseña, 10);

        const newUser = await User.create({
            nombre,
            email,
            contraseña: hashedPassword,
            rol,
            dirección,
            teléfono
        });

        const token = jwt.sign(
            { userId: newUser.user_id, rol: newUser.rol },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        console.log('✅ Usuario registrado:', email);
        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            user: {
                id: newUser.user_id,
                nombre: newUser.nombre,
                email: newUser.email,
                rol: newUser.rol
            }
        });
    } catch (error) {
        console.error('❌ Error en registro:', error);
        res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
    }
};

export const login = async (req, res) => {
    const { email, contraseña } = req.body;

    try {
        const user = await User.findOne({ 
            where: { email },
            attributes: ['user_id', 'nombre', 'email', 'contraseña', 'rol']
        });

        if (!user || !(await bcrypt.compare(contraseña, user.contraseña))) {
            console.log('❌ Intento de login fallido para:', email);
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { userId: user.user_id, rol: user.rol },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        console.log('✅ Login exitoso para:', email);
        res.status(200).json({
            token,
            user: {
                id: user.user_id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol
            }
        });

    } catch (error) {
        console.error('❌ Error en login:', error);
        res.status(500).json({ 
            message: 'Error al iniciar sesión', 
            error: error.message 
        });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.userId);
        
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
        console.error('❌ Error al obtener perfil:', error);
        res.status(500).json({ message: 'Error al obtener el perfil', error: error.message });
    }
};
