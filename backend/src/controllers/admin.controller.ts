import type { Request, Response, NextFunction } from "express";
import * as adminService from "@/services/admin.service.js";
import * as carsService from "@/services/cars.service.js";
import env from "@/config/env.config.js";
import ApplicationError from "@/errors/application.error.js";

export const loginAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const tokens = await adminService.loginAdmin(email, password);

        res.cookie("accessToken", tokens.accessToken, {
            httpOnly: true,
            secure: env.NODE_ENV === "PRODUCTION",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true,
            secure: env.NODE_ENV === "PRODUCTION",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({
            success: true,
            message: "Admin logged in successfully",
            data: { accessToken: tokens.accessToken }
        });
    } catch (error) {
        next(error);
    }
};

export const logoutAdmin = (req: Request, res: Response, next: NextFunction) => {
    try {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.status(200).json({
            success: true,
            message: "Admin logged out successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const getAllCars = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cars = await carsService.fetchAllCars();
        res.status(200).json({
            success: true,
            data: cars
        });
    } catch (error) {
        next(error);
    }
};

export const getCarById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const paramId = req.params;
        const id = Array.isArray(paramId.id) ? paramId.id[0] : paramId.id;
        if (!id) throw new ApplicationError("Car id is required");

        const car = await carsService.getCarById(id);
        res.status(200).json({
            success: true,
            data: car
        });
    } catch (error) {
        next(error);
    }
};

export const createCar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await carsService.createCar(req.body);
        res.status(201).json({
            success: true,
            message: "Car created successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const updateCar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const paramId = req.params;
        const id = Array.isArray(paramId.id) ? paramId.id[0] : paramId.id;
        if (!id) throw new ApplicationError("Car id is required");

        const result = await carsService.updateCarRecord(id, req.body);
        res.status(200).json({
            success: true,
            message: "Car updated successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const deleteCar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const paramId = req.params;
        const id = Array.isArray(paramId.id) ? paramId.id[0] : paramId.id;
        if (!id) throw new ApplicationError("Car id is required");

        const result = await carsService.deleteCarRecord(id);
        res.status(200).json({
            success: true,
            message: "Car deleted successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const restockCar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const paramId = req.params;
        const id = Array.isArray(paramId.id) ? paramId.id[0] : paramId.id;
        if (!id) throw new ApplicationError("Car id is required");

        const { quantity } = req.body;
        const result = await carsService.restockCar(id, quantity);

        res.status(200).json({
            success: true,
            message: "Car restocked successfully. Maintenance window initiated.",
            data: result
        });
    } catch (error) {
        next(error);
    }
};
