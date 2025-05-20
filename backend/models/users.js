import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  contraseña: {
    type: DataTypes.STRING,
    allowNull: true
  },
  rol: {
    type: DataTypes.STRING,
    defaultValue: 'cliente',
    validate: {
      isIn: [['cliente', 'admin']]
    }
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  githubId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.contraseña) {
        const salt = await bcrypt.genSalt(10);
        user.contraseña = await bcrypt.hash(user.contraseña, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('contraseña') && user.contraseña) {
        const salt = await bcrypt.genSalt(10);
        user.contraseña = await bcrypt.hash(user.contraseña, salt);
      }
    }
  }
});

// Función para crear índices de manera segura
const createIndexes = async () => {
  try {
    await sequelize.query('ALTER TABLE users ADD UNIQUE INDEX users_email_unique (email)');
    console.log('✅ Índice de email creado');
  } catch (error) {
    console.log('⚠️ Índice de email ya existe o no se pudo crear');
  }

  try {
    await sequelize.query('ALTER TABLE users ADD INDEX users_google_id (googleId)');
    console.log('✅ Índice de googleId creado');
  } catch (error) {
    console.log('⚠️ Índice de googleId ya existe o no se pudo crear');
  }

  try {
    await sequelize.query('ALTER TABLE users ADD INDEX users_github_id (githubId)');
    console.log('✅ Índice de githubId creado');
  } catch (error) {
    console.log('⚠️ Índice de githubId ya existe o no se pudo crear');
  }
};

// Sincronizar y crear índices
sequelize.sync().then(() => {
  console.log('✅ Tabla users sincronizada');
  createIndexes();
}).catch(error => {
  console.error('❌ Error al sincronizar la tabla:', error);
});

User.prototype.validatePassword = async function(contraseña) {
  if (!this.contraseña) return false;
  return await bcrypt.compare(contraseña, this.contraseña);
};

export { User };