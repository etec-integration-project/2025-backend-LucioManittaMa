import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const CartItem = sequelize.define('CartItem', {
    cart_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'shopping_carts',
            key: 'cart_id'
        }
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'product_id'
        }
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'cart_items',
    timestamps: false
});

/**
 * Crear un nuevo item en el carrito de compras.
 * @param {Object} cartItem - Objeto con los datos del item del carrito.
 * @returns {Promise<void>}
 */
export const createCartItem = async (cartItem) => {
    await CartItem.create(cartItem);
};

export { CartItem };
