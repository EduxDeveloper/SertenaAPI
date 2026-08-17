import app from "./app.js";
import { databaseConnection } from "./database.js";

const port = Number(process.env.PORT) || 4000;

async function startServer() {
    try {
        await databaseConnection;
        app.listen(port, () => {
            console.log(`Server on port ${port}`);
        });
    } catch (error) {
        console.error("Could not connect to the database", error);
        process.exit(1);
    }
}

startServer();
