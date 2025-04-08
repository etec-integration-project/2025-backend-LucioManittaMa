import { Sequelize } from 'sequelize';
import { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT } from './dotenv.js';

/**
 * Inicializa una nueva instancia de Sequelize para gestionar la conexión a la base de datos.
 * @param {string} DB_NAME - Nombre de la base de datos.
 * @param {string} DB_USER - Usuario de la base de datos.
 * @param {string} DB_PASSWORD - Contraseña del usuario de la base de datos.
 * @param {string} DB_HOST - Host del servidor de la base de datos.
 * @param {number} DB_PORT - Puerto en el que está corriendo el servidor de la base de datos.
 * @returns {Sequelize} Instancia de Sequelize.
 */
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'mysql', // Base de datos utilizada (MySQL en este caso)
  port: DB_PORT,
  logging: false, // Desactiva los logs SQL en la consola
});

/**
 * Establece la conexión con la base de datos y sincroniza los modelos.
 * @async
 * @function connectDB
 * @returns {Promise<void>}
 * @throws {Error} Si no se puede conectar a la base de datos.
 */
export const connectDB = async () => {
  try {
    // Autenticar la conexión a la base de datos
    await sequelize.authenticate();
    console.log('Conexión a la base de datos exitosa');
    
    // Sincronizar los modelos con la base de datos (sin sobrescribir la estructura actual)
    await sequelize.sync({ force: false });
    console.log('Modelos sincronizados con la base de datos');
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error.message);
    process.exit(1); // Salir del proceso si falla la conexión
  }
};

export { sequelize }; // Exportar la instancia de Sequelize para que sea reutilizada en otros módulos.
