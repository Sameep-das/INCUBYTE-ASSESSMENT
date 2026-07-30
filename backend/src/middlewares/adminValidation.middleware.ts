import type { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

const carCategoriesEnum = z.enum(["SUV", "HATCHBACK", "SEDAN", "CONVERTIBLE", "COUPE", "WAGON", "VAN", "JEEP", "MUV"]);

export const createCarSchema = z.object({
    carModel: z.string().min(1, "Car model is required"),
    carMake: z.string().min(1, "Car make is required"),
    quantity: z.number().int().min(0, "Quantity must be a positive integer"),
    price: z.number().min(0, "Price must be a positive number").or(z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format")),
    category: carCategoriesEnum,
    yearOfManufacturing: z.number().int().min(1886).max(new Date().getFullYear() + 1).optional()
});

export const updateCarSchema = createCarSchema.partial();

export const restockSchema = z.object({
    quantity: z.number().int().min(0, "Quantity must be a positive integer")
});

export const validateCreateCar = (req: Request, res: Response, next: NextFunction) => {
    try {
        req.body = createCarSchema.parse(req.body);
        next();
    } catch (error: any) {
        const message = error instanceof ZodError ? error.issues : error.message;
        res.status(400).json({ success: false, message });
    }
};

export const validateUpdateCar = (req: Request, res: Response, next: NextFunction) => {
    try {
        req.body = updateCarSchema.parse(req.body);
        next();
    } catch (error: any) {
        const message = error instanceof ZodError ? error.issues : error.message;
        res.status(400).json({ success: false, message });
    }
};

export const validateRestock = (req: Request, res: Response, next: NextFunction) => {
    try {
        req.body = restockSchema.parse(req.body);
        next();
    } catch (error: any) {
        const message = error instanceof ZodError ? error.issues : error.message;
        res.status(400).json({ success: false, message });
    }
};
