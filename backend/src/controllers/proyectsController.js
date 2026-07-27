import proyectsModel from "../models/proyectsModel.js";
import servicesModel from "../models/servicesModel.js";
import empleadoModel from "../models/empleadoModel.js";

const MAX_CITAS_POR_EMPLEADO_Y_DIA = 3;
const DIAS_MAXIMOS_DE_BUSQUEDA = 30;

const startOfUtcDay = (date) => new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
));

const isWeekend = (date) => {
    const day = date.getUTCDay();
    return day === 0 || day === 6;
};

const getEmployeeName = (employee) => {
    if (!employee) return "";
    return [employee.nombre || employee.name, employee.apellido || employee.lastName]
        .filter(Boolean)
        .join(" ");
};

const validateWeekday = (value) => {
    if (!value) return true;
    const date = new Date(value);
    return !Number.isNaN(date.getTime()) && !isWeekend(date);
};

const proyectsController = {};

proyectsController.getProyects = async (req, res) => {
    try {
        const proyects = await proyectsModel.find()
            .populate("idService", "nameService")
            .populate("idCustomer", "nombre")
            .populate("idEmpleado", "nombre apellido name lastName");
        return res.json(proyects);
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "internal server error" });
    }
};

proyectsController.insertProyects = async (req, res) => {
    try {
        const {
            idService,
            idCustomer,
            clientPhone,
            clientDirection,
            clientLocation,
            finalPrice,
            description
        } = req.body;

        const service = await servicesModel.findById(idService);
        if (!service || service.status !== true) {
            return res.status(400).json({ message: "No se puede generar una cita con un servicio inactivo o inexistente." });
        }

        const pendingAppointments = await proyectsModel.countDocuments({
            idCustomer,
            status: /^pendiente$/i
        });
        if (pendingAppointments >= 3) {
            return res.status(400).json({ message: "No puedes tener más de 3 citas pendientes." });
        }

        // Un empleado elegible debe estar activo y prestar el servicio solicitado.
        const eligibleEmployees = await empleadoModel.find({
            status: true,
            services: idService
        });
        if (eligibleEmployees.length === 0) {
            return res.status(503).json({ message: "No hay empleados activos disponibles para este servicio." });
        }

        let assignedEmployee = null;
        let assignedDate = null;
        const candidateDate = startOfUtcDay(new Date());
        candidateDate.setUTCDate(candidateDate.getUTCDate() + 1);

        for (let daysChecked = 0; daysChecked < DIAS_MAXIMOS_DE_BUSQUEDA; daysChecked += 1) {
            if (!isWeekend(candidateDate)) {
                const nextDay = new Date(candidateDate);
                nextDay.setUTCDate(nextDay.getUTCDate() + 1);

                for (const employee of eligibleEmployees) {
                    const appointmentCount = await proyectsModel.countDocuments({
                        idEmpleado: employee._id,
                        dateStart: { $gte: candidateDate, $lt: nextDay },
                        status: { $not: /^cancelado$/i }
                    });

                    if (appointmentCount < MAX_CITAS_POR_EMPLEADO_Y_DIA) {
                        assignedEmployee = employee;
                        // Mediodía UTC evita que la interfaz muestre el día anterior en América.
                        assignedDate = new Date(Date.UTC(
                            candidateDate.getUTCFullYear(),
                            candidateDate.getUTCMonth(),
                            candidateDate.getUTCDate(),
                            12
                        ));
                        break;
                    }
                }
            }

            if (assignedEmployee) break;
            candidateDate.setUTCDate(candidateDate.getUTCDate() + 1);
        }

        if (!assignedEmployee || !assignedDate) {
            return res.status(503).json({ message: "No hay disponibilidad en los próximos 30 días." });
        }

        const newProyect = new proyectsModel({
            idService,
            idCustomer,
            idEmpleado: assignedEmployee._id,
            dateStart: assignedDate,
            dateEnd: assignedDate,
            clientPhone,
            clientDirection,
            clientLocation,
            finalPrice,
            status: "Pendiente",
            description
        });
        await newProyect.save();

        return res.status(201).json({
            message: "Cita creada y asignada correctamente.",
            assignedDate,
            employeeName: getEmployeeName(assignedEmployee),
            data: newProyect
        });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "internal server error" });
    }
};

proyectsController.deleteProyects = async (req, res) => {
    try {
        await proyectsModel.findByIdAndDelete(req.params.id);
        return res.json({});
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "internal server error" });
    }
};

proyectsController.updateProyects = async (req, res) => {
    try {
        const {
            idService,
            idCustomer,
            idEmpleado,
            dateStart,
            dateEnd,
            clientPhone,
            clientDirection,
            clientLocation,
            finalPrice,
            status,
            description
        } = req.body;

        const service = await servicesModel.findById(idService);
        if (!service || service.status !== true) {
            return res.status(400).json({ message: "No se puede actualizar una cita con un servicio inactivo o inexistente." });
        }

        if (!validateWeekday(dateStart) || !validateWeekday(dateEnd)) {
            return res.status(400).json({ message: "No se pueden programar citas en sábado o domingo." });
        }

        if (idEmpleado) {
            const employee = await empleadoModel.findOne({
                _id: idEmpleado,
                status: true,
                services: idService
            });
            if (!employee) {
                return res.status(400).json({ message: "El empleado debe estar activo y prestar el servicio seleccionado." });
            }
        }

        const updatedProyect = await proyectsModel.findByIdAndUpdate(
            req.params.id,
            {
                idService,
                idCustomer,
                ...(idEmpleado && { idEmpleado }),
                dateStart,
                dateEnd,
                clientPhone,
                clientDirection,
                clientLocation,
                finalPrice,
                status,
                description
            },
            { new: true, runValidators: true }
        ).populate("idEmpleado", "nombre apellido name lastName");

        if (!updatedProyect) {
            return res.status(404).json({ message: "Cita no encontrada." });
        }
        return res.json({ message: "Proyect Updated", data: updatedProyect });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "internal server error" });
    }
};

proyectsController.searchByDate = async (req, res) => {
    try {
        const { date } = req.body;
        const selectDate = new Date(date);

        const proyects = await proyectsModel.find({
            dateStart: { $lte: selectDate },
            dateEnd: { $gte: selectDate }
        })
            .populate("idService", "nameService")
            .populate("idCustomer", "nombre")
            .populate("idEmpleado", "nombre apellido name lastName");
        if (proyects.length === 0) {
            return res.status(404).json({ message: "no hay citas para esta fecha" });
        }

        return res.status(200).json(proyects);
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export default proyectsController;
