import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import { RegisterProducerUserCase } from "../../usecases/auth/register/register-producer.usecase";
import {
  registerInputMocks,
  userDatabaseMocks,
  testConstants,
} from "../mocks";

// Mock UserRepository and AuthenticationService used inside the use case
jest.mock("../../repositories/user.repository", () => {
  return {
    UserRepository: jest.fn().mockImplementation(() => ({
      findByEmail: jest.fn(),
      createProducer: jest.fn(),
    })),
  };
});

jest.mock("../../services/authentication.service", () => {
  return {
    AuthenticationService: jest.fn().mockImplementation(() => ({
      hashPassword: jest.fn(),
      sign: jest.fn(),
    })),
  };
});

describe("RegisterProducerUserCase - integration", () => {
  const baseInput = registerInputMocks.validProducer;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should register producer and return token + user", async () => {
    const usecase = new RegisterProducerUserCase();
    const repoInstance = (usecase as any).repository as any;
    const authInstance = (usecase as any).authService as any;

    // email not taken
    (repoInstance.findByEmail as any).mockResolvedValueOnce(null);
    (repoInstance.createProducer as any).mockResolvedValueOnce(userDatabaseMocks.producerUser.uid);
    (authInstance.hashPassword as any).mockResolvedValueOnce("hashed-password");

    // after create, findByEmail returns the created user
    (repoInstance.findByEmail as any).mockResolvedValueOnce(userDatabaseMocks.producerUser);

    (authInstance.sign as any).mockReturnValue(testConstants.defaultTokens.producer);

    const result = await usecase.execute(baseInput as any);

    expect(result.token).toBe(testConstants.defaultTokens.producer);
    expect(result.user.role).toBe("producer");
    expect(result.user.email).toBe(baseInput.email);
    expect(repoInstance.createProducer).toHaveBeenCalled();
  });

  test("should error when email already exists", async () => {
    const usecase = new RegisterProducerUserCase();
    const repoInstance = (usecase as any).repository as any;

    // Setup email already exists
    (repoInstance.findByEmail as any).mockResolvedValueOnce(userDatabaseMocks.existingUser);

    await expect(usecase.execute(baseInput as any)).rejects.toThrow(/Email já cadastrado/i);
  });

  test("should register producer with default reputation when not provided", async () => {
    const usecase = new RegisterProducerUserCase();
    const repoInstance = (usecase as any).repository as any;
    const authInstance = (usecase as any).authService as any;

    const inputWithoutReputation = registerInputMocks.producerWithoutReputation;

    (repoInstance.findByEmail as any).mockResolvedValueOnce(null);
    (repoInstance.createProducer as any).mockResolvedValueOnce("uid-789");
    (authInstance.hashPassword as any).mockResolvedValueOnce("hashed-password");

    (repoInstance.findByEmail as any).mockResolvedValueOnce({
      ...userDatabaseMocks.producerUser,
      uid: "uid-789",
      id: "uid-789",
      email: inputWithoutReputation.email,
      name: inputWithoutReputation.name,
      phone_number: inputWithoutReputation.phone_number,
      collection_capacity_kg: inputWithoutReputation.collection_capacity_kg,
      accepted_waste_types: inputWithoutReputation.accepted_waste_types,
      reputation: { average_rating: 0, total_reviews: 0 },
    });

    (authInstance.sign as any).mockReturnValue("jwt-token-789");

    const result = await usecase.execute(inputWithoutReputation as any);

    expect(result.token).toBe("jwt-token-789");
    expect(result.user.reputation.average_rating).toBe(0);
    expect(result.user.reputation.total_reviews).toBe(0);
  });
});
