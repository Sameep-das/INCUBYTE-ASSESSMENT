import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import app from "../../src/app.js";

const buildRegisterPayload = (overrides: Record<string, unknown> = {}) => ({
    username: "John",
    email: `john-${Date.now()}@example.com`,
    password: "Password@123",
    city: "Delhi",
    pinCode: "110001",
    state: "Delhi",
    houseNumber: "123",
    phone: "9876543210",
    ...overrides,
});

describe("Authentication Routes", () => {
    describe("POST /api/auth/register", () => {
        it("should register a new user", async () => {
            const payload = buildRegisterPayload();
            const response = await request(app)
                .post("/api/auth/register")
                .send(payload);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("User signed up successfully");
            expect(response.body.accessToken).toEqual(expect.any(String));
            expect(response.body.userName).toBe(payload.username.toLowerCase());
            expect(response.body.userEmail).toBe(payload.email.toLowerCase());
        });

        it("should reject duplicate email", async () => {
            const payload = buildRegisterPayload();

            await request(app)
                .post("/api/auth/register")
                .send(payload);

            const response = await request(app)
                .post("/api/auth/register")
                .send(payload);

            expect(response.status).toBe(409);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("User already exists");
            expect(response.body.name).toBe("DuplicateUserError");
        });

        it("should reject missing email", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    username: "John",
                    password: "Password@123"
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.name).toBe("InvalidRequestError");
        });

        it("should reject missing password", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    username: "John",
                    email: "john@example.com"
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.name).toBe("InvalidRequestError");
        });

        it("should reject missing username", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    email: "john@example.com",
                    password: "Password@123"
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.name).toBe("InvalidRequestError");
        });

        it("should reject invalid email", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send(buildRegisterPayload({ email: "abc" }));

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.name).toBe("InvalidRequestError");
        });

        it("should reject weak password", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send(buildRegisterPayload({ password: "123" }));

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.name).toBe("InvalidRequestError");
        });

        it("should reject empty body", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.name).toBe("InvalidRequestError");
        });

        it("should reject null values", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    username: null,
                    email: null,
                    password: null
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.name).toBe("InvalidRequestError");
        });

        it("should reject missing address fields", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    username: "John",
                    email: "john@example.com",
                    password: "Password@123"
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.name).toBe("InvalidRequestError");
        });
    });

    describe("POST /api/auth/login", () => {
        let loginEmail: string;

        beforeEach(async () => {
            loginEmail = `john-${Date.now()}@example.com`;

            await request(app)
                .post("/api/auth/register")
                .send(buildRegisterPayload({ email: loginEmail }));
        });

        it("should login successfully", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: loginEmail,
                    password: "Password@123"
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("User logged in successfully");
            expect(response.body.accessToken).toEqual(expect.any(String));
            expect(response.body.userName).toEqual(expect.any(String));
            expect(response.body.userEmail).toBe(loginEmail.toLowerCase());
        });

        it("should reject wrong password", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: loginEmail,
                    password: "Wron12@gPassw"
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Invalid credentials");
            expect(response.body.name).toBe("InvalidCredentialsError");
        });

        it("should reject unknown email", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "abc@example.com",
                    password: "Password@123"
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Invalid credentials");
            expect(response.body.name).toBe("InvalidCredentialsError");
        });

        it("should reject missing email", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    password: "Password@123"
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.name).toBe("InvalidRequestError");
        });

        it("should reject missing password", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: loginEmail
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.name).toBe("InvalidRequestError");
        });

        it("should reject invalid email format", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "abc",
                    password: "Password@123"
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.name).toBe("InvalidRequestError");
        });

        it("should reject empty body", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.name).toBe("InvalidRequestError");
        });

        it("should reject null values", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: null,
                    password: null
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.name).toBe("InvalidRequestError");
        });
    });
});