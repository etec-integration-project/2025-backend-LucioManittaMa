import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de la conexión a la base de datos usando variables de entorno
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Función para sincronizar la base de datos
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    // await sequelize.sync({ alter: true }); // Desactivado para evitar conflictos de migración automática
    // Solo log de éxito o error, no spam de logs
  } catch (error) {
    console.error('Error al sincronizar la base de datos:', error);
    process.exit(1);
  }
};

export { sequelize, syncDatabase };