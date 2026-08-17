import express from 'express';
import reviewsController from '../controllers/reviewsController.js';

const router = express.Router();

router.route('/')
    .get(reviewsController.getReviews)
    .post(reviewsController.insertReviews);

router.get('/paginado', reviewsController.getReviewsPaginated);

router.get(
    '/customer/:idCustomer',
    reviewsController.getCustomerReviews
);

router.route('/:id')
    .delete(reviewsController.deleteReviews)
    .put(reviewsController.updateReviews);

export default router;