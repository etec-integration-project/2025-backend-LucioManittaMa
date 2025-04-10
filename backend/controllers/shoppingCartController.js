import { ShoppingCart, CartItem, Product } from '../models/index.js';

/**
 * @desc Obtiene el carrito de compras del usuario
 * @route GET /api/cart
 * @access Private
 */
// Modificación del método getCart para incluir el total
export const getCart = async (req, res) => {
    try {
        const cart = await ShoppingCart.findOne({
            where: { user_id: req.user.userId },
            include: {
                model: CartItem,
                as: 'items',
                include: {
                    model: Product,
                    as: 'product',
                },
            },
        });

        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        // Calcular el total
        const total = cart.items.reduce((acc, item) => {
            return acc + item.cantidad * item.product.precio; // Asumiendo que `precio` es el campo en `Product`
        }, 0);

        res.json({ ...cart.toJSON(), total });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener carrito', error: error.message || error });
    }
};


/**
 * @desc Agrega o actualiza un producto en el carrito
 * @route PUT /api/cart
 * @access Private
 */
export const addToCart = async (req, res) => {
    const { product_id, cantidad } = req.body;

    try {
        // Encontrar o crear el carrito del usuario
        let cart = await ShoppingCart.findOne({ where: { user_id: req.user.userId } });
        if (!cart) {
            cart = await ShoppingCart.create({ user_id: req.user.userId });
        }

        // Verificar que el producto existe
        const product = await Product.findByPk(product_id);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Buscar o crear el item en el carrito
        const [cartItem, created] = await CartItem.findOrCreate({
            where: { cart_id: cart.cart_id, product_id },
            defaults: { cantidad },
        });

        if (!created) {
            // Si el item ya existe, actualizar la cantidad
            cartItem.cantidad = cartItem.cantidad + cantidad;
            await cartItem.save();
        }

        res.status(201).json(cartItem);
    } catch (error) {
        res.status(500).json({ message: 'Error al agregar o actualizar el producto en el carrito', error: error.message || error });
    }
};

/**
 * @desc Actualiza la cantidad y el ID del producto en el carrito
 * @route PUT /api/cart/:id
 * @access Private
 */
export const updateCartItem = async (req, res) => {
    const { product_id, cantidad } = req.body;
    const cartItemId = req.params.id;

    try {
        // Buscar el producto en el carrito del usuario
        const cartItem = await CartItem.findOne({
            where: {
                id: cartItemId,
            },
            include: {
                model: ShoppingCart,
                where: { user_id: req.user.userId },
            },
        });

        if (!cartItem) {
            return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
        }

        // Actualizar el `product_id` y `cantidad`
        cartItem.product_id = product_id;
        cartItem.cantidad = cantidad;
        await cartItem.save();

        res.json(cartItem);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el producto en el carrito', error: error.message || error });
    }
};


/**
 * @desc Elimina un producto del carrito
 * @route DELETE /api/cart/:id
 * @access Private
 */
export const removeFromCart = async (req, res) => {
    try {
        // Encontrar el carrito del usuario
        const cart = await ShoppingCart.findOne({ where: { user_id: req.user.userId } });
        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        // Buscar el producto en el carrito
        const cartItem = await CartItem.findOne({
            where: {
                id: req.params.id,
                cart_id: cart.cart_id,  // Usar `cart.cart_id` para evitar posibles problemas
            },
        });

        if (!cartItem) {
            return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
        }

        await cartItem.destroy();
        res.json({ message: 'Producto eliminado del carrito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar producto del carrito', error: error.message || error });
    }
};
