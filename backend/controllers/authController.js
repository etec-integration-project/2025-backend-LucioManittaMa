import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import fetch from 'node-fetch';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Configuración del transporter de nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

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

export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const { email, name, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({ where: { googleId } });
    
    if (!user) {
      user = await User.findOne({ where: { email } });
      if (user) {
        user.googleId = googleId;
        await user.save();
      } else {
        user = await User.create({
          email,
          nombre: name,
          googleId,
          password: null
        });
      }
    }

    const jwtToken = jwt.sign(
      { id: user.user_id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token: jwtToken, user: { id: user.user_id, email: user.email, nombre: user.nombre, rol: user.rol } });
  } catch (error) {
    console.error('Error en autenticación de Google:', error);
    res.status(500).json({ error: 'Error en la autenticación de Google' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'No existe un usuario con ese email' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Recuperación de contraseña',
      html: `
        <p>Has solicitado restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Se ha enviado un email con las instrucciones para restablecer tu contraseña' });
  } catch (error) {
    console.error('Error en recuperación de contraseña:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud de recuperación de contraseña' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'El token es inválido o ha expirado' });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({ error: 'Error al restablecer la contraseña' });
  }
};

export const githubAuth = async (req, res) => {
  try {
    const { code } = req.body;
    // Intercambia el code por un access_token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Obtén los datos del usuario
    const userResponse = await fetch('https://api.github.com/user', {
      headers: { Authorization: `token ${accessToken}` }
    });
    const githubUser = await userResponse.json();

    // Busca o crea el usuario en tu base de datos
    let user = await User.findOne({ where: { githubId: githubUser.id } });
    if (!user) {
      user = await User.create({
        nombre: githubUser.name || githubUser.login,
        email: githubUser.email || `${githubUser.login}@github.com`,
        githubId: githubUser.id,
        password: null
      });
    }

    const jwtToken = jwt.sign(
      { id: user.user_id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token: jwtToken, user: { id: user.user_id, email: user.email, nombre: user.nombre, rol: user.rol } });
  } catch (error) {
    console.error('Error en autenticación de GitHub:', error);
    res.status(500).json({ error: 'Error en la autenticación de GitHub' });
  }
};
