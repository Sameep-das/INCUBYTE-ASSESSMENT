import { beforeEach, describe, expect, it, vi } from "vitest";
import ApplicationError from "@/errors/application.error.js";
import { CarAlreadyExistsError, CarNotFoundError } from "@/errors/cars.error.js";

vi.mock("@/repositories/cars.repository.js", () => ({
    findAllCars: vi.fn(),
    findCarsByFilters: vi.fn(),
    findCarByModel: vi.fn(),
    createCar: vi.fn(),
    updateCarPrice: vi.fn(),
    findCarById: vi.fn(),
    findCarsByCategory: vi.fn(),
    findCarsByPriceRange: vi.fn(),
    purchase: vi.fn(),
    deleteCar: vi.fn(),
    updateCarPartially: vi.fn(),
    updateCarQuantity: vi.fn(),
    findDistinctMakes: vi.fn(),
}));

vi.mock("@/repositories/user.repository.js", () => ({
    findById: vi.fn(),
    getUserId: vi.fn(),
}));

vi.mock("@/repositories/orders.repository.js", () => ({
    placeOrder: vi.fn(),
}));

vi.mock("@/utils/maintenance.store.js", () => ({
    isCarFrozen: vi.fn(),
    freezeCar: vi.fn(),
}));

vi.mock("@/utils/reservation.store.js", () => ({
    getReserved: vi.fn(),
    reserve: vi.fn(),
    release: vi.fn(),
}));

import * as carsService from "@/services/cars.service.js";
import * as carRepo from "@/repositories/cars.repository.js";
import * as userRepo from "@/repositories/user.repository.js";
import * as orderRepo from "@/repositories/orders.repository.js";
import * as maintenanceStore from "@/utils/maintenance.store.js";
import * as reservationStore from "@/utils/reservation.store.js";

const mockedCarRepo = vi.mocked(carRepo);
const mockedUserRepo = vi.mocked(userRepo);
const mockedOrderRepo = vi.mocked(orderRepo);
const mockedMaintenanceStore = vi.mocked(maintenanceStore);
const mockedReservationStore = vi.mocked(reservationStore);

const car = {
    carId: "00000000-0000-0000-0000-000000000001",
    carMake: "Toyota",
    carModel: "Corolla",
    quantity: 2,
    price: "2500000.00",
    category: "SEDAN" as const,
    yearOfManufacturing: 2024,
};

