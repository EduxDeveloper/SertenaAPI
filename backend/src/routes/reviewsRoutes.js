import express from 'express';
import reviewsController from '../controllers/reviewsController.js';
import { validateAuthCookie } from "../middlewares/authMiddleware.js";

const router = express.Router();
const requireClient = validateAuthCookie("authClienteCookie", ["client"]);
const requireAdmin = validateAuthCookie("authAdminCookie", ["admin"]);

router.route('/')
    .get(reviewsController.getReviews)
    .post(requireClient, reviewsController.insertReviews);

router.get('/paginado', reviewsController.getReviewsPaginated);

router.get(
    '/customer/:idCustomer',
    requireClient,
    reviewsController.getCustomerReviews
);

router.route('/:id')
    .delete(requireAdmin, reviewsController.deleteReviews)
    .put(requireAdmin, reviewsController.updateReviews);

export default router;
