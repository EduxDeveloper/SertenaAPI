import proyectsModel from "../models/proyectsModel.js";

const proyectsController = {}

proyectsController.getProyects = async (req, res) => {
    const proyects = await proyectsModel.find();
    res.json(proyects);
};

proyectsController.insertProyects = async (req, res) => {
    const {idService,idCustomer,dateStart,dateEnd,clientPhone,clientDirection,clientLocation,finalPrice,status,descritption} = req.body;
    const newProyect = new proyectsModel({idService,idCustomer,dateStart,dateEnd,clientPhone,clientDirection,clientLocation,finalPrice,status,descritption});
    await newProyect.save();
    res.json({message: "Proyect saved"})
};

proyectsController.deleteProyects = async (req, res) => {
    await proyectsModel.findByIdAndDelete(req.params.id);
    res.json({})
};

proyectsController.updateProyects = async (req, res) => {
    const {idService,idCustomer,dateStart,dateEnd,clientPhone,clientDirection,clientLocation,finalPrice,status,descritption} = req.body;

    await proyectsModel.findByIdAndUpdate(
        req.params.id,
        {
            idService,idCustomer,dateStart,dateEnd,clientPhone,clientDirection,clientLocation,finalPrice,status,descritption
        },
        {new: true},
    );

    res.json({message: "Proyect Updated"});
};

proyectsController.searchByName = async (req, res) => {
  try {
    
    //#1- Solicito los datos
    const {name} = req.body

    const proyects = await proyectsModel.find({
      name: { $regex: name, $options: "i" }
    })

    if(!proyects){
      return res.status(404).json({message: "Proyects not found with this name"})
    }

    return res.status(200).json(proyects)
  } catch (error) {
    console.log("error"+error)
    return res.status(500).json({message: "Internal server error"})
  }
}

export default proyectsController;