describe("Cars Service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedMaintenanceStore.isCarFrozen.mockReturnValue(false);
        mockedReservationStore.getReserved.mockReturnValue(0);
    });

    it("returns an empty array when there are no cars", async () => {
        mockedCarRepo.findAllCars.mockResolvedValue([]);

        await expect(carsService.fetchAllCars()).resolves.toEqual([]);
    });

    it("validates impossible price ranges before searching", async () => {
        await expect(carsService.searchCars({ minPrice: 300, maxPrice: 100 }))
            .rejects.toMatchObject({ name: "InvalidRequestError", message: "Minimum price cannot exceed maximum price" });
        expect(mockedCarRepo.findCarsByFilters).not.toHaveBeenCalled();
    });

    it("validates negative and invalid category filters", async () => {
        await expect(carsService.searchCars({ minPrice: -1 }))
            .rejects.toMatchObject({ name: "InvalidRequestError", message: "Minimum price cannot be negative" });

        await expect(carsService.searchCars({ category: "TRUCK" as never }))
            .rejects.toMatchObject({ name: "InvalidRequestError", message: "Invalid car category" });
    });

    it("returns filtered cars and reports empty filter results", async () => {
        mockedCarRepo.findCarsByFilters.mockResolvedValueOnce([car]);

        await expect(carsService.searchCars({ make: "toyota" })).resolves.toEqual([car]);

        mockedCarRepo.findCarsByFilters.mockResolvedValueOnce([]);
        await expect(carsService.searchCars({ make: "missing" }))
            .rejects.toBeInstanceOf(ApplicationError);
    });

    it("creates a car when the model does not already exist", async () => {
        mockedCarRepo.findCarByModel.mockResolvedValue(undefined);
        mockedCarRepo.createCar.mockResolvedValue({ carId: car.carId } as any);

        await expect(carsService.createCar(car)).resolves.toEqual({ carId: car.carId });
    });

    it("rejects duplicate car models", async () => {
        mockedCarRepo.findCarByModel.mockResolvedValue(car);

        await expect(carsService.createCar(car)).rejects.toBeInstanceOf(CarAlreadyExistsError);
        expect(mockedCarRepo.createCar).not.toHaveBeenCalled();
    });

    it("returns a car by id unless it is frozen or missing", async () => {
        mockedCarRepo.findCarById.mockResolvedValueOnce(car);
        await expect(carsService.getCarById(car.carId)).resolves.toEqual(car);

        mockedMaintenanceStore.isCarFrozen.mockReturnValueOnce(true);
        await expect(carsService.getCarById(car.carId)).rejects.toBeInstanceOf(ApplicationError);

        mockedCarRepo.findCarById.mockResolvedValueOnce(undefined);
        await expect(carsService.getCarById(car.carId))
            .rejects.toMatchObject({ name: "InvalidRequestError", message: "Car does not exist" });
    });

    it("persists a purchase in the orders repository after stock is decremented", async () => {
        const user = { userId: "11111111-1111-1111-1111-111111111111" };
        const order = {
            orderId: "22222222-2222-2222-2222-222222222222",
            userId: user.userId,
            carId: car.carId,
            amountPaid: car.price,
        };
        mockedUserRepo.findById.mockResolvedValue(user as any);
        mockedCarRepo.findCarById.mockResolvedValue(car);
        mockedCarRepo.purchase.mockResolvedValue({ ...car, quantity: 1 });
        mockedOrderRepo.placeOrder.mockResolvedValue({ ...order, dateOfPurchase: null });

        await expect(carsService.purchaseCar(user.userId, car.carId)).resolves.toEqual({
            ...order,
            dateOfPurchase: null,
        });
        expect(mockedCarRepo.purchase).toHaveBeenCalledWith(car.carId);
        expect(mockedOrderRepo.placeOrder).toHaveBeenCalledWith(user.userId, car.carId, car.price);
        expect(mockedReservationStore.reserve).toHaveBeenCalledWith(car.carId);
        expect(mockedReservationStore.release).toHaveBeenCalledWith(car.carId);
    });

    it("prevents purchase when all visible stock is already reserved", async () => {
        mockedUserRepo.findById.mockResolvedValue({ userId: "11111111-1111-1111-1111-111111111111" } as any);
        mockedCarRepo.findCarById.mockResolvedValue({ ...car, quantity: 1 });
        mockedReservationStore.getReserved.mockReturnValue(1);

        await expect(carsService.purchaseCar("11111111-1111-1111-1111-111111111111", car.carId))
            .rejects.toBeInstanceOf(ApplicationError);
        expect(mockedCarRepo.purchase).not.toHaveBeenCalled();
        expect(mockedOrderRepo.placeOrder).not.toHaveBeenCalled();
    });

    it("releases reservations when order persistence fails", async () => {
        mockedUserRepo.findById.mockResolvedValue({ userId: "11111111-1111-1111-1111-111111111111" } as any);
        mockedCarRepo.findCarById.mockResolvedValue(car);
        mockedCarRepo.purchase.mockResolvedValue({ ...car, quantity: 1 });
        mockedOrderRepo.placeOrder.mockResolvedValue(undefined);

        await expect(carsService.purchaseCar("11111111-1111-1111-1111-111111111111", car.carId))
            .rejects.toMatchObject({ message: "Failed to place order" });
        expect(mockedReservationStore.release).toHaveBeenCalledWith(car.carId);
    });

    it("purchases by authenticated user email", async () => {
        mockedUserRepo.getUserId.mockResolvedValue("11111111-1111-1111-1111-111111111111");
        mockedUserRepo.findById.mockResolvedValue({ userId: "11111111-1111-1111-1111-111111111111" } as any);
        mockedCarRepo.findCarById.mockResolvedValue(car);
        mockedCarRepo.purchase.mockResolvedValue({ ...car, quantity: 1 });
        mockedOrderRepo.placeOrder.mockResolvedValue({ orderId: "22222222-2222-2222-2222-222222222222" } as any);

        await expect(carsService.purchaseCarForUser("jane@example.com", car.carId))
            .resolves.toEqual({ orderId: "22222222-2222-2222-2222-222222222222" });
        expect(mockedUserRepo.getUserId).toHaveBeenCalledWith("jane@example.com");
    });

    it("rejects purchase when the user or car does not exist", async () => {
        await expect(carsService.purchaseCar("", car.carId))
            .rejects.toMatchObject({ name: "InvalidRequestError", message: "User ID is required for purchase" });

        mockedUserRepo.findById.mockResolvedValueOnce(undefined);
        await expect(carsService.purchaseCar("11111111-1111-1111-1111-111111111111", car.carId))
            .rejects.toMatchObject({ name: "InvalidRequestError", message: "User not found" });

        mockedUserRepo.findById.mockResolvedValueOnce({ userId: "11111111-1111-1111-1111-111111111111" } as any);
        mockedCarRepo.findCarById.mockResolvedValueOnce(undefined);
        await expect(carsService.purchaseCar("11111111-1111-1111-1111-111111111111", car.carId))
            .rejects.toBeInstanceOf(CarNotFoundError);
    });

    it("updates, deletes, and restocks cars through repository operations", async () => {
        mockedCarRepo.updateCarPartially.mockResolvedValue({ carId: car.carId });
        mockedCarRepo.deleteCar.mockResolvedValue({ carId: car.carId });
        mockedCarRepo.findCarById.mockResolvedValue(car);
        mockedCarRepo.updateCarQuantity.mockResolvedValue({ carId: car.carId, quantity: 8 } as any);

        await expect(carsService.updateCarRecord(car.carId, { price: "2700000.00" }))
            .resolves.toEqual({ carId: car.carId });
        await expect(carsService.deleteCarRecord(car.carId))
            .resolves.toEqual({ carId: car.carId });
        await expect(carsService.restockCar(car.carId, 8))
            .resolves.toEqual({ carId: car.carId, quantity: 8 });
        expect(mockedMaintenanceStore.freezeCar).toHaveBeenCalledWith(car.carId);
    });

    it("returns category and make filter options", async () => {
        mockedCarRepo.findDistinctMakes.mockResolvedValue(["Honda", "Toyota"]);

        await expect(carsService.getCarFilterOptions()).resolves.toEqual({
            categories: ["SUV", "HATCHBACK", "SEDAN", "CONVERTIBLE", "COUPE", "WAGON", "VAN", "JEEP", "MUV"],
            makes: ["Honda", "Toyota"],
        });
    });
});
