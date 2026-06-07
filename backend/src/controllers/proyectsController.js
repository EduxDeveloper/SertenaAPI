import proyectsModel from "../models/proyectsModel.js";

const proyectsController = {}

proyectsController.getProyects = async (req, res) => {
    const proyects = await proyectsModel.find();
    res.json(proyects);
};

proyectsController.insertProyects = async (req, res) => {
  try {
    const {idService,idCustomer,dateStart,dateEnd,clientPhone,clientDirection,clientLocation,finalPrice,status,description} = req.body;
    const newProyect = new proyectsModel({idService,idCustomer,dateStart,dateEnd,clientPhone,clientDirection,clientLocation,finalPrice,status,description});
    await newProyect.save();
    res.json({message: "Proyect saved"})
  } catch (error) {
    console.log("error"+error)
    res.status(500).json({message: "internal server error"});
  }
};

proyectsController.deleteProyects = async (req, res) => {
    try {
    await proyectsModel.findByIdAndDelete(req.params.id);
    res.json({})
} catch (error) {
    console.log("error"+error)
    res.status(500).json({message: "internal server error"});
};
};

proyectsController.updateProyects = async (req, res) => {
    try {
    const {idService,idCustomer,dateStart,dateEnd,clientPhone,clientDirection,clientLocation,finalPrice,status,description} = req.body;

    await proyectsModel.findByIdAndUpdate(
        req.params.id,
        {
            idService,idCustomer,dateStart,dateEnd,clientPhone,clientDirection,clientLocation,finalPrice,status,description
        },
        {new: true},
    );

    res.json({message: "Proyect Updated"});
} catch (error) {
    console.log("error"+error)
    res.status(500).json({message: "internal server error"});
};
};

proyectsController.searchByDate = async (req, res) => {
  try {
    
    //Solicito los datos
    const {date} = req.body;
    //lo convierto en un objeto tipo Date
    const selectDate = new Date(date);

    //Buscar la cita por fecha cuando la cita dura varios dias 
    const proyects = await proyectsModel.find({
      //verifica que dateStart sea menor o igual a la fecha seleccionada
      dateStart: { $lte: selectDate},
      //dateEnd sea mayor o igual a la fecha seleccionada
      dateEnd: { $gte: selectDate}
    })
    // Si no se encontraron citas para la fexha seleccionada
    if(proyects.length === 0){
      return res.status(404).json({message: "no hay citas para esta fecha"});
    }
    
    return res.status(200).json(proyects)
  } catch (error) {
    console.log("error"+error)
    return res.status(500).json({message: "Internal server error"})
  }
};

export default proyectsController;