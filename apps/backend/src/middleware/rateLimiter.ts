import rateLimit from 'express-rate-limit';

export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 10,                // 10 registration attempts per IP per hour
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many registration attempts, please try again later" },
}
);

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10,                // 10 login attempts per IP per 15 minutes
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many login attempts, please try again later" },
}
);