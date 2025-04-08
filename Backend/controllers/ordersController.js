import { Order, OrderDetail, Product } from '../models/index.js';

/**
 * @desc Crea un nuevo pedido
 * @route POST /api/orders
 * @access Private
 */

export const createOrder = async (req, res) => {
    const { items, estado } = req.body;
    let total = 0;

    try {
        const userId = req.user ? req.user.userId : null;
        if (!userId) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        // Calcular el total basado en los detalles de la orden
        const orderItems = await Promise.all(items.map(async (item) => {
            const product = await Product.findByPk(item.product_id);
            if (!product) {
                throw new Error(`Producto con ID ${item.product_id} no encontrado`);
            }

            const itemTotal = product.precio * item.cantidad;
            total += itemTotal;

            // Retornar el objeto de OrderDetail con el precio de producto asignado
            return {
                order_id: null, // Este será actualizado una vez que la orden sea creada
                product_id: item.product_id,
                cantidad: item.cantidad,
                precio: product.precio  // Aseguramos que precio tenga un valor válido
            };
        }));

        // Crear la orden con el total calculado
        const order = await Order.create({
            user_id: userId,
            fecha: req.body.fecha || new Date(),
            estado,
            total
        });

        // Asignar el `order_id` a cada detalle y crear los registros en OrderDetail
        await Promise.all(orderItems.map(async (item) => {
            item.order_id = order.order_id; // Ahora se asigna el ID de la orden correctamente
            await OrderDetail.create(item);
        }));

        res.status(201).json({ order, items: orderItems });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Obtiene todos los pedidos de un usuario
 * @route GET /api/orders
 * @access Private
 */
export const getOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { user_id: req.user.userId },
            include: {
                model: OrderDetail,
                as: 'items',
                include: {
                    model: Product,
                    as: 'product',
                },
            },
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Actualiza el estado de un pedido
 * @route PUT /api/orders/:id
 * @access Admin
 */
export const updateOrderStatus = async (req, res) => {
    const { estado } = req.body;

    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        order.estado = estado;
        await order.save();

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Elimina un pedido
 * @route DELETE /api/orders/:id
 * @access Admin
 */
export const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        await order.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Obtiene un pedido por ID
 * @route GET /api/orders/:id
 * @access Private
 */
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: {
                model: OrderDetail,
                as: 'items',
                include: {
                    model: Product,
                    as: 'product',
                },
            },
        });

        if (!order) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
