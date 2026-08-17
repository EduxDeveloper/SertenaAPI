import { clearCookieOptions } from "../utils/cookieOptions.js";

const logoutController = {};

logoutController.logoutCliente = async (req, res) => {

    res.clearCookie("authClienteCookie", clearCookieOptions);

    return res.status(200).json({ message: "Sign out" });
};

export default logoutController;
