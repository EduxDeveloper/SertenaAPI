import mongoose from "mongoose";
import "../database.js";
import empleadoModel from "../src/models/empleadoModel.js";

try {
    await mongoose.connection.asPromise();

    const result = await empleadoModel.updateMany(
        { status: { $exists: false } },
        [
            {
                $set: {
                    status: {
                        $eq: [
                            { $toLower: { $ifNull: ["$estado", "activo"] } },
                            "activo"
                        ]
                    }
                }
            }
        ],
        { updatePipeline: true }
    );

    console.log(`Empleados migrados: ${result.modifiedCount}`);
} catch (error) {
    console.error("No fue posible migrar el estado de empleados:", error);
    process.exitCode = 1;
} finally {
    await mongoose.connection.close();
}
