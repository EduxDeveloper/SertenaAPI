import proyectsModel from "../models/proyectsModel.js";
import servicesModel from "../models/servicesModel.js";
import empleadoModel from "../models/empleadoModel.js";

const MAX_CITAS_POR_EMPLEADO_Y_DIA = 3;
const DIAS_MAXIMOS_DE_BUSQUEDA = 30;
const APPOINTMENT_STATUSES = ["Programado", "Finalizado", "Atrasado"];

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

const normalizeCoordinates = (coordinates) => {
    if (!coordinates || coordinates.latitude === undefined || coordinates.longitude === undefined) return null;

    const latitude = Number(coordinates.latitude);
    const longitude = Number(coordinates.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return undefined;
    }

    return { latitude, longitude };
};

const isSafeMapUrl = (value) => {
    if (!value) return true;
    try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:";
    } catch {
        return false;
    }
};

const isSameUtcDay = (firstValue, secondValue) => {
    const firstDate = new Date(firstValue);
    const secondDate = new Date(secondValue);
    if (Number.isNaN(firstDate.getTime()) || Number.isNaN(secondDate.getTime())) return false;

    return firstDate.getUTCFullYear() === secondDate.getUTCFullYear()
        && firstDate.getUTCMonth() === secondDate.getUTCMonth()
        && firstDate.getUTCDate() === secondDate.getUTCDate();
};

const normalizeAppointmentStatuses = async () => {
    const today = startOfUtcDay(new Date());

    await proyectsModel.updateMany(
        { status: "Pendiente" },
        { $set: { status: "Programado" } }
    );
    await proyectsModel.updateMany(
        { status: "Programado", dateEnd: { $lt: today } },
        { $set: { status: "Atrasado" } }
    );
};

const parseFinalPrice = (value) => {
    const parsed = parseFloat(String(value ?? "0").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeStatus = (status) => (status === "Pendiente" ? "Programado" : status || "Programado");

const STATUS_SORT_ORDER = { Atrasado: 0, Programado: 1, Finalizado: 2 };

const sortAppointments = (appointments) => [...appointments].sort((first, second) => {
    const firstOrder = STATUS_SORT_ORDER[normalizeStatus(first.status)] ?? 3;
    const secondOrder = STATUS_SORT_ORDER[normalizeStatus(second.status)] ?? 3;
    if (firstOrder !== secondOrder) return firstOrder - secondOrder;

    const firstDate = new Date(first.dateStart || 0).getTime();
    const secondDate = new Date(second.dateStart || 0).getTime();
    if (firstDate !== secondDate) return firstDate - secondDate;

    return new Date(second.createdAt || 0).getTime() - new Date(first.createdAt || 0).getTime();
});

const buildAppointmentSummary = (appointments) => {
    const summary = {
        activas: 0,
        programadas: 0,
        atrasadas: 0,
        finalizadas: 0,
        ingresosProyectados: 0,
    };

    appointments.forEach((appointment) => {
        const status = normalizeStatus(appointment.status);
        const price = parseFinalPrice(appointment.finalPrice);

        if (status === "Finalizado") {
            summary.finalizadas += 1;
            return;
        }

        summary.activas += 1;
        summary.ingresosProyectados += price;

        if (status === "Programado") summary.programadas += 1;
        if (status === "Atrasado") summary.atrasadas += 1;
    });

    return summary;
};

const buildStatusFilter = (statusParam) => {
    if (!statusParam || statusParam === "Todas") return {};
    if (!APPOINTMENT_STATUSES.includes(statusParam)) return {};
    return { status: statusParam };
};

const populateAppointmentQuery = (query) => query
    .populate("idService", "nameService")
    .populate("idCustomer", "nombre")
    .populate("idEmpleado", "nombre apellido name lastName");

const proyectsController = {};

proyectsController.getProyects = async (req, res) => {
    try {
        await normalizeAppointmentStatuses();
        const proyects = await populateAppointmentQuery(proyectsModel.find()).lean();
        return res.json(sortAppointments(proyects));
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "internal server error" });
    }
};

proyectsController.getProyectsPaginated = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
        const skip = (page - 1) * limit;
        const statusFilter = buildStatusFilter(req.query.status);

        await normalizeAppointmentStatuses();

        const [allAppointments, filteredAppointments] = await Promise.all([
            proyectsModel.find().select("status finalPrice dateStart createdAt").lean(),
            populateAppointmentQuery(proyectsModel.find(statusFilter)).lean(),
        ]);

        const summary = buildAppointmentSummary(allAppointments);
        const sortedAppointments = sortAppointments(filteredAppointments);
        const total = sortedAppointments.length;
        const paginatedAppointments = sortedAppointments.slice(skip, skip + limit);

        return res.status(200).json({
            data: paginatedAppointments,
            total,
            page,
            totalPages: Math.max(Math.ceil(total / limit), 1),
            summary,
        });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "internal server error" });
    }
};

