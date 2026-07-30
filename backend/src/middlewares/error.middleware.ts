import type { ErrorRequestHandler, Request, Response, NextFunction } from "express";
import type { ErrorSchema } from "@/types/error.types.js";
const errorHandler: ErrorRequestHandler = (
    err:  ErrorSchema,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        name: err.name || "InternalServerError",
        message: err.message || "Something went wrong",
    });
};

export default errorHandler;