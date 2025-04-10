import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Category = sequelize.define('Category', {
    category_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripción: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'categories',
    timestamps: false
});

/**
 * Crear una nueva categoría.
 * @param {Object} category - Datos de la categoría.
 * @returns {Promise<void>}
 */
export const createCategory = async (category) => {
    await Category.create(category);
};

export { Category };
