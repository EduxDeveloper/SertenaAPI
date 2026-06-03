import ProyectsModel from "../models/Proyects.js";

const proyectsController = {}

proyectsController.getProyects = async (res, req) => {
    const proyects = await ProyectsModel.find();
    res.json(proyects);
};

proyectsController.InsertProyects = async (req, res) => {
    const {idService,idCustomer,dateStart,dateEnd,clientPhone,clientDirection,clientLocation,finalPrice,status,descritption} = req.body;
    const newProyect = new ProyectsModel({idService,idCustomer,dateStart,dateEnd,clientPhone,clientDirection,clientLocation,finalPrice,status,descritption});
    await newPizza.save();
    res.json({message: "Proyect saved"})
};

proyectsController.deleteProyects = async (req, res) => {
    await ProyectsModel.findbyIdAndDelete(req.params.id);
    res.json({})
};

proyectsController.updatProyects = async (res,res) => {
    const {idService,idCustomer,dateStart,dateEnd,clientPhone,clientDirection,clientLocation,finalPrice,status,descritption} = req.body;

    await ProyectsModel.findbyIdAndUpdate(
        req.params.id,
        {
            idService,idCustomer,dateStart,dateEnd,clientPhone,clientDirection,clientLocation,finalPrice,status,descritption
        },
        {new: true},
    );

    res.json({message: "Proyect Updated"});
};

pizzasController.searchByName = async (req, res) => {
  try {
    
    //#1- Solicito los datos
    const {name} = req.body

    const pizzas = await pizzasModel.find({
      name: { $regex: name, $options: "i" }
    })

    if(!pizzas){
      return res.status(404).json({message: "Pizzas not found with this name"})
    }

    return res.status(200).json(pizzas)
  } catch (error) {
    console.log("error"+error)
    return res.status(500).json({message: "Internal server error"})
  }
}

export default proyectsController;