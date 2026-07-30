import type { RequestHandler, Request, Response, NextFunction } from "express";
import env from "@/config/env.config.js";

const allowedOrigins = [
    env.FRONTEND_URL,
    "http://localhost:5173",
];

const csrfProtection : RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;

    if (!origin || !allowedOrigins.includes(origin)) {
        return res.status(403).json({
            success: false,
            message: "Forbidden origin",
        });
    }
    next();
}

export default csrfProtection;