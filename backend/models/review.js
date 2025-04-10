import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Review = sequelize.define('Review', {
    review_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'product_id'
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    calificación: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    comentario: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    }
}, {
    tableName: 'reviews',
    timestamps: false
});

/**
 * Crear una nueva reseña.
 * @param {Object} review - Datos de la reseña.
 * @returns {Promise<void>}
 */
const createReview = async (review) => {
    await Review.create(review);
};

export { Review, createReview };
