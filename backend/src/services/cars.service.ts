import ApplicationError from "@/errors/application.error.js";
import { InvalidRequestError } from "@/errors/auth.errors.js";
import * as carRepo from "@/repositories/cars.repository.js";
import type { NewCar, Car, CarCategory, SearchCarsDTO } from "@/types/cars.type.js";
import { CarAlreadyExistsError, CarNotFoundError } from "@/errors/cars.error.js";
export const fetchAllCars = async () => {
    const cars = await carRepo.findAllCars();
    if (!cars || cars.length === 0) {
        throw new Error("No cars found");
    }
    return cars;
}

export const searchCars = async (filters: SearchCarsDTO) => {
    const { minPrice, maxPrice } = filters;
    if (
        minPrice !== undefined &&
        maxPrice !== undefined &&
        minPrice > maxPrice
    ) {
        throw new InvalidRequestError("Minimum price cannot exceed maximum price");
    }

    if (minPrice !== undefined && minPrice < 0) {
        throw new InvalidRequestError("Minimum price cannot be negative");
    }

    if (maxPrice !== undefined && maxPrice < 0) {
        throw new InvalidRequestError("Maximum price cannot be negative");
    }
    const result = await carRepo.findCarsByFilters(filters);
    if(!result || result.length === 0) {
        throw new ApplicationError("No cars found matching the provided filters");
    }
    return result;
}

export const createCar = async (newCar: NewCar) => {
    const existingCar = await carRepo.findCarByModel(newCar.carModel);
    if(existingCar) {
        throw new CarAlreadyExistsError(`A car with the model ${newCar.carModel} already exists.`);
    }
    
    const result =  await carRepo.createCar(newCar);
    if(!result) {
        throw new ApplicationError("Failed to create the car");
    }
    return result;
};

export const updateCarPrice = async (carModel: string, updatedPrice: number) => {
    if (updatedPrice < 0) {
        throw new InvalidRequestError("Price cannot be negative");
    }
    const price = updatedPrice.toString();
    const result = await carRepo.updateCarPrice(carModel, price);
    if(!result) {
        throw new ApplicationError("Failed to update the car price");
    }
}

export const getCarById = async (carId: string) => {
    const car = await carRepo.findCarById(carId);
    if(!car) {
        throw new InvalidRequestError(`Car does not exist`);
    }
    return car;
}

export const getCarByModel = async (carModel: string) => {
    const car = await carRepo.findCarByModel(carModel);
    if(!car) {
        throw new InvalidRequestError(`Car does not exist`);
    }
    return car;
}

export const getCarsByCategory = async (category: CarCategory) => {
    const cars = await carRepo.findCarsByCategory(category);
    if(!cars) {
        throw new InvalidRequestError(`No cars found in category ${category}`);
    }
    if(cars.length === 0) {
        throw new CarNotFoundError(`No cars found in category ${category}`);
    }
    return cars;
}

export const getCarsByPriceRange = async (minPrice: number, maxPrice: number) => {
    if (minPrice > maxPrice) {
        throw new InvalidRequestError("Minimum price cannot exceed maximum price");
    }
    if (minPrice < 0 || maxPrice < 0) {
        throw new InvalidRequestError("Price cannot be negative");
    }
    const cars = await carRepo.findCarsByPriceRange(minPrice.toString(), maxPrice.toString());
    if(!cars) {
        throw new InvalidRequestError(`No cars found in the price range ${minPrice} - ${maxPrice}`);
    }
    return cars;
}