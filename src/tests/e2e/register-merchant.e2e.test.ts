import request from "supertest";
import { Express } from "express";
import * as dotenv from "dotenv";
import { HttpStatus } from "../../http/protocols-enums";
import { setupTest } from "../test-utils/setup-test";

dotenv.config();

let app: Express;

beforeAll(async () => {
  app = setupTest();
});

describe("POST /api/auth/merchant/register", () => {
  it("should register a new merchant and return 201", async () => {
    const timestamp = Date.now();
    const merchantData = {
      email: `test-merchant-${timestamp}@example.com`,
      password: "password123",
      name: "Test Merchant",
      phone_number: "11999999999",
      role: "merchant" as const,
      tax_id: `12.345.${String(timestamp).slice(-3)}/0001-90`,
      legal_name: "Test Merchant Legal Name",
      address: {
        street: "Test Street",
        number: "123",
        neighborhood: "Test Neighborhood",
        city: "Test City",
        state: "SP",
        zip_code: "12345-678",
      },
      location: {
        latitude: -23.5505,
        longitude: -46.6333,
        geohash: "6gyf4bf"
      }
    };

    const response = await request(app)
      .post("/api/auth/merchant/register")
      .send(merchantData);
    
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user");
    expect(response.body.user).toHaveProperty("email", merchantData.email);
  });

  it("should return 400 for invalid merchant data", async () => {
    const response = await request(app)
      .post("/api/auth/merchant/register")
      .send({ email: "invalid" });

    expect(response.status).toBe(400);
  });
});
