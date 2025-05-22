import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Product = sequelize.define('Product', {
    product_id: {
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
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    stock: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {
            36: 0, 37: 0, 38: 0, 39: 0, 40: 0, 41: 0, 42: 0, 43: 0, 44: 0
        },
        get() {
            const rawValue = this.getDataValue('stock');
            if (!rawValue) {
                return {
                    36: 0, 37: 0, 38: 0, 39: 0, 40: 0, 41: 0, 42: 0, 43: 0, 44: 0
                };
            }
            
            if (typeof rawValue === 'string') {
                try {
                    const parsed = JSON.parse(rawValue);
                    const result = {};
                    Object.keys(parsed).forEach(size => {
                        result[size] = parseInt(parsed[size]) || 0;
                    });
                    return result;
                } catch (e) {
                    error('Error al parsear stock:', e);
                    return {
                        36: 0, 37: 0, 38: 0, 39: 0, 40: 0, 41: 0, 42: 0, 43: 0, 44: 0
                    };
                }
            }
            
            if (typeof rawValue === 'object' && rawValue !== null) {
                const result = {};
                Object.keys(rawValue).forEach(size => {
                    result[size] = parseInt(rawValue[size]) || 0;
                });
                return result;
            }
            
            return {
                36: 0, 37: 0, 38: 0, 39: 0, 40: 0, 41: 0, 42: 0, 43: 0, 44: 0
            };
        },
        set(value) {
            
            let stockToStore = {};
            
            if (typeof value === 'string') {
                try {
                    const parsed = JSON.parse(value);
                    Object.keys(parsed).forEach(size => {
                        stockToStore[size] = parseInt(parsed[size]) || 0;
                    });
                } catch (e) {
                    error('Error al parsear stock en setter:', e);
                    [36, 37, 38, 39, 40, 41, 42, 43, 44].forEach(size => {
                        stockToStore[size] = 0;
                    });
                }
            } else if (typeof value === 'object' && value !== null) {
                Object.keys(value).forEach(size => {
                    stockToStore[size] = parseInt(value[size]) || 0;
                });
            } else {
                [36, 37, 38, 39, 40, 41, 42, 43, 44].forEach(size => {
                    stockToStore[size] = 0;
                });
            }
            
            this.setDataValue('stock', stockToStore);
        }
    },
    imagen: {
        type: DataTypes.STRING,
        allowNull: true
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'categories',
            key: 'category_id'
        }
    }
}, {
    tableName: 'products',
    timestamps: false
});

/**
 * Crear un nuevo producto.
 * @param {Object} product - Datos del producto.
 * @returns {Promise<void>}
 */
const createProduct = async (product) => {
    await Product.create(product);
};

/**
 * Actualizar el stock de un producto por talla
 * @param {number} productId - ID del producto
 * @param {number} size - Talla
 * @param {number} quantity - Cantidad a actualizar (positiva para sumar, negativa para restar)
 * @returns {Promise<boolean>} - true si se actualizó correctamente
 */
const updateStockBySize = async (productId, size, quantity) => {
    try {
        const product = await Product.findByPk(productId);
        if (!product) return false;

        const currentStock = product.stock;
        if (currentStock[size] + quantity < 0) return false;

        currentStock[size] += quantity;
        await product.update({ stock: currentStock });
        return true;
    } catch (error) {
        error('Error al actualizar stock:', error);
        return false;
    }
};

/**
 * Verificar disponibilidad de stock por talla
 * @param {number} productId - ID del producto
 * @param {number} size - Talla
 * @param {number} quantity - Cantidad requerida
 * @returns {Promise<boolean>} - true si hay stock suficiente
 */
const checkStockAvailability = async (productId, size, quantity) => {
    try {
        const product = await Product.findByPk(productId);
        if (!product) return false;

        const currentStock = product.stock;
        return currentStock[size] >= quantity;
    } catch (error) {
        error('Error al verificar stock:', error);
        return false;
    }
};

export { Product, createProduct, updateStockBySize, checkStockAvailability };
