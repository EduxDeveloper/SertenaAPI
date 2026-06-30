//Array de funciones
const logoutController = {};

logoutController.logoutEmpleado = async (req, res) => {

    res.clearCookie("authEmpleadoCookie");

    return res.status(200).json({ message: "Sign out" });
};

export default logoutController;
