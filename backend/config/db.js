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
    logging: console.log,
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

// Función para conectar a la base de datos y sincronizar modelos
export const connectDB = async () => {
  try {
    console.log('Conectando a la base de datos con Sequelize...');
    await sequelize.authenticate(); // Verificar la conexión
    console.log('✅ Conexión a la base de datos establecida correctamente');

    // Primero verificamos si la tabla users existe
    const [existingTables] = await sequelize.query('SHOW TABLES');
    const tableNames = existingTables.map(t => Object.values(t)[0]);
    console.log('Tablas existentes:', tableNames);

    if (tableNames.includes('users')) {
      // Si la tabla existe, verificamos si tiene las columnas de timestamps
      const [columns] = await sequelize.query('SHOW COLUMNS FROM users');
      const columnNames = columns.map(c => c.Field);
      
      if (!columnNames.includes('created_at')) {
        console.log('Agregando columna created_at...');
        await sequelize.query('ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP');
      }
      
      if (!columnNames.includes('updated_at')) {
        console.log('Agregando columna updated_at...');
        await sequelize.query('ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
      }
    }

    // Sincronizar modelos con la base de datos
    await sequelize.sync({ alter: true });
    console.log('✅ Base de datos sincronizada');

    // Verificar las tablas existentes
    const tables = await sequelize.query('SHOW TABLES');
    console.log('Tablas en la base de datos:', tables[0].map(t => Object.values(t)[0]));
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error);
    process.exit(1);
  }
};

export {sequelize};