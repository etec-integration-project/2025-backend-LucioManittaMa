import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

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
        unique: true
    },
    contraseña: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dirección: {
        type: DataTypes.STRING,
        allowNull: true
    },
    teléfono: {
        type: DataTypes.STRING,
        allowNull: true
    },
    fecha_registro: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    rol: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'cliente' 
    }
}, {
    tableName: 'users',
    timestamps: false
});

/**
 * Crear un nuevo usuario.
 * @param {Object} user - Datos del usuario.
 * @returns {Promise<void>}
 */
const createUser = async (user) => {
    await User.create(user);
};

export { User, createUser };
