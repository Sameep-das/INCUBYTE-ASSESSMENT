import db from "@/config/db.config.js";
import { cars, carCategories } from "@/db/schema/cars.js";
import ApplicationError from "@/errors/application.error.js";
import { eq, gte, lte, sql, and, ilike } from "drizzle-orm";
import type { NewCar, Car, CarCategory, SearchCarsDTO } from "@/types/cars.type.js";

export async function createCar(newCar: NewCar) {
    const [car] = await db.insert(cars).values(newCar)
        .returning({
            carId: cars.carId,
            carMake: cars.carMake,
            carModel: cars.carModel,
            yearOfManufacturing: cars.yearOfManufacturing,
            price: cars.price,
            category: cars.category
        });
    return car;
}

    
    export async function updateCarPrice(carModel: string, updatedPrice: string) {
        const [car] = await db.update(cars).set({ price: updatedPrice }).where(eq(cars.carModel, carModel)).returning();
        return car;
    }
    
    export async function updateCarQuantity(carModel: string, newQuantity: number) {
        const [car] = await db.update(cars).set({ quantity: newQuantity }).where(eq(cars.carModel, carModel)).returning();
        return car;
    }
    
    export async function updateCarPartially(carId: string, updateData: Partial<NewCar>) {
        const [car] = await db.update(cars).set(updateData).where(eq(cars.carId, carId)).returning({carId: cars.carId});
        return car;
    }
    
    export async function updateCarCompletely(carId: string, newCarData: NewCar) {
        const [car] = await db.update(cars).set(newCarData).where(eq(cars.carId, carId)).returning({carId: cars.carId});
        return car;
    }
    
    export async function updateCarCategory(carId: string, newCategory: CarCategory) {
        const [car] = await db.update(cars).set({ category: newCategory }).where(eq(cars.carId, carId)).returning({carId: cars.carId});
        return car;
    }
    
    export async function updateCarMake(carId: string, newMake: string) {
        const [car] = await db.update(cars).set({ carMake: newMake }).where(eq(cars.carId, carId)).returning({carId: cars.carId});
        return car;
    }
    
    export async function updateCarModel(carId: string, newModel: string) {
        const [car] = await db.update(cars).set({ carModel: newModel }).where(eq(cars.carId, carId)).returning({carId: cars.carId});
        return car;
    }

export async function deleteCar(carId: string) {
    const [car] = await db.delete(cars).where(eq(cars.carId, carId)).returning({carId: cars.carId});
    return car;
}

export async function findCarById(carId: string) {
    const car = await db.select().from(cars).where(eq(cars.carId, carId));
    return car[0];
}
export async function findCarsByCategory(category: CarCategory) {
    const carsList = await db.select().from(cars).where(eq(cars.category, category));
    return carsList;
}

export async function findAllCars() {
    const carsList = await db.select().from(cars);
    return carsList;
}

export async function findCarsByPriceRange(minPrice: string, maxPrice: string) {
    const carsList = await db.select().from(cars).where(and(gte(cars.price, minPrice), lte(cars.price, maxPrice)));
    return carsList;
}

export async function findCarsByMake(make: string) {
    const carsList = await db.select().from(cars).where(eq(cars.carMake, make));
    return carsList;
}

export async function findCarByModel(model: string) {
    const car = await db.select().from(cars).where(eq(cars.carModel, model));
    return car[0];
}

export async function findCarsByYear(year: number) {
    const carsList = await db.select().from(cars).where(eq(cars.yearOfManufacturing, year));
    return carsList;
}

export async function findCarsByFilters(filters: SearchCarsDTO) {
    let conditions = [];
    if (filters.make) {
    conditions.push(ilike(cars.carMake, `%${filters.make}%`));
  }

  if (filters.category) {
    conditions.push(eq(cars.category, filters.category));
  }

  if (filters.minPrice !== undefined) {
    conditions.push(gte(cars.price, filters.minPrice.toString()));
  }

  if (filters.maxPrice !== undefined) {
    conditions.push(lte(cars.price, filters.maxPrice.toString()));
  }

  return db
    .select()
    .from(cars)
    .where(and(...conditions));
}

export async function purchase(carId: string) {
    return db.transaction(async (tx) => {
        const [updatedCar] = await tx
            .update(cars)
            .set({
                quantity: sql`${cars.quantity} - 1`
            })
            .where(
                sql`${cars.carId} = ${carId}
                AND ${cars.quantity} > 0`
            )
            .returning();

        if (!updatedCar) {
            throw new ApplicationError("Car is out of stock");
        }

        return updatedCar;
    });
}