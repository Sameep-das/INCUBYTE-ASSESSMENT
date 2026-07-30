import type { Request, Response, NextFunction } from "express";
import * as adminService from "@/services/admin.service.js";
import * as carsService from "@/services/cars.service.js";
import env from "@/config/env.config.js";
import asyncHandler from "@/utils/asyncHandler.js";
import ApplicationError from "@/errors/application.error.js";
import { setRefreshTokenInCookies } from "@/utils/cookies.utils.js";

export const loginAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    let { name, email, password } = req.body;
    name = name.trim();
    email = email.trim();
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const tokens = await adminService.loginAdmin(name, email, password);

    setRefreshTokenInCookies(res, tokens.refreshToken, 7 * 24 * 60 * 60 * 1000);

    res.status(200).json({
        success: true,
        message: "Admin logged in successfully",
        data: { accessToken: tokens.accessToken }
    });
});

export const logoutAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("refreshToken");
    res.status(200).json({
        success: true,
        message: "Admin logged out successfully"
    });
});

export const getAllCars = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const cars = await carsService.fetchAllCars();
    res.status(200).json({
        success: true,
        data: cars
    });
});

export const getCarById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const paramId = req.params;
    const id = Array.isArray(paramId.id) ? paramId.id[0] : paramId.id;
    if (!id) throw new ApplicationError("Car id is required");

    const car = await carsService.getCarById(id);
    res.status(200).json({
        success: true,
        data: car
    });

});

export const createCar = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = await carsService.createCar(req.body);
    res.status(201).json({
        success: true,
        message: "Car created successfully",
        data: result
    });
});

export const updateCar = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const paramId = req.params;
    const id = Array.isArray(paramId.id) ? paramId.id[0] : paramId.id;
    if (!id) throw new ApplicationError("Car id is required");

    const result = await carsService.updateCarRecord(id, req.body);
    res.status(200).json({
        success: true,
        message: "Car updated successfully",
        data: result
    });
});

export const deleteCar = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const paramId = req.params;
    const id = Array.isArray(paramId.id) ? paramId.id[0] : paramId.id;
    if (!id) throw new ApplicationError("Car id is required");

    const result = await carsService.deleteCarRecord(id);
    res.status(200).json({
        success: true,
        message: "Car deleted successfully",
        data: result
    });
});

export const restockCar = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
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
});
