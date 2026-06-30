const logoutController = {};

logoutController.logoutCliente = async (req, res) => {

    res.clearCookie("authClienteCookie");

    return res.status(200).json({ message: "Sign out" });
};

export default logoutController;