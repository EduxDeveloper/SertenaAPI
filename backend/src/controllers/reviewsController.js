import reviesModel from '../models/reviewsModel.js';

const reviewsController = {};

reviewsController.getReviews = async (req, res) => {
    try{
    const reviews = await reviesModel.find();
    res.json(reviews);
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