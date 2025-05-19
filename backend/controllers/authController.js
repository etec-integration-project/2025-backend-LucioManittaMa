import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import fetch from 'node-fetch';
import { Op } from 'sequelize';
import axios from 'axios';

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
        console.log('=== Debug Registro ===');
        console.log('Datos recibidos:', { nombre, email, rol });

        const existingUser = await User.findOne({ 
            where: { 
                [Op.or]: [
                    { email },
                    { googleId: { [Op.not]: null } }
                ]
            }
        });

        if (existingUser) {
            console.log('❌ Usuario ya existe:', email);
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        const newUser = await User.create({
            nombre,
            email,
            contraseña,
            rol,
            dirección,
            teléfono
        });

        console.log('✅ Usuario creado:', {
            id: newUser.user_id,
            nombre: newUser.nombre,
            email: newUser.email,
            rol: newUser.rol
        });

        const token = jwt.sign(
            { 
                userId: newUser.user_id,
                email: newUser.email,
                rol: newUser.rol 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

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
        console.log('Intento de login para:', email);
        
        const user = await User.findOne({ 
            where: { email },
            attributes: ['user_id', 'nombre', 'email', 'contraseña', 'rol', 'googleId']
        });

        if (!user) {
            console.log('❌ Usuario no encontrado:', email);
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        if (user.googleId && !contraseña) {
            console.log('❌ Usuario con autenticación de Google:', email);
            return res.status(401).json({ message: 'Esta cuenta usa autenticación de Google. Por favor, inicia sesión con Google.' });
        }

        if (!user.contraseña) {
            console.log('❌ Usuario sin contraseña:', email);
            return res.status(401).json({ message: 'Esta cuenta no tiene contraseña configurada. Por favor, usa el método de inicio de sesión correspondiente.' });
        }

        const isPasswordValid = await user.validatePassword(contraseña);
        if (!isPasswordValid) {
            console.log('❌ Contraseña incorrecta para:', email);
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { 
                userId: user.user_id,
                email: user.email,
                rol: user.rol 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        const userResponse = {
            id: user.user_id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol
        };

        console.log('✅ Login exitoso para:', email, 'Rol:', user.rol);
        res.status(200).json({
            token,
            user: userResponse
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
    if (!token) {
      return res.status(400).json({ error: 'Token no proporcionado' });
    }

    console.log('=== Debug Google Auth ===');
    console.log('Verificando token de Google...');
    
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const { email, name, sub: googleId } = ticket.getPayload();
    console.log('Datos de Google:', { email, name, googleId });

    // Primero buscamos por googleId
    let user = await User.findOne({ where: { googleId } });
    console.log('Búsqueda por googleId:', user ? 'Usuario encontrado' : 'No encontrado');

    if (!user) {
      // Si no existe por googleId, buscamos por email
      user = await User.findOne({ where: { email } });
      console.log('Búsqueda por email:', user ? 'Usuario encontrado' : 'No encontrado');

      if (user) {
        // Si el usuario existe por email pero no tiene googleId, lo actualizamos
        if (!user.googleId) {
          console.log('Actualizando googleId para usuario existente');
          user.googleId = googleId;
          await user.save();
        }
      } else {
        // Si no existe por ninguno de los dos, creamos uno nuevo
        console.log('Creando nuevo usuario con Google');
        user = await User.create({
          email,
          nombre: name,
          googleId,
          contraseña: null,
          rol: 'cliente'
        });
      }
    }

    // Verificamos que el usuario existe y tiene un ID válido
    if (!user || !user.user_id) {
      console.error('Error: Usuario no válido después de la autenticación');
      return res.status(500).json({ error: 'Error en la autenticación' });
    }

    console.log('Usuario autenticado:', {
      id: user.user_id,
      email: user.email,
      rol: user.rol
    });

    const jwtToken = jwt.sign(
      { 
        userId: user.user_id,
        email: user.email,
        rol: user.rol 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const userResponse = {
      id: user.user_id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol
    };

    res.json({
      token: jwtToken,
      user: userResponse
    });
  } catch (error) {
    console.error('Error detallado en autenticación de Google:', error);
    if (error.message.includes('Token used too late')) {
      return res.status(401).json({ error: 'El token de Google ha expirado' });
    }
    if (error.message.includes('Invalid token')) {
      return res.status(401).json({ error: 'Token de Google inválido' });
    }
    res.status(500).json({ 
      error: 'Error en la autenticación de Google',
      details: error.message 
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log('=== Debug Forgot Password ===');
    console.log('Email recibido:', email);

    const user = await User.findOne({ where: { email } });
    console.log('Usuario encontrado:', user ? 'Sí' : 'No');

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return res.status(404).json({ message: 'No existe un usuario con ese email' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await user.save();
    console.log('✅ Token de recuperación generado');

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    
    try {
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

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email enviado correctamente', info.response);
    } catch (emailError) {
      console.error('❌ Error al enviar email:', emailError.message);
      console.error('❌ Detalles del error de email:', emailError);
      // No fallamos si no podemos enviar el email
    }

    res.json({ 
      message: 'Se ha enviado un email con las instrucciones para restablecer tu contraseña',
      token // Enviamos el token en la respuesta para desarrollo
    });
  } catch (error) {
    console.error('❌ Error en recuperación de contraseña:', error);
    res.status(500).json({ 
      message: 'Error al procesar la solicitud de recuperación de contraseña',
      error: error.message 
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, contraseña } = req.body;
    
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'El token es inválido o ha expirado' });
    }

    user.contraseña = contraseña;
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
    if (!code) {
      return res.status(400).json({ message: 'Código no proporcionado' });
    }

    console.log('=== Debug GitHub Auth ===');
    console.log('Código de GitHub recibido:', code);

    // Intercambiar el código por un token de acceso en GitHub
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    }, {
      headers: {
        Accept: 'application/json'
      }
    });

    const { access_token } = tokenResponse.data;

    if (!access_token) {
       console.error('Error al obtener access_token de GitHub:', tokenResponse.data);
       return res.status(400).json({ message: 'Error al obtener token de acceso de GitHub' });
    }

    console.log('Access token de GitHub obtenido:', access_token);

    // Usar el access_token para obtener información del usuario
    const githubUserResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    const { id: githubId, email: publicEmail, name } = githubUserResponse.data;
    console.log('Datos de usuario de GitHub:', { email: publicEmail, name, githubId });

    let userEmail = publicEmail;

    // Si el email público no está disponible, intentar obtenerlo de /user/emails
    if (!userEmail) {
        console.log('Email público no disponible, intentando obtener de /user/emails');
        try {
            const emailsResponse = await axios.get('https://api.github.com/user/emails', {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            });
            // Buscar el email primario y verificado
            const primaryEmail = emailsResponse.data.find(e => e.primary && e.verified);
            if (primaryEmail) {
                userEmail = primaryEmail.email;
                console.log('Email primario y verificado encontrado:', userEmail);
            } else {
                 console.log('No se encontró email primario y verificado en /user/emails.');
            }
        } catch (emailsError) {
            console.error('Error al obtener emails de /user/emails:', emailsError.message);
        }
    }

    if (!userEmail) {
        console.error('No se pudo obtener un email válido de GitHub para el usuario:', name);
        return res.status(400).json({ message: 'No se pudo obtener un email de tu cuenta de GitHub. Asegúrate de tener un email primario y verificado, y que no esté configurado como privado en exceso.' });
    }

    // Buscar usuario por githubId
    let user = await User.findOne({ where: { githubId: githubId.toString() } }); // Aseguramos que sea string
    console.log('Búsqueda por githubId:', user ? 'Encontrado' : 'No encontrado');

    if (!user) {
      // Si no existe por githubId, buscar por email
      user = await User.findOne({ where: { email: userEmail } });
      console.log('Búsqueda por email:', user ? 'Encontrado' : 'No encontrado');

      if (user) {
        // Si existe por email, actualizar con githubId
        console.log('Usuario existente encontrado por email, actualizando con githubId');
        user.githubId = githubId.toString();
        await user.save();
      } else {
        // Si no existe, crear nuevo usuario
        console.log('Creando nuevo usuario con GitHub');
        user = await User.create({
          nombre: name || userEmail,
          email: userEmail,
          githubId: githubId.toString(),
          rol: 'cliente',
          contraseña: null
        });
      }
    } else {
        // Si el usuario ya existe por githubId, actualizar datos si es necesario
        if (user.email !== userEmail || user.nombre !== name) {
             console.log('Usuario existente encontrado por githubId, actualizando email o nombre');
             user.email = userEmail;
             if (name) user.nombre = name;
             await user.save();
        }
    }

    // Verificamos que el usuario existe y tiene un ID válido
    if (!user || !user.user_id) {
      console.error('Error: Usuario no válido después de la autenticación de GitHub');
      return res.status(500).json({ error: 'Error interno en la autenticación' });
    }

    console.log('Usuario autenticado con GitHub:', {
      id: user.user_id,
      email: user.email,
      rol: user.rol
    });

    const jwtToken = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
        rol: user.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const userResponse = {
      id: user.user_id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol
    };

    res.json({
      token: jwtToken,
      user: userResponse
    });
  } catch (error) {
    console.error('Error detallado en autenticación con GitHub:', error);
    res.status(500).json({
      message: 'Error en la autenticación con GitHub',
      details: error.message
    });
  }
};

export const verifyToken = async (req, res) => {
  try {
    console.log('=== Debug Verify Token ===');
    console.log('UserId recibido:', req.user.userId);
    
    const user = await User.findOne({
      where: { user_id: req.user.userId },
      attributes: ['user_id', 'nombre', 'email', 'rol', 'googleId', 'githubId']
    });
    
    console.log('Usuario encontrado:', user ? 'Sí' : 'No');
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    console.log('✅ Usuario verificado:', {
      id: user.user_id,
      email: user.email,
      rol: user.rol
    });

    // Generar nuevo token
    const token = jwt.sign(
      { 
        userId: user.user_id,
        email: user.email,
        rol: user.rol 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const userResponse = {
      id: user.user_id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol
    };

    res.json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('❌ Error al verificar token:', error);
    res.status(500).json({ 
      message: 'Error al verificar el token',
      error: error.message 
    });
  }
};
