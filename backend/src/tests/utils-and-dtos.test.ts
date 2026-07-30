import { describe, expect, it, vi } from "vitest";
import CarDTO from "@/dtos/CarDTO.js";
import SignUpDTO from "@/dtos/SignUpDTO.js";
import LoginDTO from "@/dtos/LogInDTO.js";
import { hash, compare } from "@/utils/bcrypt.utils.js";
import { getRefreshTokenFromCookies, setRefreshTokenInCookies } from "@/utils/cookies.utils.js";
import { generateToken, verifyToken } from "@/utils/jwt.utils.js";
import * as reservationStore from "@/utils/reservation.store.js";
import * as maintenanceStore from "@/utils/maintenance.store.js";
import env from "@/config/env.config.js";

describe("Utilities and DTOs", () => {
    it("reads car values through CarDTO getters", () => {
        const dto = new CarDTO({
            carMake: "Toyota",
            carModel: "Corolla",
            quantity: 1,
            price: "2500000.00",
            category: "SEDAN",
            yearOfManufacturing: 2024,
        });

        expect(dto.getCarMake()).toBe("Toyota");
        expect(dto.getCarModel()).toBe("Corolla");
        expect(dto.getCarCategory()).toBe("SEDAN");
        expect(dto.getCarPrice()).toBe("2500000.00");
        expect(dto.getCarYear()).toBe(2024);
    });

    it("reads signup and login DTO values", () => {
        const signup = new SignUpDTO({
            username: "jane",
            email: "jane@example.com",
            password: "Password@123",
            city: "Delhi",
            pinCode: "110001",
            state: "Delhi",
            houseNumber: "12",
            phone: "9876543210",
        });
        const login = new LoginDTO({ email: "jane@example.com", password: "Password@123" });

        expect(signup.getUserName()).toBe("jane");
        expect(signup.getEmail()).toBe("jane@example.com");
        expect(signup.getPassword()).toBe("Password@123");
        expect(signup.getPhoneNumber()).toBe("9876543210");
        expect(signup.getUserAddress()).toEqual({
            city: "Delhi",
            state: "Delhi",
            pinCode: "110001",
            houseNumber: "12",
        });
        expect(login.getIdentifier()).toBe("jane@example.com");
        expect(login.getPassword()).toBe("Password@123");
    });

    it("hashes and compares passwords", async () => {
        const passwordHash = await hash("Password@123");

        await expect(compare("Password@123", passwordHash)).resolves.toBe(true);
        await expect(compare("Wrong@123", passwordHash)).resolves.toBe(false);
    });

    it("gets and sets refresh-token cookies", () => {
        expect(getRefreshTokenFromCookies({} as any)).toBeUndefined();
        expect(getRefreshTokenFromCookies({ cookies: {} } as any)).toBeUndefined();
        expect(getRefreshTokenFromCookies({ cookies: { refreshToken: "token" } } as any)).toBe("token");

        const response = { cookie: vi.fn() };
        setRefreshTokenInCookies(response as any, "token", 1000);

        expect(response.cookie).toHaveBeenCalledWith("refreshToken", "token", {
            httpOnly: true,
            sameSite: "none",
            path: "/",
            maxAge: 1000,
            secure: env.NODE_ENV === "PRODUCTION",
        });
    });

    it("generates and verifies JWTs and rejects invalid tokens", () => {
        const token = generateToken(
            { userName: "jane", userEmail: "jane@example.com" },
            env.JWT_SECRET_ACCESS_TOKEN,
            "15m",
        );

        expect(verifyToken(token, env.JWT_SECRET_ACCESS_TOKEN)).toMatchObject({
            userName: "jane",
            userEmail: "jane@example.com",
        });
        expect(() => verifyToken("invalid", env.JWT_SECRET_ACCESS_TOKEN))
            .toThrow("Invalid token");
    });

    it("tracks reservations and maintenance windows", () => {
        const carId = "00000000-0000-0000-0000-000000000001";

        expect(reservationStore.getReserved(carId)).toBe(0);
        reservationStore.reserve(carId);
        reservationStore.reserve(carId);
        expect(reservationStore.getReserved(carId)).toBe(2);
        reservationStore.release(carId);
        expect(reservationStore.getReserved(carId)).toBe(1);
        reservationStore.release(carId);
        expect(reservationStore.getReserved(carId)).toBe(0);

        expect(maintenanceStore.isCarFrozen(carId)).toBe(false);
        maintenanceStore.freezeCar(carId);
        expect(maintenanceStore.isCarFrozen(carId)).toBe(true);
    });
});
