import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../../src/app.js";

const buildCarPayload = (overrides: Record<string, unknown> = {}) => ({
	carMake: "Toyota",
	carModel: `Corolla-${Date.now()}`,
	quantity: 10,
	price: 2500000,
	category: "SEDAN",
	yearOfManufacturing: 2024,
	...overrides,
});

describe("Cars Routes", () => {
	describe("GET /api/cars", () => {
		it("should return all cars", async () => {
			const response = await request(app).get("/api/cars");

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.message).toEqual(expect.any(String));
		});
	});

	describe("GET /api/cars/:id", () => {
		it("should return a car by id", async () => {
			const response = await request(app).get("/api/cars/00000000-0000-0000-0000-000000000001");

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.carId).toBe("00000000-0000-0000-0000-000000000001");
		});

		it("should reject an unknown car id", async () => {
			const response = await request(app).get("/api/cars/11111111-1111-1111-1111-111111111111");

			expect(response.status).toBe(404);
			expect(response.body.success).toBe(false);
		});
	});

	describe("GET /api/cars?q=<filter>", () => {
		it("should return cars filtered by make", async () => {
			const response = await request(app).get("/api/cars?q=make=Toyota");

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.message).toEqual(expect.any(String));
		});

		it("should return cars filtered by search text", async () => {
			const response = await request(app).get("/api/cars?q=search=searchText");

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.message).toEqual(expect.any(String));
		});
	});

	describe("POST /api/cars/:id/purchase", () => {
		it("should purchase a car", async () => {
			const response = await request(app)
				.post("/api/cars/00000000-0000-0000-0000-000000000001/purchase")
				.send({ quantity: 1 });

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.message).toEqual(expect.any(String));
		});

		it("should reject missing quantity", async () => {
			const response = await request(app)
				.post("/api/cars/00000000-0000-0000-0000-000000000001/purchase")
				.send({});

			expect(response.status).toBe(400);
			expect(response.body.success).toBe(false);
		});
	});

	describe("GET /api/admin/cars", () => {
		it("should return all cars for admin", async () => {
			const response = await request(app).get("/api/admin/cars");

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.message).toEqual(expect.any(String));
		});
	});

	describe("GET /api/admin/cars/:id", () => {
		it("should return a car for admin by id", async () => {
			const response = await request(app).get("/api/admin/cars/00000000-0000-0000-0000-000000000001");

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.carId).toBe("00000000-0000-0000-0000-000000000001");
		});
	});

	describe("POST /api/admin/cars", () => {
		it("should create a car", async () => {
			const payload = buildCarPayload();
			const response = await request(app)
				.post("/api/admin/cars")
				.send(payload);

			expect(response.status).toBe(201);
			expect(response.body.success).toBe(true);
			expect(response.body.message).toEqual(expect.any(String));
			expect(response.body.carModel).toBe(payload.carModel);
		});

		it("should reject missing car model", async () => {
			const { carModel, ...payload } = buildCarPayload();
			const response = await request(app)
				.post("/api/admin/cars")
				.send(payload);

			expect(response.status).toBe(400);
			expect(response.body.success).toBe(false);
		});
	});

	describe("PUT /api/admin/cars:id", () => {
		it("should update a car", async () => {
			const payload = buildCarPayload({ price: 2750000 });
			const response = await request(app)
				.put("/api/admin/cars/00000000-0000-0000-0000-000000000001")
				.send(payload);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.message).toEqual(expect.any(String));
		});
	});

	describe("DELETE /api/admin/cars:id", () => {
		it("should delete a car", async () => {
			const response = await request(app)
				.delete("/api/admin/cars/00000000-0000-0000-0000-000000000001");

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.message).toEqual(expect.any(String));
		});
	});

	describe("POST /api/admin/cars:id", () => {
		it("should update a car partially or trigger an admin action", async () => {
			const response = await request(app)
				.post("/api/admin/cars/00000000-0000-0000-0000-000000000001")
				.send({ price: 3000000 });

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.message).toEqual(expect.any(String));
		});
	});
});
