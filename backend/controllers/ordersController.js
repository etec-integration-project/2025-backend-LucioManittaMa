import { Order, OrderDetail, Product, updateStockBySize } from '../models/index.js';

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

        // Verificar stock antes de procesar la orden
        for (const item of items) {
            const { product_id, cantidad, talla } = item;
            const product = await Product.findByPk(product_id);
            
            if (!product) {
                return res.status(404).json({ 
                    message: `Producto con ID ${product_id} no encontrado`
                });
            }

            // Verificar si hay suficiente stock para la talla seleccionada
            if (typeof product.stock === 'object') {
                if (!product.stock[talla] || product.stock[talla] < cantidad) {
                    return res.status(400).json({
                        message: `No hay suficiente stock para el producto ${product.nombre} en talla ${talla}`
                    });
                }
            } else {
                return res.status(400).json({
                    message: `El formato de stock para el producto ${product.nombre} no es válido`
                });
            }
        }

        // Calcular el total basado en los detalles de la orden
        const orderItems = await Promise.all(items.map(async (item) => {
            const { product_id, cantidad, talla } = item;
            const product = await Product.findByPk(product_id);
            const itemTotal = product.precio * cantidad;
            total += itemTotal;

            // Retornar el objeto de OrderDetail
            return {
                order_id: null, // Este será actualizado una vez que la orden sea creada
                product_id,
                cantidad,
                precio: product.precio,
                talla
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
            item.order_id = order.order_id;
            await OrderDetail.create(item);

            // Reducir el stock del producto por talla
            await updateStockBySize(item.product_id, item.talla, -item.cantidad);
        }));

        res.status(201).json({ order, items: orderItems });
    } catch (error) {
        console.error('Error al crear orden:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Obtiene todas las órdenes
 * @route GET /api/orders
 * @access Private/Admin
 */
export const getAllOrders = async (req, res) => {
    try {
        if (req.user.rol !== 'admin') {
            return res.status(403).json({ message: 'No autorizado' });
        }

        const orders = await Order.findAll({
            include: [
                {
                    association: 'items',
                    include: [{ model: Product, as: 'product' }]
                }
            ],
            order: [['fecha', 'DESC']]
        });

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error al obtener órdenes:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Obtiene las órdenes del usuario autenticado
 * @route GET /api/orders/me
 * @access Private
 */
export const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.userId;
        const orders = await Order.findAll({
            where: { user_id: userId },
            include: [
                {
                    association: 'items',
                    include: [{ model: Product, as: 'product' }]
                }
            ],
            order: [['fecha', 'DESC']]
        });

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error al obtener órdenes del usuario:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Actualiza el estado de una orden
 * @route PATCH /api/orders/:id
 * @access Private/Admin
 */
export const updateOrderStatus = async (req, res) => {
    try {
        if (req.user.rol !== 'admin') {
            return res.status(403).json({ message: 'No autorizado' });
        }

        const { id } = req.params;
        const { estado } = req.body;

        const order = await Order.findByPk(id);
        if (!order) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }

        await order.update({ estado });
        res.status(200).json({ message: 'Estado de orden actualizado', order });
    } catch (error) {
        console.error('Error al actualizar estado de orden:', error);
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
 * @desc Obtiene una orden por su ID
 * @route GET /api/orders/:id
 * @access Private
 */
export const getOrderById = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.userId;
        
        const order = await Order.findByPk(orderId, {
            include: [
                {
                    association: 'items',
                    include: [{ model: Product, as: 'product' }]
                }
            ]
        });
        
        if (!order) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }
        
        // Verificar si el usuario es admin o el dueño de la orden
        if (req.user.rol !== 'admin' && order.user_id !== userId) {
            return res.status(403).json({ 
                message: 'No tienes permisos para ver esta orden' 
            });
        }
        
        res.status(200).json(order);
    } catch (error) {
        console.error('Error al obtener la orden:', error);
        res.status(500).json({ message: error.message });
    }
};
