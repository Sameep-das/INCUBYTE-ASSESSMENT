import { cars, carCategories } from "@/db/schema/cars.js";


export type NewCar = typeof cars.$inferInsert;
export type Car = typeof cars.$inferSelect;
export type CarCategory = typeof carCategories.enumValues[number];
export interface SearchCarsDTO {
  make?: string;
  model?: string;
  category?: CarCategory;
  minPrice?: number;
  maxPrice?: number;
}