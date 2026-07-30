import { type JwtPayload } from "jsonwebtoken";
import {z} from "zod";
import { users, userRefreshTokens } from "@/db/schema/users.js";
export interface JWTObject extends JwtPayload {
    userName: string;
    userEmail: string;
};

export const userSignUpSchema = z.object(
    {
        username: z.string().nonoptional("Username is required").transform(val => val.toLowerCase()),
        email: z.email("Invalid email address").nonoptional("Email is required").transform(val => val.toLowerCase()),
        password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Password must contain at least one uppercase letter, one lowercase letter, one digit and one special character").min(8, "Password must be at least 8 characters long").max(20, "Password must be less than 20 characters").nonoptional("Password is required"),
        city: z.string().nonoptional("City is required"),
        pinCode: z.string().regex(/^\d{6}$/, "Pin code must be a 6-digit number").nonoptional("Pin code is required"),
        state: z.string().nonoptional("State is required"),
        houseNumber: z.string().optional(),
        phone: z.string().regex(/^\d{10}$/, "Phone number must be a 10-digit number").optional(),
    }
);

export const userLogInSchema = z.object({
    email: z.email("Invalid email address").nonoptional("Email is required").transform(val => val.toLowerCase()),
    password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).min(8).max(20)
});

export type RefreshTokenUpdate = {
    refreshToken: string;
    expiresAt: Date;
};

export type Address = {
    city: string;
    state: string;
    pinCode: string;
    houseNumber: string | null | undefined;
};

export type NewUser = typeof users.$inferInsert;
export type UserRefreshToken = typeof userRefreshTokens.$inferInsert;
export type UserSignUpSchema = z.infer<typeof userSignUpSchema>;
export type UserLogInSchema = z.infer<typeof userLogInSchema>;