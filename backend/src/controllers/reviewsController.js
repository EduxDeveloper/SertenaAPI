import reviesModel from '../models/reviewsModel.js';

const reviewsController = {};

reviewsController.getReviews = async (req, res) => {
    try{
    const reviews = await reviesModel.find().populate("idCustomer", "nombre");
    res.json(reviews);
} catch (error) {
    console.log("error"+error)
    res.status(500).json({message: "internal server error"});
}
};

reviewsController.getReviewsPaginated = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 4;
        const skip = (page - 1) * limit;

        const reviews = await reviesModel.find()
            .populate("idCustomer", "nombre")
            .skip(skip)
            .limit(limit);
        const total = await reviesModel.countDocuments();

        return res.status(200).json({
            data: reviews,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.log("error"+error)
        res.status(500).json({message: "internal server error"});
    }
};

reviewsController.insertReviews = async (req, res) => {
    try {
    const {idCustomer, idService, rating, comment} = req.body;
    const newReview = new reviesModel({idCustomer, idService, rating, comment});
    await newReview.save();
    res.json({message: "Review saved"})
} catch (error) {
    console.log("error"+error)
    res.status(500).json({message: "internal server error"});
}
}

reviewsController.deleteReviews = async (req, res) => {
    try {
    await reviesModel.findByIdAndDelete(req.params.id);
    res.json({})
} catch (error) {
    console.log("error"+error)
    res.status(500).json({message: "internal server error"});
}
};

reviewsController.updateReviews = async (req, res) => {
    try {
    const {idCustomer, idService, rating, comment} = req.body;
    await reviesModel.findByIdAndUpdate(
        req.params.id,
        {idCustomer, idService, rating, comment},
        {new: true},
    );
    res.json({message: "Review Updated"});
} catch (error) {
    console.log("error"+error)
    res.status(500).json({message: "internal server error"});
};
};

export default reviewsController;
