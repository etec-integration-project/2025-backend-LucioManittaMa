import { Product } from './product.js';
import { CartItem } from './cartItem.js';
import { Category } from './category.js';
import { Order } from './order.js';
import { OrderDetail } from './orderDetail.js';
import { Review } from './review.js';
import { ShoppingCart } from './shoppingCart.js';
import { User } from './users.js';

/**
 * @file index.js
 * @description Archivo que define las asociaciones entre los modelos de la base de datos.
 */

/* Asociación entre Order y OrderDetail */

/**
 * @description Un pedido (Order) puede tener múltiples detalles de pedido (OrderDetail).
 */
Order.hasMany(OrderDetail, { 
    foreignKey: 'order_id', 
    as: 'items' 
});

/**
 * @description Un detalle de pedido (OrderDetail) pertenece a un pedido (Order).
 */
OrderDetail.belongsTo(Order, { 
    foreignKey: 'order_id', 
    as: 'order' 
});

/* Asociación entre OrderDetail y Product */

/**
 * @description Un detalle de pedido (OrderDetail) pertenece a un producto (Product).
 */
OrderDetail.belongsTo(Product, { 
    foreignKey: 'product_id', 
    as: 'product' 
});

/**
 * @description Un producto (Product) puede estar en múltiples detalles de pedido (OrderDetail).
 */
Product.hasMany(OrderDetail, { 
    foreignKey: 'product_id', 
    as: 'orderDetails' 
});

/* Asociación entre ShoppingCart y CartItem */

/**
 * @description Un carrito de compras (ShoppingCart) puede tener múltiples items de carrito (CartItem).
 */
ShoppingCart.hasMany(CartItem, { 
    as: 'items', 
    foreignKey: 'cart_id' 
});

/**
 * @description Un item de carrito (CartItem) pertenece a un carrito de compras (ShoppingCart).
 */
CartItem.belongsTo(ShoppingCart, { 
    foreignKey: 'cart_id' 
});

/* Asociación entre User y ShoppingCart */

/**
 * @description Un usuario (User) tiene un carrito de compras (ShoppingCart).
 */
User.hasOne(ShoppingCart, { 
    foreignKey: 'user_id' 
});

/**
 * @description Un carrito de compras (ShoppingCart) pertenece a un usuario (User).
 */
ShoppingCart.belongsTo(User, { 
    foreignKey: 'user_id' 
});

/* Asociación entre CartItem y Product */

/**
 * @description Un item de carrito (CartItem) pertenece a un producto (Product).
 */
CartItem.belongsTo(Product, { 
    foreignKey: 'product_id', 
    as: 'product' 
});

/**
 * @description Un producto (Product) puede estar en múltiples items de carrito (CartItem).
 */
Product.hasMany(CartItem, { 
    foreignKey: 'product_id' 
});

/* Asociación entre Review y User */

/**
 * @description Un usuario (User) puede tener múltiples reseñas (Review).
 */
User.hasMany(Review, {
    foreignKey: 'user_id',
    as: 'reviews'
});

/**
 * @description Una reseña (Review) pertenece a un usuario (User).
 */
Review.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

/* Asociación entre Review y Product */

/**
 * @description Un producto (Product) puede tener múltiples reseñas (Review).
 */
Product.hasMany(Review, {
    foreignKey: 'product_id',
    as: 'reviews'
});

/**
 * @description Una reseña (Review) pertenece a un producto (Product).
 */
Review.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product'
});

/**
 * @module Models
 * @description Exporta todos los modelos de la base de datos con sus asociaciones.
 */
export {
    Product,
    CartItem,
    Category,
    Order,
    OrderDetail,
    Review,
    ShoppingCart,
    User
};
