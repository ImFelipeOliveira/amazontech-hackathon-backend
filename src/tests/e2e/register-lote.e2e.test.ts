import request from "supertest";
import express from "express";
import { initializeDatabase } from "../../shared/config/database";
import { getServiceAccount } from "../../shared/config/service-account";
import loteRoutes from "../../features/routes/lote.routes";
import authRoutes from "../../features/routes/auth.routes";
import { registerInputMocks } from "../mocks";

// Mock external services for E2E tests
jest.mock("../../shared/services/gemini-service", () => {
  return {
    GeminiService: jest.fn().mockImplementation(() => ({
      generateLoteDescription: jest.fn().mockImplementation(() => 
        Promise.resolve("Mocked AI description for lote")
      ),
    })),
  };
});

jest.mock("../../shared/services/storage-service", () => {
  return {
    StorageService: jest.fn().mockImplementation(() => ({
      uploadImage: jest.fn().mockImplementation(() => 
        Promise.resolve("https://mocked-storage-url.com/image.jpg")
      ),
    })),
  };
});

const app = express();

beforeAll(() => {
  const serviceAccount = getServiceAccount();
  initializeDatabase(serviceAccount);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/api", authRoutes);
  app.use("/api", loteRoutes);
});

describe("POST /api/lotes/cadastro - E2E", () => {
  let merchantToken: string;

  beforeEach(async () => {
    // Create a unique email for each test to avoid conflicts
    const uniqueEmail = `merchant_${Date.now()}@precobom.com`;
    
    // Generate a valid CNPJ format: XX.XXX.XXX/XXXX-XX
    const timestamp = Date.now().toString();
    const cnpjBase = timestamp.slice(-8); // Get last 8 digits
    const validTaxId = `${cnpjBase.slice(0,2)}.${cnpjBase.slice(2,5)}.${cnpjBase.slice(5,8)}/0001-${cnpjBase.slice(-2)}`;
    
    const merchantData = {
      ...registerInputMocks.validMerchant,
      email: uniqueEmail,
      tax_id: validTaxId,
      password: "Segredo123", // Valid password with max 12 characters
    };

    // Register a merchant first to get authentication token
    const merchantRegistration = await request(app)
      .post("/api/auth/merchant/register")
      .send(merchantData);

    if (merchantRegistration.status !== 201) {
      console.error("Failed to register merchant:", merchantRegistration.body);
      throw new Error(`Failed to register merchant: ${merchantRegistration.status}`);
    }

    merchantToken = merchantRegistration.body.token;
  });

  test("should register a new lote and return 201", async () => {
    const loteData = {
      weight: 15.5,
      limit_date: new Date("2025-12-31T23:59:59.000Z").toISOString(),
      location: JSON.stringify({
        latitude: 2.8235,
        longitude: -60.6758,
        geohash: "u1h2k3",
      }),
    };

    // Create a simple image buffer for testing
    const imageBuffer = Buffer.from("fake-image-data", "utf8");

    const response = await request(app)
      .post("/api/lotes/cadastro")
      .set("Authorization", `Bearer ${merchantToken}`)
      .field("weight", loteData.weight)
      .field("limit_date", loteData.limit_date)
      .field("location", loteData.location)
      .attach("photo", imageBuffer, "test-photo.jpg");

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("status", "ativo");
    expect(response.body).toHaveProperty("weight", 15.5);
    expect(response.body).toHaveProperty("imageUrl");
    expect(response.body).toHaveProperty("descriptionAI");
    expect(response.body).toHaveProperty("merchantId");
    expect(response.body).toHaveProperty("merchantName");
    expect(response.body).toHaveProperty("created_at");
    expect(response.body.location).toHaveProperty("latitude", 2.8235);
    expect(response.body.location).toHaveProperty("longitude", -60.6758);
  });

  test("should return 400 when photo is missing", async () => {
    const formData = new FormData();
    formData.append("weight", "10.5");
    formData.append("limit_date", "2024-12-31T10:00:00.000Z");
    formData.append(
      "location",
      JSON.stringify({
        latitude: 2.8235,
        longitude: -60.6758,
        geohash: "u1h2k3",
      })
    );

    const response = await request(app)
      .post("/api/lotes/cadastro")
      .set("Authorization", `Bearer ${merchantToken}`)
      .send(formData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toContain("File is required for field 'photo'");
  });

  test("should return 400 when weight is missing", async () => {
    const loteData = {
      limit_date: new Date("2025-12-31T23:59:59.000Z").toISOString(),
      location: JSON.stringify({
        latitude: 2.8235,
        longitude: -60.6758,
        geohash: "u1h2k3",
      }),
    };

    const imageBuffer = Buffer.from("fake-image-data", "utf8");

    const response = await request(app)
      .post("/api/lotes/cadastro")
      .set("Authorization", `Bearer ${merchantToken}`)
      .field("limit_date", loteData.limit_date)
      .field("location", loteData.location)
      .attach("photo", imageBuffer, "test-photo.jpg");
      // No weight field

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toContain("expected string, received undefined");
  });

  test("should return 400 when limit_date is missing", async () => {
    const loteData = {
      weight: "15.5",
      location: JSON.stringify({
        latitude: 2.8235,
        longitude: -60.6758,
        geohash: "u1h2k3",
      }),
    };

    const imageBuffer = Buffer.from("fake-image-data", "utf8");

    const response = await request(app)
      .post("/api/lotes/cadastro")
      .set("Authorization", `Bearer ${merchantToken}`)
      .field("weight", loteData.weight)
      .field("location", loteData.location)
      .attach("photo", imageBuffer, "test-photo.jpg");
      // No limit_date field

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toContain("expected string, received undefined");
  });

  test("should return 400 when location is missing", async () => {
    const loteData = {
      weight: "15.5",
      limit_date: new Date("2025-12-31T23:59:59.000Z").toISOString(),
    };

    const imageBuffer = Buffer.from("fake-image-data", "utf8");

    const response = await request(app)
      .post("/api/lotes/cadastro")
      .set("Authorization", `Bearer ${merchantToken}`)
      .field("weight", loteData.weight)
      .field("limit_date", loteData.limit_date)
      .attach("photo", imageBuffer, "test-photo.jpg");
      // No location field

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  test("should return 401 when no authentication token is provided", async () => {
    const loteData = {
      weight: "15.5",
      limit_date: new Date("2025-12-31T23:59:59.000Z").toISOString(),
      location: JSON.stringify({
        latitude: 2.8235,
        longitude: -60.6758,
        geohash: "u1h2k3",
      }),
    };

    const imageBuffer = Buffer.from("fake-image-data", "utf8");

    const response = await request(app)
      .post("/api/lotes/cadastro")
      // No Authorization header
      .field("weight", loteData.weight)
      .field("limit_date", loteData.limit_date)
      .field("location", loteData.location)
      .attach("photo", imageBuffer, "test-photo.jpg");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error");
  });

  test("should return 401 with invalid authentication token", async () => {
    const loteData = {
      weight: "15.5",
      limit_date: new Date("2025-12-31T23:59:59.000Z").toISOString(),
      location: JSON.stringify({
        latitude: 2.8235,
        longitude: -60.6758,
        geohash: "u1h2k3",
      }),
    };

    const imageBuffer = Buffer.from("fake-image-data", "utf8");

    const response = await request(app)
      .post("/api/lotes/cadastro")
      .set("Authorization", "Bearer invalid-token")
      .field("weight", loteData.weight)
      .field("limit_date", loteData.limit_date)
      .field("location", loteData.location)
      .attach("photo", imageBuffer, "test-photo.jpg");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error");
  });

  test("should return 400 when file size exceeds limit", async () => {
    const loteData = {
      weight: "15.5",
      limit_date: new Date("2025-12-31T23:59:59.000Z").toISOString(),
      location: JSON.stringify({
        latitude: 2.8235,
        longitude: -60.6758,
        geohash: "u1h2k3",
      }),
    };

    // Create a large buffer (6MB - exceeds 5MB limit)
    const largeImageBuffer = Buffer.alloc(6 * 1024 * 1024, "a");

    const response = await request(app)
      .post("/api/lotes/cadastro")
      .set("Authorization", `Bearer ${merchantToken}`)
      .field("weight", loteData.weight)
      .field("limit_date", loteData.limit_date)
      .field("location", loteData.location)
      .attach("photo", largeImageBuffer, "large-photo.jpg");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toMatch(/muito grande|file size|5MB/i);
  });

  test("should return 400 when file is not an image", async () => {
    const loteData = {
      weight: "15.5",
      limit_date: new Date("2025-12-31T23:59:59.000Z").toISOString(),
      location: JSON.stringify({
        latitude: 2.8235,
        longitude: -60.6758,
        geohash: "u1h2k3",
      }),
    };

    const textBuffer = Buffer.from("This is not an image file", "utf8");

    const response = await request(app)
      .post("/api/lotes/cadastro")
      .set("Authorization", `Bearer ${merchantToken}`)
      .field("weight", loteData.weight)
      .field("limit_date", loteData.limit_date)
      .field("location", loteData.location)
      .attach("photo", textBuffer, "document.txt");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toMatch(/imagem|image/i);
  });

  test("should handle invalid weight format", async () => {
    const loteData = {
      weight: "invalid-weight",
      limit_date: new Date("2025-12-31T23:59:59.000Z").toISOString(),
      location: JSON.stringify({
        latitude: 2.8235,
        longitude: -60.6758,
        geohash: "u1h2k3",
      }),
    };

    const imageBuffer = Buffer.from("fake-image-data", "utf8");

    const response = await request(app)
      .post("/api/lotes/cadastro")
      .set("Authorization", `Bearer ${merchantToken}`)
      .field("weight", loteData.weight)
      .field("limit_date", loteData.limit_date)
      .field("location", loteData.location)
      .attach("photo", imageBuffer, "test-photo.jpg");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  test("should handle invalid date format", async () => {
    const loteData = {
      weight: "15.5",
      limit_date: "invalid-date",
      location: JSON.stringify({
        latitude: 2.8235,
        longitude: -60.6758,
        geohash: "u1h2k3",
      }),
    };

    const imageBuffer = Buffer.from("fake-image-data", "utf8");

    const response = await request(app)
      .post("/api/lotes/cadastro")
      .set("Authorization", `Bearer ${merchantToken}`)
      .field("weight", loteData.weight)
      .field("limit_date", loteData.limit_date)
      .field("location", loteData.location)
      .attach("photo", imageBuffer, "test-photo.jpg");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  test("should handle invalid location format", async () => {
    const loteData = {
      weight: "15.5",
      limit_date: new Date("2025-12-31T23:59:59.000Z").toISOString(),
      location: "invalid-json-location",
    };

    const imageBuffer = Buffer.from("fake-image-data", "utf8");

    const response = await request(app)
      .post("/api/lotes/cadastro")
      .set("Authorization", `Bearer ${merchantToken}`)
      .field("weight", loteData.weight)
      .field("limit_date", loteData.limit_date)
      .field("location", loteData.location)
      .attach("photo", imageBuffer, "test-photo.jpg");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });
});
