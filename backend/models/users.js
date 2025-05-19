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
    unique: true,
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
    allowNull: true,
    unique: true
  },
  githubId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
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

User.prototype.validatePassword = async function(contraseña) {
  if (!this.contraseña) return false;
  return await bcrypt.compare(contraseña, this.contraseña);
};

export { User };