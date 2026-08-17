import express from 'express';
import reviewsController from '../controllers/reviewsController.js';
import { verifyToken, verifyAdminToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route('/')
    .get(reviewsController.getReviews)
    .post(verifyToken, reviewsController.insertReviews);

router.get('/paginado', reviewsController.getReviewsPaginated);

router.get(
    '/customer/:idCustomer',
    verifyToken,
    reviewsController.getCustomerReviews
);

router.route('/:id')
    .delete(verifyAdminToken, reviewsController.deleteReviews)
    .put(verifyAdminToken, reviewsController.updateReviews);

export default router;