import { Review, Product, User } from '../models/index.js';

/**
 * @desc Crea una nueva reseña para un producto
 * @route POST /api/reviews
 * @access Private
 */
export const createReview = async (req, res) => {
    const { product_id, comentario, calificación } = req.body;

    try {
        const product = await Product.findByPk(product_id);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        const review = await Review.create({
            user_id: req.user.userId,
            product_id,
            comentario,
            calificación,
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Obtiene todas las reseñas de un producto
 * @route GET /api/reviews/:product_id
 * @access Public
 */
export const getReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            where: { product_id: req.params.product_id },
            include: {
                model: User,
                as: 'user',
                attributes: ['nombre', 'rol'],
            },
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Actualiza una reseña existente
 * @route PUT /api/reviews/:id
 * @access Private
 */
export const updateReview = async (req, res) => {
    const { comentario, calificación } = req.body;

    try {
        const review = await Review.findByPk(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Reseña no encontrada' });
        }

        if (review.user_id !== req.user.userId) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        review.comentario = comentario || review.comentario;
        review.calificación = calificación || review.calificación;

        await review.save();

        res.json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc Elimina una reseña
 * @route DELETE /api/reviews/:id
 * @access Private
 */
export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Reseña no encontrada' });
        }

        if (review.user_id !== req.user.userId && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'No autorizado' });
        }

        await review.destroy();
        res.json({ message: 'Reseña eliminada' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
