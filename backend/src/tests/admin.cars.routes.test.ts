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

import * as carsService from "@/services/cars.service.js";

const mockedCarsService = vi.mocked(carsService);

const adminToken = () => generateToken(
    { userName: env.ADMIN_NAME, userEmail: env.ADMIN_EMAIL },
    env.JWT_SECRET_ACCESS_TOKEN,
    "15m",
);

const userToken = () => generateToken(
    { userName: "Jane", userEmail: "jane@example.com" },
    env.JWT_SECRET_ACCESS_TOKEN,
    "15m",
);

const buildCarPayload = (overrides: Record<string, unknown> = {}) => ({
    carMake: "Toyota",
    carModel: "Corolla",
    quantity: 10,
    price: 2500000,
    category: "SEDAN",
    yearOfManufacturing: 2024,
    ...overrides,
});

const car = {
    carId: "00000000-0000-0000-0000-000000000001",
    carMake: "Toyota",
    carModel: "Corolla",
    quantity: 10,
    price: "2500000.00",
    category: "SEDAN" as const,
    yearOfManufacturing: 2024,
};

describe("Admin Cars Routes", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("rejects unauthenticated admin car requests", async () => {
        const response = await request(app).get("/api/admin/cars");

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Unauthorized: No access token provided");
    });

    it("rejects non-admin users", async () => {
        const response = await request(app)
            .post("/api/admin/cars")
            .set("Authorization", `Bearer ${userToken()}`)
            .send(buildCarPayload());

        expect(response.status).toBe(403);
        expect(response.body.name).toBe("AuthorisationError");
    });

    it("returns all cars for admins", async () => {
        mockedCarsService.fetchAllCars.mockResolvedValue([car]);

        const response = await request(app)
            .get("/api/admin/cars")
            .set("Authorization", `Bearer ${adminToken()}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ success: true, data: [car] });
    });

    it("returns a car by id for admins", async () => {
        mockedCarsService.getCarById.mockResolvedValue(car);

        const response = await request(app)
            .get(`/api/admin/cars/${car.carId}`)
            .set("Authorization", `Bearer ${adminToken()}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ success: true, data: car });
    });

    it("creates a car for admins", async () => {
        mockedCarsService.createCar.mockResolvedValue({ carId: car.carId } as any);

        const response = await request(app)
            .post("/api/admin/cars")
            .set("Authorization", `Bearer ${adminToken()}`)
            .send(buildCarPayload());

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            success: true,
            message: "Car created successfully",
            data: { carId: car.carId },
        });
    });

    it("returns validation errors for invalid create payloads", async () => {
        const response = await request(app)
            .post("/api/admin/cars")
            .set("Authorization", `Bearer ${adminToken()}`)
            .send(buildCarPayload({ carModel: "" }));

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toEqual(expect.any(Array));
        expect(mockedCarsService.createCar).not.toHaveBeenCalled();
    });

    it("updates a car for admins", async () => {
        mockedCarsService.updateCarRecord.mockResolvedValue({ carId: car.carId });

        const response = await request(app)
            .put(`/api/admin/cars/${car.carId}`)
            .set("Authorization", `Bearer ${adminToken()}`)
            .send({ price: "2750000.00" });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Car updated successfully");
        expect(mockedCarsService.updateCarRecord).toHaveBeenCalledWith(car.carId, { price: "2750000.00" });
    });

    it("deletes a car for admins", async () => {
        mockedCarsService.deleteCarRecord.mockResolvedValue({ carId: car.carId });

        const response = await request(app)
            .delete(`/api/admin/cars/${car.carId}`)
            .set("Authorization", `Bearer ${adminToken()}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Car deleted successfully");
    });

    it("restocks a car for admins", async () => {
        mockedCarsService.restockCar.mockResolvedValue({ carId: car.carId, quantity: 5 } as any);

        const response = await request(app)
            .post(`/api/admin/cars/${car.carId}/restock`)
            .set("Authorization", `Bearer ${adminToken()}`)
            .send({ quantity: 5 });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Car restocked successfully. Maintenance window initiated.");
        expect(mockedCarsService.restockCar).toHaveBeenCalledWith(car.carId, 5);
    });

    it("returns validation errors for invalid restock payloads", async () => {
        const response = await request(app)
            .post(`/api/admin/cars/${car.carId}/restock`)
            .set("Authorization", `Bearer ${adminToken()}`)
            .send({ quantity: -1 });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(mockedCarsService.restockCar).not.toHaveBeenCalled();
    });
});
