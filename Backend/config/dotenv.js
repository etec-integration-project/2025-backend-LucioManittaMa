import dotenv from 'dotenv';

/**
 * Carga las variables de entorno desde un archivo .env en el proceso.
 * Esto permite configurar datos sensibles como las credenciales de la base de datos
 * o claves de seguridad, sin exponerlos directamente en el código fuente.
 */
dotenv.config();

/**
 * Configuraciones para la aplicación, obtenidas desde las variables de entorno.
 * Estas configuraciones incluyen la conexión a la base de datos y claves de seguridad.
 * @module dotenv
 */

export const PORT = process.env.PORT || 5000;  // Puerto en el que se ejecuta el servidor
export const DB_NAME = process.env.DB_NAME;    // Nombre de la base de datos
export const DB_USER = process.env.DB_USER;    // Usuario de la base de datos
export const DB_PASSWORD = process.env.DB_PASSWORD;  // Contraseña del usuario de la base de datos
export const DB_HOST = process.env.DB_HOST;    // Host del servidor de la base de datos
export const DB_PORT = process.env.DB_PORT;    // Puerto del servidor de la base de datos
export const JWT_SECRET = process.env.JWT_SECRET;  // Clave secreta para JWT (autenticación)
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;  // Tiempo de expiración para el token JWT
