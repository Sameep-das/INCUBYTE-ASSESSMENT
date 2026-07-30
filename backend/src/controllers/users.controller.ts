import type { Request, Response, NextFunction } from "express";
import asyncHandler from "@/utils/asyncHandler.js";
import * as carsService from "@/services/cars.service.js";
import type { CarCategory, SearchCarsDTO } from "@/types/cars.type.js";
import { InvalidRequestError } from "@/errors/auth.errors.js";

const toNumber = (value: unknown) => {
    if (value === undefined) return undefined;
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
        throw new InvalidRequestError("Price filters must be valid numbers");
    }
    return parsed;
};

const firstString = (value: unknown) => Array.isArray(value) ? value[0] : value;

export const getAllCars = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const filters: SearchCarsDTO = {};
    if (typeof req.query.make === "string") filters.make = req.query.make;
    if (typeof req.query.model === "string") filters.model = req.query.model;
    if (typeof req.query.category === "string") filters.category = req.query.category as CarCategory;

    const minPrice = toNumber(req.query.minPrice);
    const maxPrice = toNumber(req.query.maxPrice);
    if (minPrice !== undefined) filters.minPrice = minPrice;
    if (maxPrice !== undefined) filters.maxPrice = maxPrice;

    const hasFilters = Object.values(filters).some((value) => value !== undefined);
    const cars = hasFilters
        ? await carsService.searchCars(filters)
        : await carsService.fetchAllCars();

    res.status(200).json({
        success: true,
        message: "Cars fetched successfully",
        data: cars
    });
});

export const getCarById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = firstString(req.params.id);
    if (!id) throw new InvalidRequestError("Car id is required");

    const car = await carsService.getCarById(id);
    res.status(200).json({
        success: true,
        message: "Car fetched successfully",
        data: car
    });
});

export const getCarFilterOptions = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const options = await carsService.getCarFilterOptions();

    res.status(200).json({
        success: true,
        message: "Car filter options fetched successfully",
        data: options
    });
});

export const purchaseCar = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = firstString(req.params.id);
    if (!id) throw new InvalidRequestError("Car id is required");
    if (!req.userEmail) throw new InvalidRequestError("User email is required for purchase");

    const order = await carsService.purchaseCarForUser(req.userEmail, id);

    res.status(201).json({
        success: true,
        message: "Car purchased successfully",
        data: order
    });
});
