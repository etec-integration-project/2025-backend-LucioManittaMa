import { Sequelize } from 'sequelize';

// Configuración de la conexión a la base de datos usando variables de entorno
const sequelize = new Sequelize(
  process.env.DB_NAME || 'urban', // Nombre de la base de datos
  process.env.DB_USER || 'user', // Usuario de la base de datos
  process.env.DB_PASSWORD || 'userpass', // Contraseña de la base de datos
  {
    host: process.env.DB_HOST || 'localhost', // Host de la base de datos
    dialect: 'mysql', // Dialecto de la base de datos
    logging: false, // Desactivar logs de Sequelize
  }
);

// Función para conectar a la base de datos y sincronizar modelos
export const connectDB = async () => {
  try {
    console.log('Conectando a la base de datos con Sequelize...');
    await sequelize.authenticate(); // Verificar la conexión
    console.log('Conexión a la base de datos exitosa con Sequelize');

    // Sincronizar modelos
    console.log('Sincronizando modelos con la base de datos...');
    await sequelize.sync({ alter: true }); // Usa `alter: true` para actualizar la estructura de la base de datos
    console.log('Modelos sincronizados con la base de datos');
  } catch (error) {
    console.error('Error al conectar a la base de datos con Sequelize:', error.message);
    throw error;
  }
  };

export {sequelize};