proyectsController.getMyProyects = async (req, res) => {
    try {
        await normalizeAppointmentStatuses();
        const proyects = await proyectsModel.find({ idCustomer: req.userId })
            .populate("idService", "nameService")
            .populate("idEmpleado", "nombre apellido name lastName")
            .sort({ dateStart: 1, createdAt: -1 });
        return res.status(200).json(proyects);
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
            clientCoordinates,
            clientMapUrl,
            finalPrice,
            description
        } = req.body;

        if (String(idCustomer) !== String(req.userId)) {
            return res.status(403).json({ message: "No autorizado para crear una cita para otro cliente." });
        }

        const service = await servicesModel.findById(idService);
        if (!service || service.status !== true) {
            return res.status(400).json({ message: "No se puede generar una cita con un servicio inactivo o inexistente." });
        }

        const coordinates = normalizeCoordinates(clientCoordinates);
        if (coordinates === undefined || !isSafeMapUrl(clientMapUrl)) {
            return res.status(400).json({ message: "La ubicación geográfica no es válida." });
        }

        const activeAppointments = await proyectsModel.countDocuments({
            idCustomer,
            status: { $nin: ["Finalizado"] }
        });
        if (activeAppointments >= 3) {
            return res.status(400).json({ message: "No puedes tener más de 3 citas activas." });
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
            clientCoordinates: coordinates || undefined,
            clientMapUrl: clientMapUrl || "",
            finalPrice,
            status: "Programado",
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
            clientCoordinates,
            clientMapUrl,
            finalPrice,
            status,
            description
        } = req.body;

        const existingProyect = await proyectsModel.findById(req.params.id);
        if (!existingProyect) {
            return res.status(404).json({ message: "Cita no encontrada." });
        }

        const coordinates = normalizeCoordinates(clientCoordinates);
        if (coordinates === undefined || !isSafeMapUrl(clientMapUrl)) {
            return res.status(400).json({ message: "La ubicación geográfica no es válida." });
        }

        const service = await servicesModel.findById(idService);
        if (!service || service.status !== true) {
            return res.status(400).json({ message: "No se puede actualizar una cita con un servicio inactivo o inexistente." });
        }

        const datesChanged = !isSameUtcDay(dateStart, existingProyect.dateStart)
            || !isSameUtcDay(dateEnd, existingProyect.dateEnd);
        if (datesChanged && (!validateWeekday(dateStart) || !validateWeekday(dateEnd))) {
            return res.status(400).json({ message: "No se pueden programar citas en sábado o domingo." });
        }

        const employeeChanged = idEmpleado && String(idEmpleado) !== String(existingProyect.idEmpleado);
        if (employeeChanged) {
            const employee = await empleadoModel.findOne({
                _id: idEmpleado,
                status: true,
                services: idService
            });
            if (!employee) {
                return res.status(400).json({ message: "El empleado debe estar activo y prestar el servicio seleccionado." });
            }
        }

        const requestedStatus = status === "Pendiente" ? "Programado" : status;
        if (!APPOINTMENT_STATUSES.includes(requestedStatus)) {
            return res.status(400).json({ message: "El estado de la cita no es válido." });
        }

        const isCompleted = req.body.isCompleted === true || requestedStatus === "Finalizado";
        const completionNotes = String(req.body.completionNotes || "").trim();
        if (isCompleted && !completionNotes) {
            return res.status(400).json({ message: "Agrega las observaciones para finalizar la cita." });
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
                ...(coordinates && { clientCoordinates: coordinates }),
                ...(clientMapUrl !== undefined && { clientMapUrl }),
                finalPrice,
                status: isCompleted ? "Finalizado" : requestedStatus,
                isCompleted,
                completionNotes: isCompleted ? completionNotes : "",
                completedAt: isCompleted ? (existingProyect.completedAt || new Date()) : null,
                description
            },
            { new: true, runValidators: true }
        ).populate("idEmpleado", "nombre apellido name lastName");

        return res.json({ message: "Proyect Updated", data: updatedProyect });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "internal server error" });
    }
};

proyectsController.searchByDate = async (req, res) => {
    try {
        await normalizeAppointmentStatuses();
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
