import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "@/app.js";
import { generateToken } from "@/utils/jwt.utils.js";
import env from "@/config/env.config.js";
import { CarNotFoundError } from "@/errors/cars.error.js";

vi.mock("@/services/cars.service.js", () => ({
    fetchAllCars: vi.fn(),
    searchCars: vi.fn(),
    getCarById: vi.fn(),
    getCarFilterOptions: vi.fn(),
    purchaseCarForUser: vi.fn(),
}));

vi.mock("@/repositories/orders.repository.js", () => ({
    getSalesByMake: vi.fn(),
    getTopCarModels: vi.fn(),
}));

import * as carsService from "@/services/cars.service.js";

const mockedCarsService = vi.mocked(carsService);

const car = {
    carId: "00000000-0000-0000-0000-000000000001",
    carMake: "Toyota",
    carModel: "Corolla",
    quantity: 3,
    price: "2500000.00",
    category: "SEDAN" as const,
    yearOfManufacturing: 2024,
};

describe("Public Cars Routes", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns all cars without authentication", async () => {
        mockedCarsService.fetchAllCars.mockResolvedValue([car]);

        const response = await request(app).get("/api/cars");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            message: "Cars fetched successfully",
            data: [car],
        });
    });

    it("passes supported query filters to the search service", async () => {
        mockedCarsService.searchCars.mockResolvedValue([car]);

        const response = await request(app)
            .get("/api/cars")
            .query({ make: "toy", model: "cor", category: "SEDAN", minPrice: "1000", maxPrice: "3000000" });

        expect(response.status).toBe(200);
        expect(mockedCarsService.searchCars).toHaveBeenCalledWith({
            make: "toy",
            model: "cor",
            category: "SEDAN",
            minPrice: 1000,
            maxPrice: 3000000,
        });
    });

    it("rejects invalid price filters", async () => {
        const response = await request(app)
            .get("/api/cars")
            .query({ minPrice: "not-a-number" });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.name).toBe("InvalidRequestError");
        expect(response.body.message).toBe("Price filters must be valid numbers");
    });

    it("returns a single car by id without authentication", async () => {
        mockedCarsService.getCarById.mockResolvedValue(car);

        const response = await request(app).get(`/api/cars/${car.carId}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            message: "Car fetched successfully",
            data: car,
        });
    });

    it("returns service errors for missing cars", async () => {
        mockedCarsService.getCarById.mockRejectedValue(new CarNotFoundError("Car not found"));

        const response = await request(app).get("/api/cars/11111111-1111-1111-1111-111111111111");

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.name).toBe("CarNotFoundError");
    });

    it("returns car categories and makes for filter lists", async () => {
        mockedCarsService.getCarFilterOptions.mockResolvedValue({
            categories: ["SUV", "SEDAN"],
            makes: ["Honda", "Toyota"],
        });

        const response = await request(app).get("/api/cars/filters");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            message: "Car filter options fetched successfully",
            data: {
                categories: ["SUV", "SEDAN"],
                makes: ["Honda", "Toyota"],
            },
        });
    });

    it("requires login before purchasing a car", async () => {
        const response = await request(app).post(`/api/cars/${car.carId}/purchase`);

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            success: false,
            message: "Unauthorized: No access token provided",
        });
    });

    it("persists a purchase for an authenticated user", async () => {
        const accessToken = generateToken(
            { userName: "Jane", userEmail: "jane@example.com" },
            env.JWT_SECRET_ACCESS_TOKEN,
            "15m",
        );
        const order = {
            orderId: "22222222-2222-2222-2222-222222222222",
            userId: "33333333-3333-3333-3333-333333333333",
            carId: car.carId,
            amountPaid: car.price,
            dateOfPurchase: new Date("2026-07-30T00:00:00.000Z"),
        };
        mockedCarsService.purchaseCarForUser.mockResolvedValue(order as any);

        const response = await request(app)
            .post(`/api/cars/${car.carId}/purchase`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Car purchased successfully");
        expect(response.body.data).toMatchObject({
            orderId: order.orderId,
            userId: order.userId,
            carId: car.carId,
            amountPaid: car.price,
        });
        expect(mockedCarsService.purchaseCarForUser).toHaveBeenCalledWith("jane@example.com", car.carId);
    });
});
