import { pgTable as table, primaryKey, index, uniqueIndex, check, pgEnum } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const carCategories = pgEnum("car_categories", ["SUV", "HATCHBACK", "SEDAN", "CONVERTIBLE", "COUPE", "WAGON", "VAN", "JEEP", "MUV"]);

export const cars = table("cars", {
    carId: t.uuid("car_id").primaryKey().defaultRandom(),
    carModel: t.text("car_model").notNull().unique(),
    carMake: t.text("car_make").notNull(),
    quantity: t.integer("quantity").notNull(),
    price: t.decimal("price", { precision: 10, scale: 2 }).notNull(),
    category: carCategories("car_category").notNull(),
    yearOfManufacturing: t.integer("year_of_manufacturing"),
}, (c) => [
    index("car_model_index").on(c.carModel),
    index("car_make_index").on(c.carMake),
    index("car_category_index").on(c.category),
    index("car_year_index").on(c.yearOfManufacturing),
    check("price_check", sql`${c.price} >= 0`),
]);