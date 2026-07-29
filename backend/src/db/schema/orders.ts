import { pgTable as table, index } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import {users} from "./users.js";
import {cars} from "./cars.js";

export const orders = table("orders", {
    orderId: t.uuid("order_id").primaryKey().defaultRandom(),
    userId: t.uuid("user_id").notNull().references(() => users.userId, { onDelete: "cascade" }),
    carId: t.uuid("car_id").notNull().references(() => cars.carId, { onDelete: "cascade" }),
    amountPaid: t.decimal("amount_paid", { precision: 10, scale: 2 }).notNull(),
    dateOfPurchase: t.timestamp("date_of_purchase").defaultNow(),
}, (c) => [
    index("idx_order_user").on(c.userId),
    index("idx_order_car").on(c.carId),
]);