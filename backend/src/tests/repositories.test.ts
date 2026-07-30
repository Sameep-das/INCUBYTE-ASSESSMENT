import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMock = vi.hoisted(() => ({
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    select: vi.fn(),
    selectDistinct: vi.fn(),
    transaction: vi.fn(),
}));

vi.mock("@/config/db.config.js", () => ({
    default: dbMock,
}));

import * as carsRepo from "@/repositories/cars.repository.js";
import * as ordersRepo from "@/repositories/orders.repository.js";
import * as userRepo from "@/repositories/user.repository.js";
import ApplicationError from "@/errors/application.error.js";

const query = (result: unknown) => {
    const q: any = {
        values: vi.fn(() => q),
        set: vi.fn(() => q),
        from: vi.fn(() => q),
        where: vi.fn(() => q),
        innerJoin: vi.fn(() => q),
        groupBy: vi.fn(() => q),
        orderBy: vi.fn(() => q),
        limit: vi.fn(() => q),
        returning: vi.fn(() => Promise.resolve(result)),
        then: (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
            Promise.resolve(result).then(resolve, reject),
    };
    return q;
};

const car = {
    carId: "00000000-0000-0000-0000-000000000001",
    carMake: "Toyota",
    carModel: "Corolla",
    quantity: 2,
    price: "2500000.00",
    category: "SEDAN",
    yearOfManufacturing: 2024,
};

const user = {
    userId: "11111111-1111-1111-1111-111111111111",
    userName: "jane",
    userEmail: "jane@example.com",
    passwordHash: "hash",
    userContact: null,
    city: "Delhi",
    pinCode: "110001",
    state: "Delhi",
    houseNumber: null,
    createdAt: null,
};

const order = {
    orderId: "22222222-2222-2222-2222-222222222222",
    userId: user.userId,
    carId: car.carId,
    amountPaid: car.price,
    dateOfPurchase: null,
};

describe("Repositories", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("creates and mutates cars through Drizzle returning rows", async () => {
        dbMock.insert.mockReturnValue(query([car]));
        dbMock.update.mockReturnValue(query([car]));
        dbMock.delete.mockReturnValue(query([{ carId: car.carId }]));

        await expect(carsRepo.createCar(car as any)).resolves.toEqual(car);
        await expect(carsRepo.updateCarPrice(car.carModel, "2600000.00")).resolves.toEqual(car);
        await expect(carsRepo.updateCarQuantity(car.carModel, 5)).resolves.toEqual(car);
        await expect(carsRepo.updateCarPartially(car.carId, { price: "2700000.00" })).resolves.toEqual(car);
        await expect(carsRepo.updateCarCompletely(car.carId, car as any)).resolves.toEqual(car);
        await expect(carsRepo.updateCarCategory(car.carId, "SUV")).resolves.toEqual(car);
        await expect(carsRepo.updateCarMake(car.carId, "Honda")).resolves.toEqual(car);
        await expect(carsRepo.updateCarModel(car.carId, "Civic")).resolves.toEqual(car);
        await expect(carsRepo.deleteCar(car.carId)).resolves.toEqual({ carId: car.carId });
    });

    it("reads cars by common filters", async () => {
        dbMock.select.mockReturnValue(query([car]));
        dbMock.selectDistinct.mockReturnValue(query([{ make: "Honda" }, { make: "Toyota" }]));

        await expect(carsRepo.findCarById(car.carId)).resolves.toEqual(car);
        await expect(carsRepo.findCarsByCategory("SEDAN")).resolves.toEqual([car]);
        await expect(carsRepo.findAllCars()).resolves.toEqual([car]);
        await expect(carsRepo.findCarsByPriceRange("1000", "3000000")).resolves.toEqual([car]);
        await expect(carsRepo.findCarsByMake("Toyota")).resolves.toEqual([car]);
        await expect(carsRepo.findCarByModel("Corolla")).resolves.toEqual(car);
        await expect(carsRepo.findCarsByYear(2024)).resolves.toEqual([car]);
        await expect(carsRepo.findCarsByFilters({ make: "toy", model: "cor", category: "SEDAN", minPrice: 1, maxPrice: 5 }))
            .resolves.toEqual([car]);
        await expect(carsRepo.findDistinctMakes()).resolves.toEqual(["Honda", "Toyota"]);
    });

    it("purchases a car in a transaction and rejects out-of-stock rows", async () => {
        dbMock.transaction.mockImplementationOnce(async (callback) => callback({
            update: vi.fn(() => query([car])),
        }));

        await expect(carsRepo.purchase(car.carId)).resolves.toEqual(car);

        dbMock.transaction.mockImplementationOnce(async (callback) => callback({
            update: vi.fn(() => query([])),
        }));

        await expect(carsRepo.purchase(car.carId)).rejects.toBeInstanceOf(ApplicationError);
    });

    it("creates and reads orders with dashboard aggregate helpers", async () => {
        dbMock.insert.mockReturnValue(query([order]));
        dbMock.select.mockReturnValue(query([order]));

        await expect(ordersRepo.placeOrder(user.userId, car.carId, car.price)).resolves.toEqual(order);
        await expect(ordersRepo.getOrdersByUserId(user.userId)).resolves.toEqual([order]);
        await expect(ordersRepo.getOrdersByCarId(car.carId)).resolves.toEqual([order]);
        await expect(ordersRepo.getAllOrders()).resolves.toEqual([order]);

        const salesByMake = [{ make: "Toyota", ordersCount: 2, totalRevenue: 5000000 }];
        const topModels = [{ model: "Corolla", ordersCount: 2 }];
        dbMock.select.mockReturnValueOnce(query(salesByMake));
        await expect(ordersRepo.getSalesByMake()).resolves.toEqual(salesByMake);
        dbMock.select.mockReturnValueOnce(query(topModels));
        await expect(ordersRepo.getTopCarModels()).resolves.toEqual(topModels);
    });

    it("creates a user and manages refresh-token records", async () => {
        dbMock.transaction.mockImplementationOnce(async (callback) => callback({
            insert: vi.fn()
                .mockReturnValueOnce(query([user]))
                .mockReturnValueOnce(query([{ userId: user.userId }])),
        }));

        await expect(userRepo.createUser(user as any, {
            refreshToken: "hashed-refresh",
            expiresAt: new Date("2026-08-06T00:00:00.000Z"),
        })).resolves.toEqual(user);

        dbMock.select.mockReturnValue(query([user]));
        dbMock.update.mockReturnValue(query([user]));
        dbMock.insert.mockReturnValue(query([{ userId: user.userId, refreshToken: "hash" }]));
        dbMock.delete.mockReturnValue(query([{ userId: user.userId }]));

        await expect(userRepo.findByEmail(user.userEmail)).resolves.toEqual(user);
        await expect(userRepo.findById(user.userId)).resolves.toEqual(user);
        await expect(userRepo.getUserId(user.userEmail)).resolves.toBe(user.userId);
        await expect(userRepo.updatePassword(user.userId, "new-hash")).resolves.toEqual(user);
        await expect(userRepo.updateRefreshToken(user.userId, "hash", new Date())).resolves.toEqual(user);
        await expect(userRepo.addRefreshToken(user.userId, "hash", new Date())).resolves.toEqual({ userId: user.userId, refreshToken: "hash" });
        await expect(userRepo.getRefreshToken(user.userId)).resolves.toEqual(user);
        await expect(userRepo.deleteRefreshToken(user.userId)).resolves.toEqual({ userId: user.userId });
    });

    it("rotates refresh tokens transactionally", async () => {
        dbMock.select.mockReturnValue(query([{ userId: user.userId }]));
        dbMock.transaction.mockImplementationOnce(async (callback) => callback({
            execute: vi.fn().mockResolvedValue([{ refreshToken: "old", expiresAt: new Date("2026-08-06T00:00:00.000Z") }]),
            delete: vi.fn(() => query([{ userId: user.userId }])),
            insert: vi.fn(() => query([{ userId: user.userId }])),
        }));

        await expect(userRepo.rotateRefreshToken(user.userEmail, async () => ({
            updatedData: {
                refreshToken: "new-hash",
                expiresAt: new Date("2026-08-06T00:00:00.000Z"),
            },
            response: {
                user: {
                    userName: user.userName,
                    userEmail: user.userEmail,
                },
                refreshToken: "refresh",
                accessToken: "access",
            },
        }))).resolves.toEqual({
            userId: user.userId,
            user: {
                userName: user.userName,
                userEmail: user.userEmail,
            },
            refreshToken: "refresh",
            accessToken: "access",
        });
    });

    it("returns null for refresh rotation when no user or token row exists", async () => {
        dbMock.select.mockReturnValueOnce(query([]));
        await expect(userRepo.rotateRefreshToken("missing@example.com", vi.fn())).resolves.toBeNull();

        dbMock.select.mockReturnValueOnce(query([{ userId: user.userId }]));
        dbMock.transaction.mockImplementationOnce(async (callback) => callback({
            execute: vi.fn().mockResolvedValue([]),
        }));

        await expect(userRepo.rotateRefreshToken(user.userEmail, vi.fn())).resolves.toBeNull();
    });
});
