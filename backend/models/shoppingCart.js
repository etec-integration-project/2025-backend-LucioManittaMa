import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const ShoppingCart = sequelize.define('ShoppingCart', {
    cart_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id'  // Cambiado de 'id' a 'user_id'
        }
    },
    fecha_creación: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    }
}, {
    tableName: 'shopping_carts',
    timestamps: false
});

/**
 * Crear un nuevo carrito de compras.
 * @param {Object} cart - Datos del carrito.
 * @returns {Promise<void>}
 */
const createCart = async (cart) => {
    await ShoppingCart.create(cart);
};

export { ShoppingCart, createCart };
