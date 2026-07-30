import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "@/app.js";
import { generateToken } from "@/utils/jwt.utils.js";
import env from "@/config/env.config.js";

vi.mock("@/services/cars.service.js", () => ({
    fetchAllCars: vi.fn(),
    getCarById: vi.fn(),
    createCar: vi.fn(),
    updateCarRecord: vi.fn(),
    deleteCarRecord: vi.fn(),
    restockCar: vi.fn(),
}));

vi.mock("@/repositories/orders.repository.js", () => ({
    getSalesByMake: vi.fn(),
    getTopCarModels: vi.fn(),
}));

import * as ordersRepo from "@/repositories/orders.repository.js";

const mockedOrdersRepo = vi.mocked(ordersRepo);

const adminToken = () => generateToken(
    { userName: env.ADMIN_NAME, userEmail: env.ADMIN_EMAIL },
    env.JWT_SECRET_ACCESS_TOKEN,
    "15m",
);

describe("Admin Stats Routes", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("requires admin authentication for dashboard stats", async () => {
        const response = await request(app).get("/api/admin/stats/dashboard");

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });

    it("returns horizontal bar chart data for sales by make", async () => {
        const salesByMake = [
            { make: "Toyota", ordersCount: 3, totalRevenue: 7500000 },
            { make: "Honda", ordersCount: 1, totalRevenue: 2100000 },
        ];
        mockedOrdersRepo.getSalesByMake.mockResolvedValue(salesByMake);

        const response = await request(app)
            .get("/api/admin/stats/sales-by-make")
            .set("Authorization", `Bearer ${adminToken()}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ success: true, data: salesByMake });
    });

    it("returns top 10 model data for the line chart", async () => {
        const topModels = [
            { model: "Corolla", ordersCount: 5 },
            { model: "Civic", ordersCount: 4 },
        ];
        mockedOrdersRepo.getTopCarModels.mockResolvedValue(topModels);

        const response = await request(app)
            .get("/api/admin/stats/top-models")
            .set("Authorization", `Bearer ${adminToken()}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ success: true, data: topModels });
        expect(mockedOrdersRepo.getTopCarModels).toHaveBeenCalledWith(10);
    });

    it("returns both dashboard charts in one response", async () => {
        const salesByMake = [{ make: "Toyota", ordersCount: 3, totalRevenue: 7500000 }];
        const topModels = [{ model: "Corolla", ordersCount: 5 }];
        mockedOrdersRepo.getSalesByMake.mockResolvedValue(salesByMake);
        mockedOrdersRepo.getTopCarModels.mockResolvedValue(topModels);

        const response = await request(app)
            .get("/api/admin/stats/dashboard")
            .set("Authorization", `Bearer ${adminToken()}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            data: {
                salesByMake,
                topModels,
            },
        });
    });
});
