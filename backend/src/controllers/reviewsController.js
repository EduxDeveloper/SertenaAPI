import reviewsModel from '../models/reviewsModel.js';
import proyectsModel from '../models/proyectsModel.js';

const reviewsController = {};

reviewsController.getReviews = async (req, res) => {
    try {
        const reviews = await reviewsModel
            .find()
            .populate('idCustomer', 'nombre')
            .populate('idService', 'nameService');

        return res.json(reviews);
    } catch (error) {
        console.log('Error getting reviews:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

reviewsController.getReviewsPaginated = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(
            Math.max(parseInt(req.query.limit, 10) || 4, 1),
            50
        );

        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
            reviewsModel
                .find()
                .populate('idCustomer', 'nombre')
                .populate('idService', 'nameService')
                .skip(skip)
                .limit(limit),

            reviewsModel.countDocuments()
        ]);

        return res.status(200).json({
            data: reviews,
            total,
            page,
            totalPages: Math.max(Math.ceil(total / limit), 1)
        });
    } catch (error) {
        console.log('Error getting paginated reviews:', error);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

/**
 * Obtener las reseñas de un cliente.
 */
reviewsController.getCustomerReviews = async (req, res) => {
    try {
        const { idCustomer } = req.params;

        if (String(idCustomer) !== String(req.userId)) {
            return res.status(403).json({ message: "No autorizado para consultar estas reseñas." });
        }

        const reviews = await reviewsModel
            .find({ idCustomer })
            .populate('idService', 'nameService price description')
            .sort({ createdAt: -1 });

        return res.json(reviews);
    } catch (error) {
        console.log('Error getting customer reviews:', error);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

/**
 * Crear una reseña.
 *
 * Requisitos:
 * - El cliente debe existir en una cita.
 * - La cita debe estar Finalizada.
 * - La cita debe corresponder al servicio.
 * - El cliente no debe haber reseñado anteriormente ese servicio.
 */
reviewsController.insertReviews = async (req, res) => {
    try {
        const {
            idCustomer,
            idService,
            rating,
            comment
        } = req.body;

        if (!idCustomer || !idService) {
            return res.status(400).json({
                message: 'El cliente y el servicio son obligatorios.'
            });
        }

        if (String(idCustomer) !== String(req.userId)) {
            return res.status(403).json({ message: "No autorizado para crear una reseña para otro cliente." });
        }

        const numericRating = Number(rating);

        if (
            !Number.isInteger(numericRating) ||
            numericRating < 1 ||
            numericRating > 5
        ) {
            return res.status(400).json({
                message: 'La valoración debe estar entre 1 y 5.'
            });
        }

        const existingReview = await reviewsModel.findOne({
            idCustomer,
            idService
        });

        if (existingReview) {
            return res.status(409).json({
                message: 'Ya has realizado una reseña para este servicio.'
            });
        }

        const completedAppointment = await proyectsModel.findOne({
            idCustomer,
            idService,
            status: 'Finalizado'
        });

        if (!completedAppointment) {
            return res.status(403).json({
                message: 'Solo puedes reseñar servicios que hayas recibido.'
            });
        }

        const newReview = await reviewsModel.create({
            idCustomer,
            idService,
            rating: numericRating,
            comment: String(comment || '').trim()
        });

        return res.status(201).json({
            message: 'Review saved',
            data: newReview
        });
    } catch (error) {
        console.log('Error creating review:', error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: 'Ya has realizado una reseña para este servicio.'
            });
        }

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

reviewsController.deleteReviews = async (req, res) => {
    try {
        const review = await reviewsModel.findByIdAndDelete(req.params.id);

        if (!review) {
            return res.status(404).json({
                message: 'Review not found'
            });
        }

        return res.json({});
    } catch (error) {
        console.log('Error deleting review:', error);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

reviewsController.updateReviews = async (req, res) => {
    try {
        const {
            idCustomer,
            idService,
            rating,
            comment
        } = req.body;

        const numericRating = Number(rating);

        if (
            !Number.isInteger(numericRating) ||
            numericRating < 1 ||
            numericRating > 5
        ) {
            return res.status(400).json({
                message: 'La valoración debe estar entre 1 y 5.'
            });
        }

        const updatedReview = await reviewsModel.findByIdAndUpdate(
            req.params.id,
            {
                idCustomer,
                idService,
                rating: numericRating,
                comment: String(comment || '').trim()
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedReview) {
            return res.status(404).json({
                message: 'Review not found'
            });
        }

        return res.json({
            message: 'Review Updated',
            data: updatedReview
        });
    } catch (error) {
        console.log('Error updating review:', error);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

export default reviewsController;
