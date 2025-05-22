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
  try {
    const { nombre, email, contraseña, rol = 'cliente' } = req.body;
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Crear nuevo usuario
    const user = await User.create({
      nombre,
      email,
      contraseña,
      rol
    });

    // Generar token
    const token = jwt.sign(
      { userId: user.user_id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user.user_id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, contraseña } = req.body;
    ('=== Debug Login ===');
    ('Email recibido:', email);
    ('Contraseña recibida:', contraseña ? 'Sí' : 'No');

    // Buscar usuario
    const user = await User.findOne({ where: { email } });
    if (!user) {
      ('❌ Usuario no encontrado');
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    ('✅ Usuario encontrado');

    // Verificar contraseña
    ('Verificando contraseña...');
    const isValidPassword = await bcrypt.compare(contraseña, user.contraseña);
    ('Resultado de verificación:', isValidPassword ? '✅ Correcta' : '❌ Incorrecta');
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Generar token
    const token = jwt.sign(
      { userId: user.user_id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    ('✅ Login exitoso');
    res.json({
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
    res.status(500).json({ message: 'Error al iniciar sesión' });
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

    ('=== Debug Google Auth ===');
    ('Verificando token de Google...');
    
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const { email, name, sub: googleId } = ticket.getPayload();
    ('Datos de Google:', { email, name, googleId });

    // Primero buscamos por googleId
    let user = await User.findOne({ where: { googleId } });
    ('Búsqueda por googleId:', user ? 'Usuario encontrado' : 'No encontrado');

    if (!user) {
      // Si no existe por googleId, buscamos por email
      user = await User.findOne({ where: { email } });
      ('Búsqueda por email:', user ? 'Usuario encontrado' : 'No encontrado');

      if (user) {
        // Si el usuario existe por email pero no tiene googleId, lo actualizamos
        if (!user.googleId) {
          ('Actualizando googleId para usuario existente');
          user.googleId = googleId;
          await user.save();
        }
      } else {
        // Si no existe por ninguno de los dos, creamos uno nuevo
        ('Creando nuevo usuario con Google');
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

    ('Usuario autenticado:', {
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
    ('=== Debug Forgot Password ===');
    ('Email recibido:', email);

    const user = await User.findOne({ where: { email } });
    ('Usuario encontrado:', user ? 'Sí' : 'No');

    if (!user) {
      ('❌ Usuario no encontrado');
      return res.status(404).json({ message: 'No existe un usuario con ese email' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await user.save();
    ('✅ Token de recuperación generado');

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
      ('✅ Email enviado correctamente', info.response);
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
    ('=== Debug Reset Password ===');
    ('Token recibido:', token);
    ('Contraseña recibida:', contraseña ? 'Sí' : 'No');
    
    if (!token || !contraseña) {
      ('❌ Datos incompletos');
      return res.status(400).json({ 
        error: 'Token y contraseña son requeridos',
        received: { token: !!token, contraseña: !!contraseña }
      });
    }
    
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      ('❌ Usuario no encontrado o token expirado');
      return res.status(400).json({ error: 'El token es inválido o ha expirado' });
    }

    ('✅ Usuario encontrado, procediendo a actualizar contraseña');
    
    // Actualizar usuario - el hook beforeUpdate se encargará de hashear la contraseña
    user.contraseña = contraseña;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    
    ('Guardando cambios...');
    await user.save();
    ('Cambios guardados');

    // Verificar que la contraseña se guardó correctamente
    const updatedUser = await User.findOne({ where: { user_id: user.user_id } });
    ('Usuario recuperado después de guardar:', updatedUser ? 'Sí' : 'No');
    
    if (!updatedUser) {
      ('❌ Error: No se pudo recuperar el usuario después de guardar');
      return res.status(500).json({ error: 'Error al actualizar la contraseña' });
    }

    const isPasswordValid = await updatedUser.validatePassword(contraseña);
    ('Verificación post-guardado:', isPasswordValid ? '✅ Correcta' : '❌ Incorrecta');

    if (!isPasswordValid) {
      ('❌ Error: La contraseña no se guardó correctamente');
      return res.status(500).json({ error: 'Error al actualizar la contraseña' });
    }

    ('✅ Contraseña actualizada correctamente');
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('❌ Error al restablecer contraseña:', error);
    res.status(500).json({ 
      error: 'Error al restablecer la contraseña',
      details: error.message 
    });
  }
};

export const githubAuth = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Código no proporcionado' });
    }

    // Intercambiar el código por un token de acceso en GitHub
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    }, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const { access_token } = tokenResponse.data;

    if (!access_token) {
      return res.status(400).json({ message: 'Error al obtener token de acceso de GitHub' });
    }

    // Usar el access_token para obtener información del usuario
    const githubUserResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    const { id: githubId, email: publicEmail, name } = githubUserResponse.data;
    let userEmail = publicEmail;

    // Si el email público no está disponible, intentar obtenerlo de /user/emails
    if (!userEmail) {
      try {
        const emailsResponse = await axios.get('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        });
        const primaryEmail = emailsResponse.data.find(e => e.primary && e.verified);
        if (primaryEmail) {
          userEmail = primaryEmail.email;
        }
      } catch (emailsError) {
        console.error('Error al obtener emails:', emailsError);
      }
    }

    if (!userEmail) {
      return res.status(400).json({ 
        message: 'No se pudo obtener un email de tu cuenta de GitHub. Asegúrate de tener un email primario y verificado.'
      });
    }

    // Buscar usuario por githubId
    let user = await User.findOne({ where: { githubId: githubId.toString() } });

    if (!user) {
      // Si no existe por githubId, buscar por email
      user = await User.findOne({ where: { email: userEmail } });

      if (user) {
        // Si existe por email, actualizar con githubId
        user.githubId = githubId.toString();
        await user.save();
      } else {
        // Si no existe, crear nuevo usuario
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
        user.email = userEmail;
        if (name) user.nombre = name;
        await user.save();
      }
    }

    const jwtToken = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
        rol: user.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token: jwtToken,
      user: {
        id: user.user_id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error('Error en autenticación con GitHub:', error);
    res.status(500).json({
      message: 'Error en la autenticación con GitHub',
      details: error.message
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Debes ingresar la contraseña actual y la nueva contraseña.' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.contraseña);
    if (!isMatch) {
      return res.status(401).json({ message: 'La contraseña actual es incorrecta.' });
    }

    user.contraseña = newPassword;
    await user.save();

    res.json({ message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    console.error('Error al cambiar la contraseña:', error);
    res.status(500).json({ message: 'Error al cambiar la contraseña.' });
  }
};

export const verifyToken = async (req, res) => {
  try {
    ('=== Debug Verify Token ===');
    ('UserId recibido:', req.user.userId);
    
    const user = await User.findOne({
      where: { user_id: req.user.userId },
      attributes: ['user_id', 'nombre', 'email', 'rol', 'googleId', 'githubId']
    });
    
    ('Usuario encontrado:', user ? 'Sí' : 'No');
    
    if (!user) {
      ('❌ Usuario no encontrado');
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    ('✅ Usuario verificado:', {
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
