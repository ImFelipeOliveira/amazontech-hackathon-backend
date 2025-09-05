import request from "supertest";
import { Express } from "express";
import * as dotenv from "dotenv";
import { setupTest } from "../test-utils/setup-test";

dotenv.config();

let app: Express;

beforeAll(async () => {
  app = setupTest();
});

describe("POST /api/auth/producer/register", () => {
  it("should register a new producer and return 201", async () => {
    const producerData = {
      email: `test-producer-${Date.now()}@example.com`,
      password: "password123",
      name: "Test Producer",
      phone_number: "11999999999",
      role: "producer" as const,
      collection_capacity_kg: 50,
      accepted_waste_types: ["frutas", "legumes"],
    };

    const response = await request(app)
      .post("/api/auth/producer/register")
      .send(producerData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user");
  });

  it("should return 400 for invalid producer data", async () => {
    const response = await request(app)
      .post("/api/auth/producer/register")
      .send({ email: "invalid" });

    expect(response.status).toBe(400);
  });
});
