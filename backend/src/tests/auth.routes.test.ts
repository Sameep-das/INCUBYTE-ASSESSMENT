import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import app from "../../src/app.js";

describe("Authentication Routes", () => {

    describe("POST /api/auth/register", () => {

        it("should register a new user", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "John Doe",
                    email: "john@example.com",
                    password: "Password@123"
                });

            expect(response.status).toBe(201);

            expect(response.body).toHaveProperty("token");

            expect(response.body.user.email)
                .toBe("john@example.com");
        });

        it("should reject duplicate email", async () => {

            await request(app)
                .post("/api/auth/register")
                .send({
                    name: "John",
                    email: "john@example.com",
                    password: "Password@123"
                });

            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Another",
                    email: "john@example.com",
                    password: "Password@123"
                });

            expect(response.status).toBe(409);
        });

        it("should reject missing email", async () => {

            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "John",
                    password: "Password@123"
                });

            expect(response.status).toBe(400);
        });

        it("should reject missing password", async () => {

            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "John",
                    email: "john@example.com"
                });

            expect(response.status).toBe(400);
        });

        it("should reject missing name", async () => {

            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    email: "john@example.com",
                    password: "Password@123"
                });

            expect(response.status).toBe(400);
        });

        it("should reject invalid email", async () => {

            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "John",
                    email: "abc",
                    password: "Password@123"
                });

            expect(response.status).toBe(400);
        });

        it("should reject weak password", async () => {

            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "John",
                    email: "john@example.com",
                    password: "123"
                });

            expect(response.status).toBe(400);
        });

        it("should trim whitespace from email", async () => {

            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "John",
                    email: "  john@example.com ",
                    password: "Password@123"
                });

            expect(response.status).toBe(201);
        });

        it("should reject empty body", async () => {

            const response = await request(app)
                .post("/api/auth/register")
                .send({});

            expect(response.status).toBe(400);
        });

        it("should reject null values", async () => {

            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: null,
                    email: null,
                    password: null
                });

            expect(response.status).toBe(400);
        });

    });

    describe("POST /api/auth/login", () => {

        beforeEach(async () => {

            await request(app)
                .post("/api/auth/register")
                .send({
                    name: "John",
                    email: "john@example.com",
                    password: "Password@123"
                });

        });

        it("should login successfully", async () => {

            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "john@example.com",
                    password: "Password@123"
                });

            expect(response.status).toBe(200);

            expect(response.body).toHaveProperty("token");
        });

        it("should reject wrong password", async () => {

            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "john@example.com",
                    password: "WrongPassword"
                });

            expect(response.status).toBe(401);
        });

        it("should reject unknown email", async () => {

            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "abc@example.com",
                    password: "Password@123"
                });

            expect(response.status).toBe(401);
        });

        it("should reject missing email", async () => {

            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    password: "Password@123"
                });

            expect(response.status).toBe(400);
        });

        it("should reject missing password", async () => {

            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "john@example.com"
                });

            expect(response.status).toBe(400);
        });

        it("should reject invalid email format", async () => {

            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "abc",
                    password: "Password@123"
                });

            expect(response.status).toBe(400);
        });

        it("should reject empty body", async () => {

            const response = await request(app)
                .post("/api/auth/login")
                .send({});

            expect(response.status).toBe(400);
        });

        it("should reject null values", async () => {

            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: null,
                    password: null
                });

            expect(response.status).toBe(400);
        });

    });

});