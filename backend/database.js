import mongoose from "mongoose";

//mongoose.connect("mongodb+srv://sertenaservicios_db_user:lbWHpF93QI6k68ru@sertenacluster.ecu7ybk.mongodb.net/sertenaDB5?appName=SertenaCluster")
mongoose.connect("mongodb://sertenaservicios_db_user:lbWHpF93QI6k68ru@ac-kpcsjnr-shard-00-00.ecu7ybk.mongodb.net:27017,ac-kpcsjnr-shard-00-01.ecu7ybk.mongodb.net:27017,ac-kpcsjnr-shard-00-02.ecu7ybk.mongodb.net:27017/sertenaDB5?ssl=true&replicaSet=atlas-6k5qa7-shard-0&authSource=admin&appName=SertenaCluster")
//Comprobar que todo funciona

//Creo una constante que es igual a la conexión
const connection = mongoose.connection;

connection.once("open", () => {
    console.log("DB is connected")
})

connection.on("disconnected", () => {
    console.log("DB is disconnected")
})

connection.on("error", (error) => {
    console.log("Error found" + error)
})

