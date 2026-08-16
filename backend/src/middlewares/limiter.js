import rateLimit from "express-rate-limit"

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, //tiempo (5 min)
    max: 5,
    message: {
        status: 429,
        error: "Too many request"
    }
})

export default limiter
