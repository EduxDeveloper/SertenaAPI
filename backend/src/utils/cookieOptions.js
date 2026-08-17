const isProduction = process.env.NODE_ENV === "production";

const baseCookieOptions = {
    httpOnly: true,
    path: "/",
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
};

export const cookieOptions = (maxAge) => ({
    ...baseCookieOptions,
    maxAge,
});

export const clearCookieOptions = { ...baseCookieOptions };
