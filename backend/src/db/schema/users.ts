import { pgTable as table, index } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

export const users = table("users", {
    userId: t.uuid("user_id").primaryKey().defaultRandom(),
    userName: t.text("user_name").notNull(),
    userEmail: t.text("email").notNull().unique(),
    passwordHash: t.text("password_hash").notNull(),
    userContact: t.text("user_contact"),
    city: t.text("city").notNull(),
    pinCode: t.text("pin_code").notNull(),
    state: t.text("state").notNull(),
    houseNumber: t.text("house_number"),
    createdAt: t.timestamp("created_at").defaultNow(),
});

export const userRefreshTokens = table("user_refresh_tokens", {
    id: t.uuid("id").primaryKey().defaultRandom(),
    userId: t.uuid("user_id").notNull().references(() => users.userId, { onDelete: "cascade" }),
    refreshToken: t.text("refresh_token").notNull().unique(),
    createdAt: t.timestamp("created_at").defaultNow(),
    expiresAt: t.timestamp("expires_at").notNull(),
}, (c) => [
    index("idx_user_refresh_token_expires_at").on(c.expiresAt),
    index("idx_user_id").on(c.userId),
]);