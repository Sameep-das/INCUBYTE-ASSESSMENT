import { orders } from "@/db/schema/orders.js";
import db from "@/config/db.config.js";
import { eq, sql, desc } from "drizzle-orm";
import { cars } from "@/db/schema/cars.js";
export async function placeOrder(userId: string, carId: string, price: string) {
    const [order] = await db.insert(orders).values({ userId, carId, amountPaid: price }).returning();
    return order;
}

export async function getOrdersByUserId(userId: string) {
    const ordersList = await db.select().from(orders).where(eq(orders.userId, userId));
    return ordersList;
}

export async function getOrdersByCarId(carId: string) {
    const ordersList = await db.select().from(orders).where(eq(orders.carId, carId));
    return ordersList;
}

export async function getAllOrders() {
    const ordersList = await db.select().from(orders);
    return ordersList;
}

export async function getSalesByMake() {
    const result = await db.select({
        make: cars.carMake,
        ordersCount: sql<number>`CAST(COUNT(${orders.orderId}) AS INT)`,
        totalRevenue: sql<number>`CAST(COALESCE(SUM(${orders.amountPaid}), 0) AS FLOAT)`
    })
    .from(orders)
    .innerJoin(cars, eq(orders.carId, cars.carId))
    .groupBy(cars.carMake)
    .orderBy(desc(sql`COUNT(${orders.orderId})`));
    return result;
}

export async function getTopCarModels(limit: number = 10) {
    const result = await db.select({
        model: cars.carModel,
        ordersCount: sql<number>`CAST(COUNT(${orders.orderId}) AS INT)`
    })
    .from(orders)
    .innerJoin(cars, eq(orders.carId, cars.carId))
    .groupBy(cars.carModel)
    .orderBy(desc(sql`COUNT(${orders.orderId})`))
    .limit(limit);
    return result;
}
