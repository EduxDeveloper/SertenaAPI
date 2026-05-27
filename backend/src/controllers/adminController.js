import adminModel from "../models/adminModel.js"

const adminController = {};

//SELECT
adminController.getAdmin = async (req, res) => {
    try {
        const admins = await adminModel.find();
        return res.status(200).json(admins);
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

//UPDATE
adminController.updateAdmin = async (req, res) => {
    try {
        //#1- Solicitar los nuevos datos
        let { name, lastName, email, password, status } = req.body;
        //VALIDACIONES
        //Sanitizar
        name = name?.trim();
        email = email?.trim();

        //validar campos required
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Fields required" });
        }

        //Logintud de carácteres
        if (name.length < 3 || name.length > 15) {
            return res.status(400).json({ message: "Please insert a valid name" });
        }

        //Actualizamos en la base de datos
        const adminUpdated = await adminModel.findByIdAndUpdate(
            req.params.id,
            {
                name,
                lastName,
                email,
                password,
                status,
            },
            { new: true },
        );

        if (!adminUpdated) {
            return res.status(404).json({ message: "Admin not found" });
        }

        return res.status(200).json({ message: "Admin updated" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ELIMINAR
adminController.deleteAdmin = async (req, res) => {
    try {
        const deletedAdmin = adminModel.findByIdAndDelete(req.params.id);

        if (!deletedAdmin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        return res.status(200).json({ message: "Admin deleted" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export default adminController;