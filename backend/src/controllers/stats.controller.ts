import type { Request, Response, NextFunction } from "express";
import * as orderRepo from "@/repositories/orders.repository.js";
import asyncHandler from "@/utils/asyncHandler.js";

export const getSalesByMake = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await orderRepo.getSalesByMake();
    res.status(200).json({
        success: true,
        data: stats
    });
});

export const getTopCarModels = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await orderRepo.getTopCarModels(10);
    res.status(200).json({
        success: true,
        data: stats
    });
});

export const getDashboardStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const [salesByMake, topModels] = await Promise.all([
        orderRepo.getSalesByMake(),
        orderRepo.getTopCarModels(10),
    ]);

    res.status(200).json({
        success: true,
        data: {
            salesByMake,
            topModels
        }
    });
});
