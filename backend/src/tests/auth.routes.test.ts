import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "@/app.js";
import { DuplicateUserError, InvalidCredentialsError } from "@/errors/auth.errors.js";

vi.mock("@/services/auth.service.js", () => ({
    signUpService: vi.fn(),
    logInService: vi.fn(),
    logOutService: vi.fn(),
    refreshTokenRotationService: vi.fn(),
}));

vi.mock("@/services/cars.service.js", () => ({
    fetchAllCars: vi.fn(),
    searchCars: vi.fn(),
    getCarById: vi.fn(),
    getCarFilterOptions: vi.fn(),
    purchaseCarForUser: vi.fn(),
}));

vi.mock("@/repositories/orders.repository.js", () => ({
    getSalesByMake: vi.fn(),
    getTopCarModels: vi.fn(),
}));

import * as authService from "@/services/auth.service.js";

const mockedAuthService = vi.mocked(authService);

const buildRegisterPayload = (overrides: Record<string, unknown> = {}) => ({
    username: "John",
    email: "john@example.com",
    password: "Password@123",
    city: "Delhi",
    pinCode: "110001",
    state: "Delhi",
    houseNumber: "123",
    phone: "9876543210",
    ...overrides,
});

describe("Authentication Routes", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("registers a new user", async () => {
        mockedAuthService.signUpService.mockResolvedValue({
            user: {
                userId: "00000000-0000-0000-0000-000000000001",
                userName: "john",
                userEmail: "john@example.com",
            },
            accessToken: "access-token",
            refreshToken: "refresh-token",
        });

        const response = await request(app)
            .post("/api/auth/register")
            .send(buildRegisterPayload());

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            userName: "john",
            userEmail: "john@example.com",
            accessToken: "access-token",
            success: true,
            message: "User signed up successfully",
        });
        expect(response.headers["set-cookie"]).toBeDefined();
    });

    it("returns duplicate-user errors from registration", async () => {
        mockedAuthService.signUpService.mockRejectedValue(new DuplicateUserError("User already exists"));

        const response = await request(app)
            .post("/api/auth/register")
            .send(buildRegisterPayload());

        expect(response.status).toBe(409);
        expect(response.body.success).toBe(false);
        expect(response.body.name).toBe("DuplicateUserError");
        expect(response.body.message).toBe("User already exists");
    });

    it("rejects invalid registration payloads before service execution", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send(buildRegisterPayload({ email: "not-email" }));

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.name).toBe("InvalidRequestError");
        expect(mockedAuthService.signUpService).not.toHaveBeenCalled();
    });

    it("logs in an existing user", async () => {
        mockedAuthService.logInService.mockResolvedValue({
            user: {
                userId: "00000000-0000-0000-0000-000000000001",
                userName: "john",
                userEmail: "john@example.com",
            },
            accessToken: "access-token",
            refreshToken: "refresh-token",
        });

        const response = await request(app)
            .post("/api/auth/login")
            .send({ email: "john@example.com", password: "Password@123" });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            userName: "john",
            userEmail: "john@example.com",
            accessToken: "access-token",
            success: true,
            message: "User logged in successfully",
        });
    });

    it("returns invalid-credential errors from login", async () => {
        mockedAuthService.logInService.mockRejectedValue(new InvalidCredentialsError("Invalid credentials", 401));

        const response = await request(app)
            .post("/api/auth/login")
            .send({ email: "john@example.com", password: "Password@123" });

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.name).toBe("InvalidCredentialsError");
        expect(response.body.message).toBe("Invalid credentials");
    });

    it("rejects invalid login payloads before service execution", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({ email: "john@example.com", password: "weak" });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.name).toBe("InvalidRequestError");
        expect(mockedAuthService.logInService).not.toHaveBeenCalled();
    });
});
