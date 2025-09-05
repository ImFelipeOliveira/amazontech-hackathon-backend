import request from "supertest";
import { Express } from "express";
import * as dotenv from "dotenv";
import { setupTest } from "../test-utils/setup-test";

dotenv.config();

let app: Express;

beforeAll(async () => {
    app = setupTest();
});

describe("POST /api/auth/login", () => {
  let producerEmail: string = "test@gmail.com";
  const producerPassword = "password123";

  beforeAll(async () => {
    producerEmail = `test-login-producer-${Date.now()}@example.com`;
    const producerData = {
      email: producerEmail,
      password: producerPassword,
      name: "Login Test Producer",
      phone_number: "11888888888",
      role: "producer" as const,
      collection_capacity_kg: 100,
      accepted_waste_types: ["frutas", "legumes", "folhagens"],
    };
    await request(app).post("/api/auth/producer/register").send(producerData);
  });

  it("should login a user and return a token", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: producerEmail, password: producerPassword });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("should return 401 for invalid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: producerEmail, password: "wrongpassword" });

    expect(response.status).toBe(401);
  });

  it("should return 400 for invalid login data", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "not-an-email" });

    expect(response.status).toBe(400);
  });
});
