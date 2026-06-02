import servicesModel from "../models/servicesModel.js"
import { v2 as cloudinary } from "cloudinary";

const servicesController = {}

//Select All Services
servicesController.getServices = async (req, res) => {
    try {
        const services = await servicesModel.find();
        return res.status(200).json(services);
    } catch (error) {
        console.log(`Error al obtener los servicios: ${error}`);
        return res.status(500).json({ message: "Error al obtener los servicios" });
    }
}

//Insert Services
servicesController.createServices = async (req, res) => {

    try {
        const { nameService, imgUrl, description, price } = req.body;

        const newService = new servicesModel({
            nameService,
            imgUrl: req.file.path,
            public_id: req.file.filename,
            description,
            price
        })

        await newService.save();

        return res.status(201).json({ message: "Servicio creado correctamente" });

    } catch (error) {
        console.log(`Error al insertar el servicio: ${error}`);
        return res.status(500).json({ message: "Error al insertar el servicio" });
    }
}

//Update Services
servicesController.updateServices = async (req, res) => {

    try {
        const { nameService, description, price } = req.body;
        const serviceFound = await servicesModel.findById(req.params.id);

        if (!serviceFound) {
            return res.status(404).json({ message: "Servicio no encontrado" });
        }

        const updateData = {
            nameService,
            description,
            price
        }

        if (req.file) {
            await cloudinary.uploader.destroy(serviceFound.public_id);
            updateData.imgUrl = req.file.path;
            updateData.public_id = req.file.filename;
        }

        await servicesModel.findByIdAndUpdate(req.params.id, updateData, { new: true });

        return res.status(200).json({ message: "Servicio actualizado correctamente" })

    } catch (error) {
        console.log(`Error al actualizar el servicio: ${error}`);
        return res.status(500).json({ message: "Error al actualizar el servicio" });
    }

}

//Delete Services
servicesController.deleteServices = async (req, res) => {

    try {
        const serviceFound = await servicesModel.findById(req.params.id);

        if (!serviceFound) {
            return res.status(404).json({ message: "Servicio no encontrado" });
        }

        await cloudinary.uploader.destroy(serviceFound.public_id);
        await servicesModel.findByIdAndDelete(req.params.id);

        return res.status(200).json({ message: "Servicio eliminado correctamente" })

    } catch (error) {
        console.log(`Error al eliminar el servicio: ${error}`);
        return res.status(500).json({ message: "Error al eliminar el servicio" });
    }

}



export default servicesController;
