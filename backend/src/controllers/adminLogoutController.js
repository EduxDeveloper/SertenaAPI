import { clearCookieOptions } from "../utils/cookieOptions.js";

//Array de funciones
const logoutController = {};

logoutController.logoutAdmin = async (req, res) => {

    res.clearCookie("authAdminCookie", clearCookieOptions);

    return res.status(200).json({ message: "Sign out" });
};

export default logoutController;
